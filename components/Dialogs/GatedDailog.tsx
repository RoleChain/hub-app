import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";
import useAuth from "@/hooks/useAuth";
import Mask from "@/assets/images/mask.png";
import logo from "@/assets/icons/logo.svg";
export function GatedDialog({
  isOpen,
  toggleIsOpen,
}: {
  isOpen: boolean;
  toggleIsOpen: () => void;
}) {
  const { user } = useAuth();
  if (user?.isGated) {
    return;
  }
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open === false && !user) {
          return;
        }
        toggleIsOpen();
      }}
    >
      <DialogContent
        className={cn(
          "bg-background text-center shadow-[0px_2.581px_64.521px_0px] shadow-black/25",
          "[background:radial-gradient(277.58%_98.91%_at_50%_0%,_rgba(243,218,245)_0%,_transparent_100%),_#FFF]",
          "backgrop:[filter:_blur(20px)] backgrop:bg-red-200 backdrop-blur-xl",
        )}
      >
        <DialogHeader className="flex flex-col items-center justify-center text-center">
          <DialogTitle className="text-base font-normal">
            Beta Access Required
          </DialogTitle>
          <DialogDescription className="text-3xl font-bold text-accent">
            <Image
              src={logo}
              alt="logo"
              className="mx-auto object-cover"
            />
          </DialogDescription>
        </DialogHeader>
        <Image
          src={Mask}
          alt="modal img"
          aria-hidden
          className="mx-auto object-cover"
        />

        <div className="space-y-4 text-center">
          <p className="text-lg font-medium">
            This feature is currently in beta.
          </p>
          <p className="text-muted-foreground">
            Please wait for admin approval to access the beta features or contact us at <a href="mailto:hi@rolechain.org">hi@rolechain.org</a>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
