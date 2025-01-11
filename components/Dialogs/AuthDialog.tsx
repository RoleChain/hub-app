import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import AuthDialogContent from "./auth/AuthDialogContent";
import { cn } from "@/lib/utils";
import ModalIcon from "@/assets/icons/modalIcon.svg";
import Image from "next/image";
import useAuth from "@/hooks/useAuth";

export function AuthDialog({
  isOpen,
  toggleIsOpen,
}: {
  isOpen: boolean;
  toggleIsOpen: () => void;
}) {
  const { user } = useAuth();
  if (user) {
    return;
  }
  return (
    <Dialog
      open={isOpen}
      onOpenChange={toggleIsOpen}
    >
      <DialogContent
        className={cn(
          "bg-background text-center shadow-[0px_2.581px_64.521px_0px] shadow-black/25",
          "[background:radial-gradient(277.58%_98.91%_at_50%_0%,_rgba(171,_206,_30,_0.20)_0%,_transparent_100%),_#FFF]",
          "backgrop:[filter:_blur(20px)] backgrop:bg-red-200 backdrop-blur-xl",
        )}
      >
        <DialogHeader className="flex flex-col items-center justify-center text-center">
          <DialogTitle className="text-base font-normal">
            Start Research & Earning with
          </DialogTitle>
          <DialogDescription className="text-3xl font-bold text-accent">
            reAI
          </DialogDescription>
        </DialogHeader>
        <Image
          src={ModalIcon}
          alt="modal img"
          aria-hidden
          width={302}
          height={224}
          className="mx-auto"
        />
        <span className="mx-auto mb-4 mt-6 text-sm text-accent">
          Ready Scholar?
        </span>
        <AuthDialogContent />
      </DialogContent>
    </Dialog>
  );
}
