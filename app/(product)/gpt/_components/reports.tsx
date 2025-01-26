import EmptyChat from "@/components/chat/EmptyChat";
import { ResearchResults } from "@/components/ReportGen/ResearchResults";
import { useReportWebSocket } from "@/hooks/useReportWebSocket";
import { data } from "@/types";
import { preprocessOrderedData } from "@/utils/dataPreprocessing";
import { useEffect, useState } from "react";
import Footer from "./footer";
import Chat from "@/components/chat/Chat";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { ReportType } from "@/types/data";
import Messages from "./Embed/components/Messages";
import { Message } from "./Embed/types";
import { askQuestion, uploadPdf } from "./Embed/services/api";
import useAuth from "@/hooks/useAuth";
import { v4 } from "uuid";

// type TProps = {
//   promptValue: string;
// };
export const runtime = "edge";

export default function Report() {
  const [promptValue, setPromptValue] = useState("");
  const [answer, setAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orderedData, setOrderedData] = useState<data.Data[]>([]);
  const [showHumanFeedback, setShowHumanFeedback] = useState(false);
  const [questionForHuman, setQuestionForHuman] = useState<true | false>(false);
  const [isStopped, setIsStopped] = useState(false);
  const [allLogs, setAllLogs] = useState<any[]>([]);
  const [reportType, setReportType] = useState<
    "general_chat" | "document_chat" | ReportType
  >("general_chat");
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isNewChat, setIsNewChat] = useState(true);

  const { user } = useAuth();

  const chatBoxSettings: data.ChatBoxSettings = {
    report_source: "web",
    report_type: reportType,
    tone: "Objective",
  };

  const { socket, initializeWebSocket } = useReportWebSocket({
    // queryType: researchType,
    setOrderedData,
    setAnswer,
    setLoading: setIsLoading,
    setShowHumanFeedback,
    setQuestionForHuman,
    user,
  });

  const updateReportType = (
    reportType: ReportType | "general_chat" | "document_chat",
  ) => {
    setReportType(reportType);
  };

  const handleChat = async (message: string) => {
    if (socket) {
      setShowResult(true);
      setIsLoading(true);
      setPromptValue("");
      setAnswer("");

      const questionData: data.QuestionData = {
        type: "question",
        content: message,
      };
      setOrderedData((prevOrder) => [...prevOrder, questionData]);

      const data =
        reportType === "general_chat"
          ? "general " +
            JSON.stringify({
              task: promptValue,
              conversation_id: v4(),
              user_id: user?.id,
            })
          : reportType === "document_chat"
            ? "document " +
              JSON.stringify({
                task: promptValue,
                conversation_id: v4(),
                user_id: user?.id,
              })
            : "chat " +
              JSON.stringify({
                message: promptValue,
                conversation_id: v4(),
                user_id: user?.id,
              });
      socket.send(data);
    }
  };
  const handleDisplayResult = (newQuestion: string) => {
    console.log("handledisplayresult");
    setShowResult(true);
    setIsLoading(true);
    setQuestion(newQuestion);
    setPromptValue("");
    setAnswer("");
    setOrderedData((prevOrder) => [
      ...prevOrder,
      { type: "question", content: newQuestion },
    ]);
    setIsNewChat(false);

    initializeWebSocket(newQuestion, chatBoxSettings);
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setOrderedData((prev) => [
      ...prev,
      {
        type: "logs",
        content: "Uploading File",
        output: `Your file is being uploaded...`,
        metadata: null,
        contentAndType: "uploading_file-logs",
      },
    ]);
    try {
      const response = await uploadPdf(file);
      const { message, file_path } = response;
      const fileName = file_path.split("/").pop();
      // await embedAllPdfs();

      setOrderedData((prev) => [
        ...prev,
        {
          type: "logs",
          content: "Uploaded File",
          output: `File ${fileName} uploaded successfully.`,
          metadata: null,
          contentAndType: "file_uploaded-logs",
        },
        {
          type: "question",
          content: "Ask your questions.",
        },
      ]);
    } catch (error: any) {
      console.error("Error uploading PDF:", error);
    } finally {
      setIsLoading(false);
      setShowResult(true);
    }
  };

  const reset = () => {
    setShowResult(false);
    setPromptValue("");
    setAnswer("");
  };

  /**
   * Handles starting a new research
   * - Clears all previous research data and states
   * - Resets UI to initial state
   * - Closes any existing WebSocket connections
   */
  const handleStartNewResearch = () => {
    // Reset UI states
    setShowResult(false);
    setPromptValue("");
    setIsStopped(false);

    // Clear previous research data
    setAnswer("");
    setOrderedData([]);
    setAllLogs([]);

    // Reset feedback states
    setShowHumanFeedback(false);
    setQuestionForHuman(false);

    // Clean up connections
    if (socket) {
      socket.close();
    }
    setIsLoading(false);
  };

  /**
   * Handles stopping the current research
   * - Closes WebSocket connection
   * - Stops loading state
   * - Marks research as stopped
   * - Preserves current results
   */
  const handleStopResearch = () => {
    if (socket) {
      socket.close();
    }
    setIsLoading(false);
    setIsStopped(true);
  };

  /**
   * Processes ordered data into logs for display
   * Updates whenever orderedData changes
   */
  useEffect(() => {
    const groupedData = preprocessOrderedData(orderedData);
    const statusReports = [
      "agent_generated",
      "starting_research",
      "planning_research",
    ];

    const newLogs = groupedData.reduce((acc: any[], data) => {
      // Process accordion blocks (grouped data)
      if (data.type === "accordionBlock") {
        const logs = data.items.map((item: any, subIndex: any) => ({
          header: item.content,
          text: item.output,
          metadata: item.metadata,
          key: `${item.type}-${item.content}-${subIndex}`,
        }));
        return [...acc, ...logs];
      }
      // Process status reports
      else if (statusReports.includes(data.content)) {
        return [
          ...acc,
          {
            header: data.content,
            text: data.output,
            metadata: data.metadata,
            key: `${data.type}-${data.content}`,
          },
        ];
      }
      return acc;
    }, []);

    setAllLogs(newLogs);
  }, [orderedData]);

  return (
    <>
      {showResult ? (
        <Chat>
          {/* {isFileUploaded ? ( */}
          {/*   <Messages */}
          {/*     isLoading={isLoading} */}
          {/*     messages={messages} */}
          {/*   /> */}
          {/* ) : ( */}
          <ResearchResults
            isLoading={isLoading}
            orderedData={orderedData}
            answer={answer}
            allLogs={allLogs}
            handleClickSuggestion={() => {}}
          />
          {/* )} */}
        </Chat>
      ) : (
        <EmptyChat
          handleQuery={(query: string) => {
            handleDisplayResult(query);
          }}
        />
      )}
      <Footer
        handleDisplayResult={handleDisplayResult}
        handleFileUpload={handleFileUpload}
        handleChat={handleChat}
        isLoading={isLoading}
        promptValue={promptValue}
        setPromptValue={setPromptValue}
        reset={reset}
        handleStopResearch={handleStopResearch}
        updateReportType={updateReportType}
        reportType={reportType}
        isFileUploaded={isFileUploaded}
        setIsFileUploaded={setIsFileUploaded}
        isNewChat={isNewChat}
      />
    </>
  );
}
