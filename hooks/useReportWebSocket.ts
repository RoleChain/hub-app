"use client";
import { useRef, useState } from "react";
import { data } from "../types";
import { TUser } from "@/contexts/auth.context";
import { v4 } from "uuid";

// const WS_URI = "https://researchai-be-production.up.railway.app/ws";
const WS_URI = "ws://localhost:8000/ws";

type Props = {
  setOrderedData: React.Dispatch<React.SetStateAction<data.Data[]>>;
  setAnswer: React.Dispatch<React.SetStateAction<string>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setShowHumanFeedback: React.Dispatch<React.SetStateAction<boolean>>;
  setQuestionForHuman: React.Dispatch<React.SetStateAction<boolean | true>>;
  user: TUser | null;
};

export const useReportWebSocket = ({
  setOrderedData,
  setAnswer,
  setLoading,
  setShowHumanFeedback,
  setQuestionForHuman,
  user,
}: Props) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  /* const [msgHistory, setMsgHistory] = useState<
    { role: "user" | "assistant"; content: "string" }[]
  >([]); */
  const [conversationId, setConversationId] = useState(v4());
  const heartbeatInterval = useRef<number>();

  const initializeWebSocket = (
    promptValue: string,
    chatBoxSettings: data.ChatBoxSettings,
  ) => {
    const storedConfig = localStorage.getItem("apiVariables");
    const apiVariables = storedConfig ? JSON.parse(storedConfig) : {};
    const headers = {
      retriever: apiVariables.RETRIEVER,
      langchain_api_key: apiVariables.LANGCHAIN_API_KEY,
      openai_api_key: apiVariables.OPENAI_API_KEY,
      tavily_api_key: apiVariables.TAVILY_API_KEY,
      google_api_key: apiVariables.GOOGLE_API_KEY,
      google_cx_key: apiVariables.GOOGLE_CX_KEY,
      bing_api_key: apiVariables.BING_API_KEY,
      searchapi_api_key: apiVariables.SEARCHAPI_API_KEY,
      serpapi_api_key: apiVariables.SERPAPI_API_KEY,
      serper_api_key: apiVariables.SERPER_API_KEY,
      searx_url: apiVariables.SEARX_URL,
    };

    if (!socket && typeof window !== "undefined") {
      // const { protocol } = window.location;
      // let { host } = window.location;
      // host = host.includes("localhost") ? "localhost:8000" : host;
      // https://researchai-report-be-production.up.railway.app:8000/
      // const ws_uri = `wss://researchai-report-be-production.up.railway.app/ws`;
      const ws_uri = WS_URI;

      const newSocket = new WebSocket(ws_uri);
      setSocket(newSocket);

      newSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "human_feedback" && data.content === "request") {
          setQuestionForHuman(data.output);
          setShowHumanFeedback(true);
        } else {
          const contentAndType = `${data.content}-${data.type}`;
          setOrderedData((prevOrder) => [
            ...prevOrder,
            { ...data, contentAndType },
          ]);

          if (data.type === "report") {
            setAnswer((prev: string) => prev + data.output);
          } else if (
            data.type === "path" ||
            data.type === "chat" ||
            data.type == "end"
          ) {
            setLoading(false);
          }
        }
      };

      newSocket.onopen = () => {
        const { report_type, report_source, tone } = chatBoxSettings;
        const data =
          report_type === "general_chat"
            ? "general " +
              JSON.stringify({
                task: promptValue,
                conversation_id: conversationId,
                user_id: user?.id,
              })
            : report_type === "document_chat"
              ? "document " +
                JSON.stringify({
                  task: promptValue,
                  conversation_id: conversationId,
                  user_id: user?.id,
                })
              : "start " +
                JSON.stringify({
                  task: promptValue,
                  report_type,
                  report_source,
                  tone,
                  headers,
                  conversation_id: conversationId,
                  user_id: user?.id,
                });
        newSocket.send(data);
      };

      newSocket.onclose = () => {
        clearInterval(heartbeatInterval.current);
        setLoading(false);
        // setMsgHistory([]);
        setSocket(null);
      };
    }
  };

  return { socket, setSocket, initializeWebSocket };
};
