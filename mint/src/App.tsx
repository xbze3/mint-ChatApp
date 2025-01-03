import NavBar from "./components/NavBar";
import ConversationAndMessageSet from "./components/ConversationAndMessageSet";
import LoginForm from "./components/LoginForm";
import { ConversationProvider } from "./components/special/ConversationContext";

function App() {
    return (
        <>
            <LoginForm />
            {/* <NavBar />
            <ConversationProvider>
                <ConversationAndMessageSet />
            </ConversationProvider> */}
        </>
    );
}

export default App;
