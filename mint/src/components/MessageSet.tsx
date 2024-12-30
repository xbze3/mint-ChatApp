import "../components-css/MessageSet.css";
import MessageSection from "./MessageSection";
import ChatTextbox from "./ChatTextbox";

function MessageSet() {
    return (
        <section id="MessageSet">
            <MessageSection />
            <ChatTextbox />
        </section>
    );
}

export default MessageSet;
