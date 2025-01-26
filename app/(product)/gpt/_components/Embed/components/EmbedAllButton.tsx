import { embedAllPdfs } from "../services/api";
import { toast } from "@/hooks/use-toast";

type TProps = {
  setMessages: React.Dispatch<
    React.SetStateAction<{ text: string; sender: string }[]>
  >;
  isEmbedding: boolean;
  setIsEmbedding: React.Dispatch<React.SetStateAction<boolean>>;
};

const EmbedAllButton = ({
  setMessages,
  isEmbedding,
  setIsEmbedding,
}: TProps) => {
  // const handleModelChange = (event) => {
  //   setModel(event.target.value);
  // };

  const handleEmbedAll = async () => {
    setIsEmbedding(true);
    try {
      const message = await embedAllPdfs(); // 선택된 모델을 서버로 전달
      setMessages((prev) => [...prev, { text: message, sender: "bot" }]);
    } catch (err) {
      console.error(err);
      toast({
        title: "Something went wrong",
        description: err as string,
        variant: "destructive",
      });
      setMessages((prev) => [
        ...prev,
        { text: "Error embedding PDFs.", sender: "bot" },
      ]);
    }
    setIsEmbedding(false);
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <button
        onClick={handleEmbedAll}
        disabled={isEmbedding}
      >
        {isEmbedding ? "Embedding..." : "Embed All PDFs"}
      </button>
    </div>
  );
};

export default EmbedAllButton;
