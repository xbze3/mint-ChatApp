const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

const url = "mongodb://localhost:27017/mint-db";
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const conversationSchema = new mongoose.Schema({
    isGroup: { type: Boolean, required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
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

const Conversations = mongoose.model("Conversation", conversationSchema);
const Users = mongoose.model("Users", usersSchema);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        allowedHeaders: ["Authorization", "Content-Type"],
    })
);

app.get("/api/conversations", async (req, res) => {
    try {
        const conversations = await Conversations.find()
            .populate("participants", "username profilePicture")
            .populate("lastMessage.sender", "username");

        res.json(conversations);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching conversations");
    }
});

app.listen(8081, "0.0.0.0", () => {
    console.log("Listening on port 8081...");
});
