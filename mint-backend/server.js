const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const app = express();

const url = "mongodb://localhost:27017/mint-db";
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const conversationSchema = new mongoose.Schema({
    isGroup: { type: Boolean, required: true },
    participants: [{ type: String, ref: "Users" }],
    lastMessage: {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
        content: { type: String, required: true },
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
        username: String,
        email: String,
        profilePicture: String,
        createdAt: Date,
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

app.get("/api/conversations", async (req, res) => {
    let userId = req.headers["authorization"]?.split(" ")[1];

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

app.get("/api/messages", async (req, res) => {
    let conversationId = req.headers["authorization"]?.split(" ")[1];

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

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("message", async (messageData) => {
        const newMessage = new Messages({
            conversationId: messageData.conversationId,
            senderId: messageData.senderId,
            content: messageData.content,
            timestamp: new Date(),
            type: messageData.type,
        });

        try {
            await newMessage.save();

            io.to(messageData.conversationId).emit("message", messageData);

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

    socket.on("disconnect", () => {
        console.log("A user disconnected");
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
    console.log("Listening on port 8081...");
});
