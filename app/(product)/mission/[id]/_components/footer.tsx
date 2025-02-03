"use client";
import { AuthDialog, CreditDialog } from "@/components/Dialogs";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
// import { missionsApi } from "@/api";
import { useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { Mission } from "@/types";

const Footer = () => {
  const [isVerificationSuccess, setIsVerificationSuccess] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [contribDoi, setContribDoi] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const { id: missionId } = useParams();

  const handleContribute = async () => {
    setIsLoading(true);
    try {
      // const data = await missionsApi.contributeMission(
      //   missionId as string,
      //   contribUrl,
      // );
      // const token = getLocalToken();
      const { data } = await axios.post<{ message: string; mission: Mission }>(
        "https://api.rolechain.org/mission/" +
          missionId +
          "/contribute",
        { doi: contribDoi },
        {
          withCredentials: true,
        },
      );
      toast({ title: "Success!", description: data.message });
      setIsVerificationSuccess(true);
      setContribDoi("");
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        toast({
          title: "Something went wrong",
          description: err.response?.data.error,
          className: "rounded-md border-red-300",
        });
      }
      // console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "sticky bottom-0 left-0 right-0 isolate mb-0 mt-auto h-min",
        "w-full",
      )}
    >
      <div className="absolute inset-0 -mx-12 h-[1px] w-screen bg-[#dcdcdc]" />
      <div className="pointer-event-none absolute inset-0 -z-[1] -mx-12 h-full w-screen bg-white" />
      <div className="bg-white py-5">
        {user ? (
          <div className="flex flex-col items-start gap-2.5">
            <span className="block select-none text-lg font-semibold">
              Start Contributing
            </span>
            <div className="flex w-full gap-4">
              <input
                type="text"
                className="w-full rounded-[8px] border px-6 py-2 text-lg font-medium focus-within:outline-accent disabled:cursor-wait disabled:opacity-75"
                placeholder="Enter DOI or select from your publications."
                value={contribDoi}
                onChange={(e) => setContribDoi(e.target.value)}
                disabled={isLoading}
              />
              <CreditDialog
                isOpen={isVerificationSuccess}
                toggleIsOpen={() => setIsVerificationSuccess(false)}
              />
              <button
                className="flex items-center gap-2 rounded-[12px] bg-accent px-4 py-2 text-white hover:bg-[#93B019] disabled:animate-pulse disabled:cursor-wait disabled:opacity-75"
                onClick={handleContribute}
                disabled={isLoading}
              >
                <span className="text-lg font-semibold">Contribute</span>
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex cursor-default items-center gap-1">
                    <InfoIcon width={14} />
                    <p className="text-sm">
                      Learn more about contributing to missions
                    </p>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  Learn more about contributing to missions
                  <p></p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          <div className="mx-auto w-max">
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
        )}
      </div>
    </div>
  );
};

export default Footer;
