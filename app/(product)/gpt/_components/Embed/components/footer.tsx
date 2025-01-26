import { AuthDialog } from "@/components/Dialogs";
import { toast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  CircleMinusIcon,
  FileTextIcon,
  LoaderIcon,
  PaperclipIcon,
} from "lucide-react";
import { useState, useRef } from "react";

type TProps = {
  handleFileUpload: (file: File) => Promise<void>;
  isLoading: boolean;
  promptValue: string;
  setPromptValue: React.Dispatch<React.SetStateAction<string>>;
  // reset: () => void;
  handleChat: (query: string) => void;
  // handleDisplayResult: (query: string) => void;
  // researchType: "web" | "local";
  // setResearchType: React.Dispatch<React.SetStateAction<"web" | "local">>;
};

export default function Footer({
  handleFileUpload,
  isLoading,
  promptValue,
  setPromptValue,
  handleChat,
}: TProps) {
  const { user } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const queryInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    console.log(e.target.files);
    if (!file) {
      toast({ title: "Invalid file upload", variant: "destructive" });
      return;
    }
    setFile?.(file);
  };

  return user ? (
    <div className="sticky bottom-0 mt-auto flex gap-4 py-5">
      <div className="relative flex h-full w-full flex-col rounded-[12px] border border-[#ECECEC] bg-white outline-accent focus-within:outline">
        <div
          className={cn(
            "flex flex-col gap-2 rounded-lg px-2 py-2 ps-8 duration-300",
            file
              ? "flex translate-y-0 opacity-100"
              : "hidden translate-y-full opacity-0",
          )}
        >
          <span className="block font-medium">
            {isLoading ? "Uploading file" : "Selected file"}
          </span>
          <div className="flex w-fit gap-2 rounded-lg border border-accent bg-[#F6FFD1] px-2 py-2">
            {isLoading ? (
              <LoaderIcon className="animate-spin" />
            ) : (
              <FileTextIcon />
            )}
            <span className="block">{file?.name}</span>
          </div>
        </div>
        <input
          ref={queryInputRef}
          autoFocus
          type="text"
          placeholder={file ? "Upload file" : "Start your research"}
          className="h-full w-full border-none bg-transparent py-2 pe-16 ps-4 focus-within:outline-none disabled:cursor-no-drop"
          value={promptValue}
          onChange={(e) => setPromptValue(e.target.value)}
          onKeyDownCapture={(e) => {
            if (e.key === "Enter") {
              if (e.shiftKey) return;
              else {
                if (!isLoading) {
                  handleChat(promptValue);
                  setPromptValue("");
                }
              }
            }
          }}
          disabled={isLoading || !!file}
        />
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
            "absolute bottom-4 right-4 my-auto px-3 duration-200 hover:text-accent disabled:cursor-progress",
            file ? "opacity-0" : "opacity-100",
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
          onClick={() => setFile?.(null)}
          disabled={isLoading}
        >
          <CircleMinusIcon />
        </button>
      </div>
      <button
        className="flex h-fit items-center gap-4 self-end rounded-[12px] bg-accent p-4 hover:bg-[#93B019] disabled:animate-pulse disabled:cursor-progress"
        onClick={() =>
          file
            ? handleFileUpload(file).then(() => setFile(null))
            : handleChat(promptValue)
        }
        // onClick={() => handleChat(promptValue)}
        disabled={isLoading}
      >
        {file ? (
          <span className="whitespace-nowrap font-medium text-white">
            Upload file
          </span>
        ) : null}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M20.5107 13.5846L6.31372 20.4806C6.04657 20.6126 5.74426 20.6561 5.45074 20.6045C5.15722 20.553 4.88778 20.4092 4.68159 20.194C4.47297 19.9815 4.338 19.7077 4.29651 19.4128C4.25502 19.1179 4.3092 18.8175 4.45109 18.5556L7.3417 13.0749H13.5769C13.8832 13.0749 14.1314 12.8266 14.1314 12.5204C14.1314 12.2142 13.8832 11.9659 13.5769 11.9659H7.56577L4.44476 6.0655C4.30233 5.80446 4.24841 5.50426 4.29109 5.20998C4.33377 4.91569 4.47075 4.64319 4.68146 4.43337L4.70015 4.41468C4.90641 4.20548 5.17357 4.06691 5.46338 4.0188C5.75319 3.97068 6.0508 4.0155 6.31359 4.14683L20.5107 11.043C20.7502 11.1579 20.9523 11.3382 21.0938 11.5631C21.2353 11.7879 21.3104 12.0482 21.3104 12.3138C21.3104 12.5795 21.2353 12.8397 21.0939 13.0646C20.9524 13.2894 20.7502 13.4697 20.5107 13.5846Z"
            fill="white"
          />
        </svg>
      </button>
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
