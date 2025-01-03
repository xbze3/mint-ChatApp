import NavBar from "./components/NavBar";
import ConversationAndMessageSet from "./components/ConversationAndMessageSet";
import { ConversationProvider } from "./components/special/ConversationContext";

function App() {
    return (
        <>
            <ConversationProvider>
                <NavBar />
                <ConversationAndMessageSet />
            </ConversationProvider>
        </>
    );
}

export default App;
