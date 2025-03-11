import ListGroup from "react-bootstrap/ListGroup";
import "../components-css/SearchResults.css";

interface Users {
    _id: string;
    username: string;
    profilePicture: string;
}

interface UsersProps {
    users: Users[];
    userId: string | null;
    token: string | null;
    socket: any;
}

function SearchResults({ users, userId, token, socket }: UsersProps) {
    const startConversation = async (targetUserId: string) => {
        try {
            const response = await fetch(
                "http://localhost:8081/api/start-conversation",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userId, targetUserId }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to start conversation");
            }

            socket.emit("startConversation", userId);
            console.log(userId);
        } catch (error) {
            console.error("Error starting conversation:", error);
        }
    };

    return (
        <div className="search-results-container">
            <ListGroup as="ul">
                {users.map((user) => (
                    <ListGroup.Item
                        as="li"
                        className="d-flex justify-content-between align-items-start searchItem"
                        key={user._id}
                        onClick={() => startConversation(user._id)}
                    >
                        <div className="ms-2 me-auto searchResultItem">
                            <div className="fw-bold">
                                <img
                                    src={user.profilePicture}
                                    alt=""
                                    className="searchResultsPFP"
                                />
                            </div>
                            <div className="userProfile">{user.username}</div>
                        </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    );
}

export default SearchResults;
