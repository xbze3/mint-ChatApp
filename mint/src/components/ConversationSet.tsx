import { useState, useEffect } from "react";
import "../components-css/ConversationSet.css";
import testIMG from "../assets/testPfpImg.jpeg";
import ListGroup from "react-bootstrap/ListGroup";

interface User {
    _id: string;
    username: string;
}

interface Conversation {
    _id: string;
    isGroup: boolean;
    participants: User[];
    lastMessage?: {
        sender: string;
        content: string;
        timestamp: string;
    };
    lastRead: Record<string, string>;
}

function ConversationSet() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const userId = "6770843b1c2b37f5314eeb86";
                const response = await fetch(
                    "http://localhost:8081/api/conversations",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${userId}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data: Conversation[] = await response.json();
                setConversations(data);
            } catch (error: any) {
                setError(error.message);
                console.error("Error fetching conversations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, []);

    const getUsername = (conversation: Conversation, userId: string) => {
        if (conversation.participants && conversation.participants.length > 1) {
            if (conversation.participants[0]._id !== userId) {
                return conversation.participants[0].username;
            } else {
                return conversation.participants[1].username;
            }
        } else {
            return "Unknown User";
        }
    };

    if (loading) return <div>Loading conversations...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <section id="ConversationSet">
            <ListGroup as="ul">
                {conversations.map((conversation) => (
                    <ListGroup.Item
                        key={conversation._id}
                        as="li"
                        className="d-flex justify-content-between align-items-start chat"
                    >
                        <img src={testIMG} alt="" className="pfpIMG" />
                        <div className="ms-2 me-auto">
                            <div className="fw-bold">
                                {conversation.isGroup
                                    ? "Group Conversation"
                                    : getUsername(
                                          conversation,
                                          "6770843b1c2b37f5314eeb86"
                                      )}
                            </div>
                            <div>
                                {conversation.lastMessage?.content ||
                                    "No message"}
                            </div>
                        </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </section>
    );
}

export default ConversationSet;
