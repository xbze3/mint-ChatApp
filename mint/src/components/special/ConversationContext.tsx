import React, { createContext, useContext, useState } from "react";

interface ConversationContextType {
    conversationId: string | null;
    setConversationId: (id: string | null) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(
    undefined
);

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [conversationId, setConversationId] = useState<string | null>(null);
    return (
        <ConversationContext.Provider
            value={{ conversationId, setConversationId }}
        >
            {children}
        </ConversationContext.Provider>
    );
};

export const useConversation = (): ConversationContextType => {
    const context = useContext(ConversationContext);
    if (!context) {
        throw new Error(
            "useConversation must be used within a ConversationProvider"
        );
    }
    return context;
};
