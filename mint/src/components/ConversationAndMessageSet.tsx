import "../components-css/ConversationAndMessageSet.css";
import ConversationSet from "./ConversationSet";
import MessageSet from "./MessageSet";

function ConversationAndMessageSet() {
    return (
        <>
            <section id="ConversationAndMessageSetContainer">
                <ConversationSet />
                <MessageSet />
            </section>
        </>
    );
}

export default ConversationAndMessageSet;
