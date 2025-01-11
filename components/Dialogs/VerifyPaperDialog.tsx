import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import axios from "axios";

export function VerifyPaperDialog({
  isOpen,
  toggleIsOpen,
}: {
  isOpen: boolean;
  toggleIsOpen: () => void;
}) {
  const { toast } = useToast();
  const [publicationDoi, setPublicationDoi] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        "https://research-ai-backend-production.up.railway.app/api/research/doi",
        { doi: publicationDoi },
        { withCredentials: true },
      );
      console.log(data);
      setPublicationDoi("");
      toast({ title: "Verification successfull" });
      toggleIsOpen();
    } catch (err) {
      toast({
        title: "Unexpected Error. Please check DOI",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      onOpenChange={toggleIsOpen}
      open={isOpen}
    >
      <DialogContent
        className={cn(
          "bg-background text-center shadow-[0px_2.581px_64.521px_0px] shadow-black/25",
          "[background:radial-gradient(277.58%_98.91%_at_50%_0%,_rgba(171,_206,_30,_0.20)_0%,_transparent_100%),_#FFF]",
          "backgrop:[filter:_blur(20px)] backgrop:bg-red-200 rounded-[10px] px-16 backdrop-blur-xl",
        )}
      >
        <DialogHeader className="flex flex-col items-center justify-center text-center">
          <DialogTitle className="w-2/3 text-center text-[1.375rem] font-semibold text-black">
            Verify your published papers.
          </DialogTitle>
          <DialogDescription className="mt-3 text-balance pt-0 text-center text-sm font-medium text-[#444]">
            Earn upto 1000 $reAI by verifying your published papers and patents.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-6 mt-9 rounded-md bg-white p-2.5 shadow">
          <label className="flex flex-col gap-3 text-left text-sm font-semibold uppercase">
            Enter the link of publication, or doi
            <input
              className="w-full rounded-[8px] border bg-[#f8f8f8] px-4 py-2 text-lg font-medium placeholder:text-[#333] focus-within:outline-accent"
              type="text"
              placeholder="000000"
              value={publicationDoi}
              onChange={(e) => setPublicationDoi(e.target.value)}
            />
          </label>
        </div>
        <div>
          <div className="flex w-full gap-4">
            <button
              className={cn(
                "flex w-full justify-between rounded-[12px] border border-accent bg-accent p-4 text-lg font-semibold text-white",
                publicationDoi.length > 1
                  ? "disabled:animate-pulse disabled:cursor-wait"
                  : "opacity-75 disabled:cursor-not-allowed",
              )}
              onClick={handleVerify}
              disabled={isLoading || publicationDoi.length < 1}
            >
              <span>Verify</span>
              <svg
                width="24"
                height="25"
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.5107 14.0846L6.31372 20.9806C6.04657 21.1126 5.74426 21.1561 5.45074 21.1045C5.15722 21.053 4.88778 20.9092 4.68159 20.694C4.47297 20.4815 4.338 20.2077 4.29651 19.9128C4.25502 19.6179 4.3092 19.3175 4.45109 19.0556L7.3417 13.5749H13.5769C13.8832 13.5749 14.1314 13.3266 14.1314 13.0204C14.1314 12.7142 13.8832 12.4659 13.5769 12.4659H7.56577L4.44476 6.5655C4.30233 6.30446 4.24841 6.00426 4.29109 5.70998C4.33377 5.41569 4.47075 5.14319 4.68146 4.93337L4.70015 4.91468C4.90641 4.70548 5.17357 4.56691 5.46338 4.5188C5.75319 4.47068 6.0508 4.5155 6.31359 4.64683L20.5107 11.543C20.7502 11.6579 20.9523 11.8382 21.0938 12.0631C21.2353 12.2879 21.3104 12.5482 21.3104 12.8138C21.3104 13.0795 21.2353 13.3397 21.0939 13.5646C20.9524 13.7894 20.7502 13.9697 20.5107 14.0846Z"
                  fill="white"
                />
              </svg>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
