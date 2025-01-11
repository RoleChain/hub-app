import { ConversationContext } from "@/contexts/conversation.context";
import { useContext } from "react";

const useConversation = () => {
  const convoContext = useContext(ConversationContext);
  return convoContext;
};

export default useConversation;
