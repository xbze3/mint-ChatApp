import { useState, useEffect } from "react";
import "../components-css/MessageSet.css";
import Form from "react-bootstrap/Form";
import SendButton from "../assets/send.png";
import { Socket } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

interface ChatTextboxProps {
    socket: Socket | null;
    conversationId: string;
}

function ChatTextbox({ socket, conversationId }: ChatTextboxProps) {
    const [message, setMessage] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [profilePicture, setProfilePicture] = useState<string>("");

    const decodeToken = (token: string | null) => {
        if (!token) return null;
        try {
            const decoded: any = jwtDecode(token);
            return decoded.id || null;
        } catch (error) {
            console.error("Failed to decode token:", error);
            return null;
        }
    };

    const token = localStorage.getItem("token");
    const userId = decodeToken(token);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!userId) return;

            try {
                const response = await fetch(
                    "http://localhost:8081/api/getInfo",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token} ${userId}`,
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

        fetchUserInfo();
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
