const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const jwt = require("jsonwebtoken");
const authenticateToken = require("./utils/authMiddleware");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

mongoose.connect("mongodb://localhost:27017/mint-db");
// Uncomment the code below to see db connection output
// .then(() => console.log("Connected to MongoDB"))
// .catch((error) => console.error("Error connecting to MongoDB:", error));

const conversationSchema = new mongoose.Schema({
    isGroup: { type: Boolean, required: true },
    participants: [{ type: String, ref: "Users" }],
    lastMessage: {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
        content: { type: String },
        timestamp: { type: Date, required: true },
    },
    lastRead: {
        type: Map,
        of: Date,
    },
    profilePictureSrc: { type: String },
    name: { type: String },
});

const usersSchema = new mongoose.Schema(
    {
        email: { type: String, unique: true },
        username: { type: String, unique: true },
        profilePicture: String,
        createdAt: { type: Date, default: Date.now },
        password: String,
    },
    { collection: "users" }
);

const messagesSchema = new mongoose.Schema(
    {
        conversationId: {
            type: String,
            ref: "Conversation",
        },
        senderId: { type: String, ref: "Users" },
        content: { type: String },
        timestamp: { type: Date },
        type: { type: String },
    },
    { collection: "messages" }
);

const Conversations = mongoose.model("Conversation", conversationSchema);
const Users = mongoose.model("Users", usersSchema);
const Messages = mongoose.model("Messages", messagesSchema);

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        allowedHeaders: ["Authorization", "Content-Type"],
        credentials: true,
    },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        allowedHeaders: ["Authorization", "Content-Type"],
    })
);

app.get("/api/conversations", authenticateToken, async (req, res) => {
    let userId = req.headers["authorization"]?.split(" ")[2];

    if (!userId) {
        return res.status(400).send("User ID is required");
    }

    try {
        const conversations = await Conversations.find({
            participants: userId,
        })
            .populate("participants", "username profilePicture")
            .populate("lastMessage.sender", "username");

        conversations.forEach((conversation) => {
            conversation.name = getName(conversation, userId);
        });

        res.json(conversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).send("Error fetching conversations");
    }
});

app.post("/api/start-conversation", authenticateToken, async (req, res) => {
    const { userId, targetUserId } = req.body;

    if (!userId || !targetUserId) {
        return res.status(400).json({ message: "User IDs are required" });
    }

    try {
        const existingConversation = await Conversations.findOne({
            participants: { $all: [userId, targetUserId] },
        });

        if (existingConversation) {
            return res.status(200).json(existingConversation);
        }

        const newConversation = new Conversations({
            isGroup: false,
            participants: [userId, targetUserId],
            lastMessage: {
                sender: targetUserId,
                content: "",
                timestamp: new Date(),
            },
        });

        const savedConversation = await newConversation.save();

        res.status(201).json(savedConversation);
    } catch (error) {
        console.error("Error starting conversation:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/api/messages", authenticateToken, async (req, res) => {
    let conversationId = req.headers["authorization"]?.split(" ")[2];

    if (!conversationId) {
        return res.status(400).send("conversationId is required");
    }

    try {
        const messages = await Messages.find({ conversationId })
            .populate("senderId", "username profilePicture")
            .sort({ timestamp: 1 });

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching messages");
    }
});

app.get("/api/getInfo", authenticateToken, async (req, res) => {
    let userId = req.headers["authorization"]?.split(" ")[2];

    if (!userId) {
        return res.status(400).send("User ID is required");
    }

    try {
        const user = await Users.findById(userId, "username profilePicture");

        if (!user) {
            return res.status(404).send("User not found");
        }

        res.json({
            username: user.username,
            profilePicture: user.profilePicture,
        });
    } catch (error) {
        console.error("Error fetching user info:", error);
        res.status(500).send("Error fetching user info");
    }
});

app.get("/search-users", async (req, res) => {
    const { query } = req.query;

    if (!query || query.trim() === "") {
        return res.status(400).json({ error: "Search query is required" });
    }

    try {
        const foundUsers = await Users.find({
            username: new RegExp(query, "i"),
        }).select("_id username profilePicture");

        res.json(foundUsers);
    } catch (err) {
        console.error("Error searching users:", err);
        res.status(500).send("Server error");
    }
});

app.post("/api/login", async (req, res) => {
    const { email_username, password } = req.body;

    try {
        const user = await Users.findOne({
            $or: [{ email: email_username }, { username: email_username }],
        });

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, username: user.username },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            userId: user._id,
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/api/signup", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await Users.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            return res
                .status(400)
                .json({ message: "Email or username already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new Users({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        const token = jwt.sign(
            {
                id: newUser._id,
                email: newUser.email,
                username: newUser.username,
            },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        console.log(token);

        res.status(201).json({
            message: "Sign Up successful",
            token,
            userId: newUser._id,
        });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

io.on("connection", (socket) => {
    // console.log("A user connected"); Uncomment to see log message
    socket.on("message", async (messageData) => {
        io.emit("updateLastMessage", messageData);

        const newMessage = new Messages({
            conversationId: messageData.conversationId,
            senderId: messageData.senderId,
            content: messageData.content,
            timestamp: new Date(),
            type: messageData.type,
        });

        try {
            await newMessage.save();

            io.emit("message", messageData);

            await Conversations.findByIdAndUpdate(messageData.conversationId, {
                lastMessage: {
                    sender: messageData.senderId,
                    content: messageData.content,
                    timestamp: new Date(),
                },
            });
        } catch (error) {
            console.error("Error saving message:", error);
        }
    });

    socket.on("send-message", (data) => {
        io.emit("message-received", updatedConversation);
    });

    socket.on("startConversation", () => {
        io.emit("startConversation");
    });

    socket.on("disconnect", () => {
        // console.log("A user disconnected"); Uncomment to see log message
    });
});

const getName = (conversation, userId) => {
    if (conversation.participants && conversation.participants.length < 3) {
        if (conversation.participants[0]._id == userId) {
            return conversation.participants[1].username;
        } else {
            return conversation.participants[0].username;
        }
    } else {
        return conversation.name;
    }
};

server.listen(8081, "0.0.0.0", () => {
    // console.log("Listening on port 8081..."); Uncomment to see log message
});
