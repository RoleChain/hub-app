import Markdown from "markdown-to-jsx";
import { useEffect, useRef } from "react";

export default function Answer({ answer }: { answer: string }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [answer]);

  return (
    <div className="container flex h-auto w-full shrink-0 flex-col gap-4 py-8">
      <div className="w-full">
        <div className="flex flex-wrap content-center items-center gap-[15px]">
          <div className="log-message w-full whitespace-pre-wrap text-base text-[#444]">
            {answer?.length ? (
              <Markdown className="prose max-w-full">{answer}</Markdown>
            ) : (
              <div className="flex w-full flex-col gap-2">
                <div className="h-6 w-full animate-pulse rounded-md bg-gray-300" />
                <div className="h-6 w-full animate-pulse rounded-md bg-gray-300" />
                <div className="h-6 w-full animate-pulse rounded-md bg-gray-300" />
                <div className="h-6 w-full animate-pulse rounded-md bg-gray-300" />
              </div>
            )}
          </div>
        </div>
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
}
