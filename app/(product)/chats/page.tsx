"use client";
import useConversation from "@/hooks/useConversation";
import Link from "next/link";

const Page = () => {
  const { conversations, updateCurrentConversation } = useConversation();

  return (
    <section className="w-full min-h-screen bg-white">
      <div className="max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
        <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
          {conversations.map((convo) => (
            <Link
              key={convo.id}
              href={`/c/${convo.id}`}
              className="flex w-full justify-between items-center border border-black/5 rounded-lg 
                px-3 sm:px-6 md:px-8 
                py-2.5 sm:py-3 md:py-4 
                text-sm sm:text-base
                opacity-80 duration-200 hover:opacity-100 hover:shadow-sm"
              onClick={() => updateCurrentConversation(convo.id)}
            >
              {convo.title}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Page;
