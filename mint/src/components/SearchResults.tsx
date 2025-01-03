import ListGroup from "react-bootstrap/ListGroup";
import "../components-css/SearchResults.css";

interface Users {
    _id: string;
    username: string;
    profilePicture: string;
}

interface UsersProps {
    users: Users[];
}

function SearchResults({ users }: UsersProps) {
    return (
        <div className="search-results-container">
            <ListGroup as="ul">
                {users.map((user) => (
                    <ListGroup.Item
                        as="li"
                        className="d-flex justify-content-between align-items-start searchItem"
                        key={user._id}
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
