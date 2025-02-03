"use client";
import axios from "axios";
import { createContext, useEffect, useState } from "react";

type TConversation = {
  id: string;
  title: string;
  createdAt: string;
  meta?: unknown[];
  created_at: string;
  updated_at: string;
};
type TMessage = {
  id: string;
  conversation_id: string;
  parent_message_id?: string;
  sender: string;
  content: string;
  meta?: unknown[];
  created_at: string;
};

type TConversationContext = {
  conversations: TConversation[];
  currentConversation: TConversation | null;
  currentConversationMessages: TMessage[];
  isLoading: boolean;
  updateCurrentConversation: (str: string) => void;
};

const ConversationContext = createContext<TConversationContext>({
  conversations: [],
  currentConversation: null,
  currentConversationMessages: [],
  isLoading: false,
  updateCurrentConversation: () => {},
});

const ConversationProvider = ({ children }: { children: React.ReactNode }) => {
  const [conversations, setConversations] = useState<TConversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<TConversation | null>(null);
  const [currentConversationMessages, setCurrentConversationMessages] =
    useState<TMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const BASE_URL = "https://api.rolechain.org";
  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get<{ conversations: TConversation[] }>(
        BASE_URL + "/api/v1/conversations",
        {
          withCredentials: true,
        },
      );
      console.log(data);
      setConversations(data.conversations.map((conversation) => conversation));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchCurrentConversationMessages = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get<{ messages: TMessage[] }>(
        `${BASE_URL}/api/v1/conversations/${currentConversation?.id}`,
        {
          withCredentials: true,
        },
      );
      console.log(data);
      setCurrentConversationMessages(data.messages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  const updateCurrentConversation = async (newConversationId: string) => {
    try {
      const { data } = await axios.get<{ conversation: TConversation }>(
        `${BASE_URL}/api/v1/conversations/${newConversationId}`,
        {
          withCredentials: true,
        },
      );
      setCurrentConversation(data.conversation);
    } catch (err) {
      console.error("Could not fetch conversation", err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (currentConversation) fetchCurrentConversationMessages();
  }, [currentConversation?.id]);

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        currentConversation,
        currentConversationMessages,
        isLoading,
        updateCurrentConversation,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export { ConversationContext, ConversationProvider };
