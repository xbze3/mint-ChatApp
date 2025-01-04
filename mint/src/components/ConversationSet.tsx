import { useState, useEffect } from "react";
import "../components-css/ConversationSet.css";
import groupIMG from "../assets/groupImage.png";
import ListGroup from "react-bootstrap/ListGroup";
import { useConversation } from "./special/ConversationContext";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

interface User {
    _id: string;
    username: string;
    profilePicture: string;
}

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
    const { setConversationId } = useConversation();

    const extractUserIdFromToken = (token: string | null) => {
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
    const userId = extractUserIdFromToken(token);

    const fetchConversations = async () => {
        try {
            const response = await fetch(
                "http://localhost:8081/api/conversations",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token} ${userId}`,
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

    useEffect(() => {
        if (userId) {
            fetchConversations();
        } else {
            setError("User not authenticated");
            setLoading(false);
        }
    }, [userId, token]);

    useEffect(() => {
        const newSocket = io("http://localhost:8081");

        newSocket.on("startConversation", () => {
            fetchConversations();
        });

        newSocket.on("updateLastMessage", (data: Message) => {
            setConversations((prevConversations) =>
                prevConversations.map((conversation) =>
                    conversation._id === data.conversationId
                        ? {
                              ...conversation,
                              lastMessage: {
                                  sender: {
                                      _id: data.senderId._id,
                                      username: data.senderId.username,
                                  },
                                  content: data.content,
                                  timestamp: data.timestamp,
                              },
                          }
                        : conversation
                )
            );
        });

        return () => {
            newSocket.disconnect();
        };
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

    const isUser = (
        conversation: Conversation,
        userId: string | null,
        content: string
    ): string => {
        const sender = conversation.lastMessage?.sender;
        if (content) {
            return sender._id === userId
                ? "You: "
                : sender.username + ": " || "";
        }
        return "";
    };

    const openConversation = (conversation: Conversation) => {
        setConversationId(conversation._id);
    };

    if (loading)
        return (
            <div className="ConversationSetFallback">
                Loading conversations...
            </div>
        );
    if (error)
        return <div className="ConversationSetFallback">Error: {error}</div>;
    if (conversations.length === 0)
        return <div className="ConversationSetFallback">No conversations</div>;

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
                                {isUser(
                                    conversation,
                                    userId,
                                    conversation.lastMessage.content
                                )}
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
