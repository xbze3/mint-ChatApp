import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import logo from "../assets/mintBanner.png";

function NavBar() {
    return (
        <>
            <Navbar bg="light" data-bs-theme="secondary">
                <Container>
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
        </>
    );
}

export default NavBar;
