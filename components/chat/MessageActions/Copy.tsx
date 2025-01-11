import { toast } from "@/hooks/use-toast";
import { CopyIcon } from "lucide-react";

type TProps = {
  report: any;
};

const CopyAction = ({ report }: TProps) => {
  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(report)
        .then(() => {
          toast({ description: "Answer copied to clipboard." });
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    } else {
      console.warn("Clipboard API is not available");
      toast({ title: "Couldn't copy" });
    }
  };
  return (
    <button
      onClick={copyToClipboard}
      className="p-2 sm:p-1 text-sm font-bold uppercase text-[#444] opacity-50 outline-none transition-all duration-150 ease-linear hover:opacity-80 active:scale-95 touch-manipulation"
    >
      <span className="sr-only">Copy to clipboard</span>
      <CopyIcon className="w-5 h-5 sm:w-4 sm:h-4" />
    </button>
  );
};

export default CopyAction;
