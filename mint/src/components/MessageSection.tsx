import { useState, useEffect } from "react";
import "../components-css/MessageSet.css";
import { useConversation } from "./special/ConversationContext";

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

function MessageSection() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { conversationId } = useConversation();

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
                            Authorization: `Bearer ${conversationId}`,
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
    }, [conversationId]);

    if (loading) return <div>Loading messages...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <section id="MessageSection">
            {messages.map((message) => (
                <div
                    key={message._id}
                    className={
                        message.senderId._id === "6770843b1c2b37f5314eeb86"
                            ? "SentMessage"
                            : "ReceivedMessage"
                    }
                >
                    <div
                        className={
                            message.senderId._id === "6770843b1c2b37f5314eeb86"
                                ? "ChatPFPIMGDiv_none"
                                : "ChatPFPIMGDiv"
                        }
                    >
                        <img
                            src={message.senderId.profilePicture}
                            alt={`${message.senderId.username}'s profile`}
                            id="ChatPFPIMG"
                        />
                    </div>
                    <div
                        className={
                            message.senderId._id === "6770843b1c2b37f5314eeb86"
                                ? "SMessage"
                                : "RMessage"
                        }
                    >
                        {message.content}
                    </div>
                </div>
            ))}
        </section>
    );
}

export default MessageSection;
