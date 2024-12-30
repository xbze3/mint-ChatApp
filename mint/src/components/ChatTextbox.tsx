import "../components-css/MessageSet.css";
import Form from "react-bootstrap/Form";
import SendButton from "../assets/send.png";

function ChatTextbox() {
    return (
        <section id="ChatTextbox">
            <Form className="d-flex" id="MessageBox">
                <Form.Control
                    type="send"
                    placeholder="Type a Message..."
                    className="me-2"
                    aria-label="Send"
                />
            </Form>
            <div id="SendButtonDiv">
                <img src={SendButton} alt="" id="SendButton" />
            </div>
        </section>
    );
}

export default ChatTextbox;
