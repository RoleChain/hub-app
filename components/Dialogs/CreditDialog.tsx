import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn, copyToClip } from "@/lib/utils";
import Image from "next/image";
import ModalImg from "@/assets/images/creditModal_img.png";
import { useToast } from "@/hooks/use-toast";

export function CreditDialog({
  isOpen,
  toggleIsOpen,
}: {
  isOpen: boolean;
  toggleIsOpen: () => void;
}) {
  const { toast } = useToast();
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
          <DialogTitle className="mb-4 text-balance text-center text-2xl font-semibold">
            Your contribution has been submitted!
          </DialogTitle>
          <div className="mx-auto mb-2.5 block h-[1px] w-[224px] bg-black" />
          <DialogDescription className="mt-2.5 flex flex-col items-center">
            <span className="font-sm font-medium">Received</span>
            <span className="text-3xl font-semibold text-black">200 $role</span>
          </DialogDescription>
        </DialogHeader>
        <Image
          src={ModalImg}
          alt="modal img"
          aria-hidden
          width={221}
          height={184}
          className="mx-auto mt-8"
        />
        <DialogFooter>
          <div className="mt-3 flex w-full items-center justify-between rounded-lg border border-accent bg-[#F6FFD1] px-3 py-2">
            <span className="text-xs">Invite to curate together.</span>
            <button
              className="rounded-[6px] bg-accent p-1.5 text-sm uppercase text-white"
              onClick={() => {
                copyToClip(" rolecieco");
                toast({
                  title: "Copied!",
                  description:
                    "Your referral code has been copied to your clipboard",
                });
              }}
            >
              rolecieco
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
