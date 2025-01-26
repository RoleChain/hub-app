import React, { useState } from "react";
import { askQuestion } from "../services/api";
import { toast } from "@/hooks/use-toast";

type TProps = {
  setMessages: React.Dispatch<
    React.SetStateAction<{ text: string; sender: string }[]>
  >;
  isAsking: boolean;
  setIsAsking: React.Dispatch<React.SetStateAction<boolean>>;
};

const QuestionForm = ({ setMessages, isAsking, setIsAsking }: TProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    setInput("");
    setIsAsking(true);

    try {
      const answer = await askQuestion(input);
      setMessages((prev) => [...prev, { text: answer, sender: "bot" }]);
    } catch (error: any) {
      toast({
        title: "Something went wrong",
        description: error as string,
        variant: "destructive",
      });
      setMessages((prev) => [
        ...prev,
        { text: "Error getting answer.", sender: "bot" },
      ]);
    }
    setIsAsking(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a question..."
        style={{ width: "60%", marginRight: "10px", padding: "5px" }}
      />
      <button
        type="submit"
        disabled={isAsking}
        style={{ width: "20%", padding: "5px" }}
      >
        {isAsking ? "Thinking..." : "Ask"}
      </button>
    </form>
  );
};

export default QuestionForm;
