import { useState } from "react";
import "../components-css/MessageSet.css";
import Form from "react-bootstrap/Form";
import SendButton from "../assets/send.png";
import { Socket } from "socket.io-client";

interface Message {
    _id: string;
    conversationId: string;
    senderId: {
        _id: string;
        username: string;
        profilePicture: string;
    };
    content: string;
    timestamp: string;
    type: string;
}

interface ChatTextboxProps {
    socket: Socket | null;
    conversationId: string;
    userId: string;
    addMessage: (message: Message) => void;
}

function ChatTextbox({
    socket,
    conversationId,
    userId,
    addMessage,
}: ChatTextboxProps) {
    const [message, setMessage] = useState<string>("");

    const handleSendMessage = () => {
        if (!message.trim() || !socket) return;

        const messageData = {
            _id: Date.now().toString(),
            conversationId,
            senderId: {
                _id: userId,
                username: "You",
                profilePicture: "path/to/default/profile.png",
            },
            content: message,
            timestamp: new Date().toISOString(),
            type: "text",
        };

        socket.emit("message", messageData);

        addMessage(messageData);

        setMessage("");
    };

    return (
        <section id="ChatTextbox">
            <Form
                className="d-flex"
                id="MessageBox"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                }}
            >
                <Form.Control
                    type="text"
                    placeholder="Type a Message..."
                    className="me-2"
                    aria-label="Send"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
            </Form>
            <div id="SendButtonDiv" onClick={handleSendMessage}>
                <img src={SendButton} alt="Send" id="SendButton" />
            </div>
        </section>
    );
}

export default ChatTextbox;
