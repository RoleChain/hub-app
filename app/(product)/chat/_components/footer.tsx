import { AuthDialog } from "@/components/Dialogs";
// import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { ReportType } from "@/types/data";
import {
  CircleMinusIcon,
  FileTextIcon,
  LoaderIcon,
  PaperclipIcon,
  SendHorizontalIcon,
  StopCircleIcon,
} from "lucide-react";
import { useState, useRef } from "react";

type TProps = {
  handleFileUpload: (file: File) => Promise<void>;
  isLoading: boolean;
  promptValue: string;
  setPromptValue: React.Dispatch<React.SetStateAction<string>>;
  reset: () => void;
  handleChat: (query: string) => void;
  handleDisplayResult: (query: string) => void;
  updateReportType: (
    reportType: ReportType | "general_chat" | "document_chat",
  ) => void;
  reportType:
    | "research_report"
    | "detailed_report"
    | "general_chat"
    | "document_chat";
  isFileUploaded: boolean;
  setIsFileUploaded: React.Dispatch<React.SetStateAction<boolean>>;
  handleStopResearch: () => void;
  isNewChat: boolean;
};

export default function Footer({
  handleStopResearch,
  handleFileUpload,
  isLoading,
  promptValue,
  setPromptValue,
  reset,
  handleChat,
  handleDisplayResult,
  updateReportType,
  reportType,
  isFileUploaded,
  setIsFileUploaded,
  isNewChat,
}: TProps) {
  const { user } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const queryInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) {
      toast({ title: "Invalid file upload", variant: "destructive" });
      return;
    }
    setFile(file);
    updateReportType("document_chat");
  };

  return user ? (
    <div className="sticky bottom-0 mt-auto flex flex-col gap-4 p-3 md:p-5">
      <div className="relative flex w-full flex-col gap-2 md:gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              className="w-full rounded-lg border px-4 py-2 pr-10 text-sm md:text-base"
              ref={queryInputRef}
              autoFocus
              type="text"
              placeholder={file ? "Upload file" : "Start your research"}
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              onKeyDownCapture={(e) => {
                if (e.key === "Enter") {
                  if (e.shiftKey) return;
                  else {
                    if (!isLoading) {
                      if (reset) reset();
                      if (isNewChat) handleDisplayResult(promptValue);
                      else handleChat(promptValue);
                      setPromptValue("");
                    }
                  }
                }
              }}
              disabled={isLoading || !!file}
            />
            {(reportType === "general_chat" || !isFileUploaded) && (
              <button
                type="button"
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 duration-200 hover:text-accent disabled:cursor-progress sm:hidden",
                  file ? "opacity-0" : "opacity-100"
                )}
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                {!file && <PaperclipIcon className="h-5 w-5" />}
              </button>
            )}
          </div>
          <button
            className="rounded-lg bg-accent px-4 py-2 text-sm md:text-base"
            onClick={() => {
              if (file) {
                handleFileUpload(file).then(() => {
                  setFile(null);
                  setIsFileUploaded(true);
                });
              } else if (isLoading) {
                handleStopResearch();
              } else {
                if (isNewChat) handleDisplayResult(promptValue);
                else handleChat(promptValue);
                setPromptValue("");
              }
            }}
          >
            {file ? (
              <span className="whitespace-nowrap font-medium text-white">
                Upload file
              </span>
            ) : null}
            {isLoading ? (
              <StopCircleIcon className="h-5 w-5" />
            ) : (
              <SendHorizontalIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {(reportType === "general_chat" || !isFileUploaded) && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              disabled={isLoading}
              onChange={handleFileInput}
            />
            <button
              type="button"
              className={cn(
                "absolute bottom-4 left-4 my-auto hidden duration-200 hover:text-accent disabled:cursor-progress sm:block",
                file ? "opacity-0" : "opacity-100"
              )}
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              {!file && <PaperclipIcon />}
            </button>
            <button
              className={cn(
                "absolute right-4 my-auto px-3 text-red-600 duration-200 disabled:text-gray-300",
                file ? "top-4 opacity-100" : "-top-4 opacity-0",
              )}
              onClick={() => setFile(null)}
              disabled={isLoading}
            >
              <CircleMinusIcon />
            </button>
          </>
        )}

        {reportType !== "document_chat" && (
          <div
            className={cn(
              "flex flex-col gap-2 px-1 sm:absolute sm:inset-y-0 sm:right-4 sm:my-auto sm:h-min sm:flex-row sm:gap-4 sm:px-3"
            )}
          >
            <label className="flex items-center gap-2 text-xs opacity-80 sm:text-sm">
              <input
                type="checkbox"
                checked={
                  reportType === "research_report" ||
                  reportType === "detailed_report"
                }
                onChange={(e) =>
                  updateReportType(
                    e.target.checked ? "research_report" : "general_chat"
                  )
                }
                disabled={!!file || isLoading}
              />
              Create Research Paper
            </label>
            <select
              className="w-full rounded px-2 py-1 text-xs disabled:cursor-not-allowed sm:w-auto sm:text-sm"
              disabled={isLoading || reportType == "general_chat"}
              value={reportType}
              onChange={(e) => updateReportType(e.target.value as ReportType)}
            >
              <option value="research_report">Basic report</option>
              <option value="detailed_report">Detailed report</option>
            </select>
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className={"absolute bottom-0 left-0 right-0 isolate bg-white py-5"}>
      <div className="absolute inset-0 -mx-12 h-[1px] w-screen bg-[#dcdcdc]" />
      <div className="mx-auto w-fit">
        <button
          className="w-full rounded-[12px] bg-accent px-4 py-2.5 font-semibold text-accent-foreground hover:bg-[#93B019]"
          onClick={() => setIsAuthDialogOpen(true)}
        >
          Sign up to contribute and earn rewards
        </button>
        <AuthDialog
          isOpen={isAuthDialogOpen}
          toggleIsOpen={() => setIsAuthDialogOpen((prev) => !prev)}
        />
      </div>
    </div>
  );
}
