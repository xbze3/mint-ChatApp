import "../components-css/MessageSet.css";

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

interface MessageSectionProps {
    messages: Message[];
}

function MessageSection({ messages }: MessageSectionProps) {
    const userId = localStorage.getItem("userId");

    return (
        <section id="MessageSection">
            {messages.map((message) => (
                <div
                    key={message._id}
                    className={
                        message.senderId._id === userId
                            ? "SentMessage"
                            : "ReceivedMessage"
                    }
                >
                    <div
                        className={
                            message.senderId._id === userId
                                ? "ChatPFPIMGDiv_none"
                                : "ChatPFPIMGDiv"
                        }
                    >
                        <img
                            src={message.senderId.profilePicture}
                            alt={`${message.senderId.username}'s profile`}
                            id="ChatPFPIMG"
                        />
                    </div>
                    <div
                        className={
                            message.senderId._id === userId
                                ? "SMessage"
                                : "RMessage"
                        }
                    >
                        {message.content}
                    </div>
                </div>
            ))}
        </section>
    );
}

export default MessageSection;
