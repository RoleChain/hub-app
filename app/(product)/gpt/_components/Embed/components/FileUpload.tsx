import React, { useState } from "react";
import { uploadPdf, uploadPdfUrl } from "../services/api";

type TProps = {
  setMessages: React.Dispatch<
    React.SetStateAction<{ text: string; sender: string }[]>
  >;
  isUploading: boolean;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
  setUploadedFiles: React.Dispatch<React.SetStateAction<File[]>>;
};

const FileUpload = ({
  setMessages,
  setUploadedFiles,
  isUploading,
  setIsUploading,
}: TProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files?.length) setFile(files[0]);
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF file first!");
      return;
    }
    setIsUploading(true);
    try {
      const response = await uploadPdf(file);
      const { message, file_path } = response;
      const fileName = file_path.split("/").pop();

      setUploadedFiles((prevFiles) => [...prevFiles, fileName]);
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
      setFile(null); // 파일 선택 초기화
    }
  };

  const handleUrlUpload = async () => {
    if (!url) {
      alert("Please enter a valid URL!");
      return;
    }
    setIsUploading(true);
    try {
      const response = await uploadPdfUrl(url);
      const { message, file_path } = response;
      const fileName = file_path.split("/").pop();

      setUploadedFiles((prevFiles) => [...prevFiles, fileName]);
      setMessages((prev) => [
        ...prev,
        {
          text: `PDF from URL "${url}" uploaded successfully as "${fileName}".`,
          sender: "bot",
        },
      ]);
    } catch (error: any) {
      console.error("Error uploading PDF from URL:", error);
      const errorMessage =
        error.response?.data?.detail || "Error uploading PDF from URL.";
      setMessages((prev) => [...prev, { text: errorMessage, sender: "bot" }]);
    } finally {
      setIsUploading(false);
      setUrl(""); // URL 입력 필드 초기화
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf"
          disabled={isUploading}
        />
        <button
          onClick={handleUpload}
          disabled={isUploading || !file}
          style={{ marginLeft: "10px" }}
        >
          {isUploading ? "Uploading..." : "Upload PDF"}
        </button>
      </div>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={url}
          onChange={handleUrlChange}
          placeholder="Enter PDF URL"
          style={{ width: "60%", marginRight: "10px" }}
          disabled={isUploading}
        />
        <button
          onClick={handleUrlUpload}
          disabled={isUploading || !url}
        >
          {isUploading ? "Uploading..." : "Upload PDF from URL"}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
