import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import EmbedAllButton from "./components/EmbedAllButton";
import Messages from "./components/Messages";
import QuestionForm from "./components/QuestionForm";
import UploadedFiles from "./components/UploadedFiles";
import { Message } from "./types";
import Chat from "@/components/chat/Chat";
import Footer from "./components/footer";
import { toast } from "@/hooks/use-toast";
import { askQuestion, embedAllPdfs, uploadPdf } from "./services/api";

export const runtime = "edge";

export default function Embed() {
  const [promptValue, setPromptValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isEmbedding, setIsEmbedding] = useState(false);
  const [isAsking, setIsAsking] = useState(false);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const response = await uploadPdf(file);
      const { message, file_path } = response;
      const fileName = file_path.split("/").pop();
      // await embedAllPdfs();

      setMessages((prev) => [
        ...prev,
        { text: `File "${fileName}" uploaded successfully.`, sender: "bot" },
      ]);
    } catch (error: any) {
      console.error("Error uploading PDF:", error);
      const errorMessage =
        error.response?.data?.detail || "Error uploading PDF.";
      setMessages((prev) => [...prev, { text: errorMessage, sender: "bot" }]);
    } finally {
      setIsUploading(false);
    }
  };

  // const handleUrlUpload = async () => {
  //   if (!url) {
  //     alert("Please enter a valid URL!");
  //     return;
  //   }
  //   setIsUploading(true);
  //   try {
  //     const response = await uploadPdfUrl(url);
  //     const { message, file_path } = response;
  //     const fileName = file_path.split("/").pop();
  //
  //     setUploadedFiles((prevFiles) => [...prevFiles, fileName]);
  //     setMessages((prev) => [
  //       ...prev,
  //       {
  //         text: `PDF from URL "${url}" uploaded successfully as "${fileName}".`,
  //         sender: "bot",
  //       },
  //     ]);
  //   } catch (error: any) {
  //     console.error("Error uploading PDF from URL:", error);
  //     const errorMessage =
  //       error.response?.data?.detail || "Error uploading PDF from URL.";
  //     setMessages((prev) => [...prev, { text: errorMessage, sender: "bot" }]);
  //   } finally {
  //     setIsUploading(false);
  //     // setUrl(""); // URL 입력 필드 초기화
  //   }
  // };

  const handleChat = async (prompt: string) => {
    if (!prompt.trim()) return;

    setIsAsking(true);
    setMessages((prev) => [...prev, { text: prompt, sender: "user" }]);
    try {
      const answer = await askQuestion(prompt);
      setMessages((prev) => [...prev, { text: answer, sender: "bot" }]);
      setPromptValue("");
    } catch (error: any) {
      toast({
        title: "Something went wrong",
        description: error as string,
        variant: "destructive",
      });
      setMessages((prev) => [
        ...prev,
        { text: "Error getting answer.", sender: "bot" },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <>
      {!!messages.length ? (
        <Chat>
          {/* <FileUpload */}
          {/*   setMessages={setMessages} */}
          {/*   setUploadedFiles={setUploadedFiles} */}
          {/*   isUploading={isUploading} */}
          {/*   setIsUploading={setIsUploading} */}
          {/* /> */}
          {/* <EmbedAllButton */}
          {/*   setMessages={setMessages} */}
          {/*   isEmbedding={isEmbedding} */}
          {/*   setIsEmbedding={setIsEmbedding} */}
          {/* /> */}
          {/* <UploadedFiles uploadedFiles={uploadedFiles} /> */}
          <Messages
            isLoading={isAsking}
            messages={messages}
          />
          {/* <QuestionForm */}
          {/*   setMessages={setMessages} */}
          {/*   isAsking={isAsking} */}
          {/*   setIsAsking={setIsAsking} */}
          {/* /> */}
        </Chat>
      ) : (
        <div className="h-full w-full">Upload a document to start.</div>
      )}
      <Footer
        promptValue={promptValue}
        setPromptValue={setPromptValue}
        handleFileUpload={handleUpload}
        isLoading={isAsking || isEmbedding || isUploading}
        handleChat={handleChat}
      />
    </>
  );
}
