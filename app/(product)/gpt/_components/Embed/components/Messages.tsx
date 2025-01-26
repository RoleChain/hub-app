import CopyAction from "@/components/chat/MessageActions/Copy";
import { Disc3Icon } from "lucide-react";
import Markdown from "markdown-to-jsx";
import React, { useRef, useEffect } from "react";

type TProps = {
  isLoading: boolean;
  messages: { text: string; sender: string }[];
};

const Messages = ({ isLoading, messages }: TProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  console.log(messages, messages.length);

  return (
    <div className="h-full">
      {messages.map((message, index) =>
        message.sender === "user" ? (
          <>
            <div
              key={index}
              className="container mb-2 flex w-3/4 flex-col items-start gap-3 border-b pb-4 pt-2 sm:flex-row"
            >
              <div className="log-message max-w-full grow break-words text-3xl font-semibold text-[#444]">
                {message.text}
              </div>
            </div>
            {isLoading && index + 1 == messages.length && (
              <div className="container flex h-auto w-full shrink-0 gap-4 py-8">
                <Disc3Icon className="animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div
            key={index}
            className="container flex h-auto w-full shrink-0 gap-4 py-8"
          >
            <div className="w-full">
              <div className="flex flex-wrap content-center items-center gap-[15px]">
                <div className="log-message w-full whitespace-pre-wrap text-base text-[#444]">
                  {message.text ? (
                    <>
                      <Markdown className="prose max-w-full">
                        {message.text}
                      </Markdown>
                      <div className="flex justify-end gap-4 lg:mr-12">
                        <CopyAction report={message.text} />
                      </div>
                    </>
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
          </div>
        ),
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages;
