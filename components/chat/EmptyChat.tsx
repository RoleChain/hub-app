import Image from "next/image";
import PopStudies from "@/assets/icons/popularStudies_icon.svg";
import useAuth from "@/hooks/useAuth";
import { useState } from "react";
import { AuthDialog } from "../Dialogs";

const SearchCard = ({
  title,
  handleOnClick,
}: {
  title: string;
  handleOnClick: (query: string) => void;
}) => {
  const { user } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  return (
    <div
      className="group flex h-full cursor-pointer gap-3 rounded-[12px] bg-[#F4F4F4] p-3 font-medium sm:gap-4 sm:p-4"
      onClick={() => (user ? handleOnClick(title) : setIsAuthDialogOpen(true))}
    >
      <span className="flex-1 text-wrap text-xs sm:text-sm">{title}</span>
      <div className="size-6 rounded-full p-1 group-active:scale-95">
        <svg
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            width="24"
            height="24"
            rx="12"
            transform="matrix(1 0 0 -1 0 24.5002)"
            fill="#ABCE1E"
          />
          <path
            d="M7.33301 12.5002H16.6663M16.6663 12.5002L13.1663 9.00024M16.6663 12.5002L13.1663 16.0002"
            stroke="black"
            strokeWidth="1.16667"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <AuthDialog
        isOpen={isAuthDialogOpen}
        toggleIsOpen={() => setIsAuthDialogOpen((prev) => !prev)}
      />
    </div>
  );
};

type EmptyChatProps = {
  handleQuery: (query: string) => void;
};

const EmptyChat = ({ handleQuery }: EmptyChatProps) => {
  return (
    <div className="mx-auto mt-6 w-full max-w-[840px] select-none px-4 pb-0 sm:mt-8 lg:mt-12">
      {/* Heading */}
      <div className="w-full lg:w-3/4">
        <h2 className="text-xl font-semibold text-black sm:text-2xl lg:text-4xl">
          Research for the machine
          <span className="block">intelligence age</span>
        </h2>
        <span className="mt-2 block text-sm text-black/50 sm:text-base">
          Automate time-consuming research tasks like summarizing papers,
          extracting data, and synthesizing your findings.
        </span>
      </div>

      {/* Sample searches */}
      <div className="mt-6 sm:mt-8">
        <div className="flex items-center gap-2 opacity-80">
          <Image
            src={PopStudies}
            alt="subheading icon"
            aria-hidden
            width={24}
            height={24}
          />
          <span className="text-lg font-semibold text-black/80 sm:text-xl">
            Popular Studies
          </span>
        </div>
        <span className="block text-xs leading-[24px] opacity-50">
          Use these topics to get started
        </span>
        
        <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
          <SearchCard
            title="Can you explain the differences between the Polygon network and Ethereum?"
            handleOnClick={handleQuery}
          />
          <SearchCard
            title="Can you explain the differences between the Polygon network and Ethereum?"
            handleOnClick={handleQuery}
          />
          <SearchCard
            title="Can you explain the differences between the Polygon network and Ethereum?"
            handleOnClick={handleQuery}
          />
        </div>
      </div>
    </div>
  );
};

export default EmptyChat;
