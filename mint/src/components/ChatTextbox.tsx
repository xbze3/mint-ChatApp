import { useState, useEffect } from "react";
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
    const [username, setUsername] = useState<string>("");
    const [profilePicture, setProfilePicture] = useState<string>("");

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch(
                    "http://localhost:8081/api/getInfo",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${userId}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch user info");
                }

                const data = await response.json();
                setUsername(data.username);
                setProfilePicture(data.profilePicture);
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        };

        if (userId) {
            fetchUserInfo();
        }
    }, [userId]);

    const handleSendMessage = () => {
        if (!message.trim() || !socket) return;

        const messageData = {
            _id: Date.now().toString(),
            conversationId,
            senderId: {
                _id: userId,
                username: username,
                profilePicture: profilePicture,
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
