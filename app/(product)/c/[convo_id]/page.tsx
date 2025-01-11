"use client";
import useConversation from "@/hooks/useConversation";
import { useParams } from "next/navigation";

export const runtime = "edge";

const Page = () => {
  const { convo_id } = useParams();
  const {
    currentConversationMessages,
    currentConversation,
    updateCurrentConversation,
  } = useConversation();
  if (currentConversation?.id !== convo_id) {
    updateCurrentConversation(convo_id as string);
  }
  console.log(convo_id);
  console.log(currentConversationMessages);
};
export default Page;
