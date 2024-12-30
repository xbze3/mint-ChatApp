import { useState, useEffect } from "react";
import "../components-css/ConversationSet.css";
import groupIMG from "../assets/groupImage.png";
import ListGroup from "react-bootstrap/ListGroup";
import { useConversation } from "./special/ConversationContext";

interface User {
    _id: string;
    username: string;
    profilePicture: string;
}

interface Conversation {
    _id: string;
    name: string;
    isGroup: boolean;
    participants: User[];
    lastMessage: {
        sender: {
            _id: string;
            username: string;
        };
        content: string;
        timestamp: string;
    };
    lastRead: Record<string, string>;
}

function ConversationSet() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>("");
    const { setConversationId } = useConversation();

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const userId = localStorage.getItem("userId");
                setUserId(userId);

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

    const getProfilePhoto = (
        conversation: Conversation,
        userId: string | null
    ) => {
        if (conversation.participants.length < 3) {
            if (conversation.participants[0]._id !== userId) {
                return conversation.participants[0].profilePicture;
            } else {
                return conversation.participants[1].profilePicture;
            }
        } else {
            return groupIMG;
        }
    };

    const isUser = (conversation: Conversation, userId: string | null) => {
        if (conversation.lastMessage.sender._id === userId) {
            return "You";
        } else {
            return conversation.lastMessage.sender.username;
        }
    };

    const openConversation = (conversation: Conversation) => {
        setConversationId(conversation._id);
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
                        onClick={() => openConversation(conversation)}
                    >
                        <img
                            src={getProfilePhoto(conversation, userId)}
                            alt=""
                            className="pfpIMG"
                        />
                        <div className="ms-2 me-auto">
                            <div className="fw-bold">{conversation.name}</div>
                            <div>
                                {isUser(conversation, userId)}:{" "}
                                {conversation.lastMessage.content || ""}
                            </div>
                        </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </section>
    );
}

export default ConversationSet;
