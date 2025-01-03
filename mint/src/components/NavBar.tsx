import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import logo from "../assets/mintBanner.png";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "../components-css/NavBar.css";
import { useState, useEffect } from "react";
import StartConversationButton from "../assets/StartConversationButton.svg";
import SearchResults from "./SearchResults";

function NavBar() {
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setUsers([]);
            return;
        }

        const fetchUsers = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8081/search-users?query=${encodeURIComponent(
                        searchQuery
                    )}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, [searchQuery]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const toggleSearchResults = () => {
        setShowResults((prev) => !prev);
    };

    return (
        <>
            <Navbar bg="light" data-bs-theme="secondary">
                <Container>
                    <img
                        src={StartConversationButton}
                        alt=""
                        id="startConversationButton"
                        onClick={toggleSearchResults}
                    />

                    <Navbar.Brand className="ms-auto">
                        <img
                            src={logo}
                            height="45"
                            className="d-inline-block align-top"
                            alt="Your Logo"
                        />
                    </Navbar.Brand>
                </Container>
            </Navbar>

            {showResults && ( // Only show when `showResults` is true
                <div id="userList">
                    <div id="userListContent">
                        <div id="textBoxDiv">
                            <Form
                                className="d-flex"
                                onSubmit={handleSearchSubmit}
                            >
                                <Form.Control
                                    type="search"
                                    placeholder="Username"
                                    className="me-2"
                                    aria-label="Username"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                                <Button variant="outline-success">
                                    Search
                                </Button>
                            </Form>
                        </div>
                        <div id="searchResults">
                            <SearchResults users={users} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default NavBar;
