import { useState, useEffect } from "react";
import "../components-css/MessageSet.css";
import MessageSection from "./MessageSection";
import ChatTextbox from "./ChatTextbox";
import { useConversation } from "./special/ConversationContext";
import { io, Socket } from "socket.io-client";
import Logo from "../assets/mintLogo1.svg";

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

function MessageSet() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { conversationId } = useConversation();
    const [socket, setSocket] = useState<Socket | null>(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchMessages = async () => {
            if (!conversationId) {
                setError("No conversation selected");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    "http://localhost:8081/api/messages",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token} ${conversationId}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data: Message[] = await response.json();
                setMessages(data);
                setError(null);
            } catch (err: unknown) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "An unexpected error occurred"
                );
                console.error("Error fetching messages:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        const newSocket = io("http://localhost:8081");
        setSocket(newSocket);

        newSocket.on("message", (data: Message) => {
            if (data.conversationId == conversationId) {
                setMessages((prev) => [...prev, data]);
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [conversationId]);

    if (loading) return <div>Loading messages...</div>;
    if (error)
        return (
            <div id="TempLogoDiv">
                <img src={Logo} alt="" id="TempLogo" />
            </div>
        );

    return (
        <section id="MessageSet">
            <MessageSection messages={messages} />

            <ChatTextbox
                socket={socket}
                conversationId={conversationId || ""}
            />
        </section>
    );
}

export default MessageSet;
