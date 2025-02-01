import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface WaitingListPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function WaitingListPopup({ isOpen, onClose }: WaitingListPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-purple-200 bg-[radial-gradient(277.58%_98.91%_at_50%_0%,_rgba(171,_206,_30,_0.20)_0%,_rgba(255,_255,_255,_0.00)_100%),_#FFF]">
        <div className="flex flex-col items-center space-y-4 p-6">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-01%20160049-cU9DIrHLSgh6oGJpGhroo4jjsFlO8W.png"
            alt="RolechAIn Logo"
            width={48}
            height={48}
          />
          <DialogTitle className="text-2xl font-semibold text-center">You're on the Waiting List!</DialogTitle>
          <p className="text-center text-gray-600 max-w-[280px]">
            Thank you for signing up. Your access will be granted upon admin approval.
          </p>
          <Button
            onClick={onClose}
            className="mt-4 w-full h-11 font-semibold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white hover:opacity-90 transition-opacity rounded-[12px]"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

