interface QuestionProps {
  question: string;
}

const Question: React.FC<QuestionProps> = ({ question }) => {
  return (
    <div className="container mb-2 flex w-3/4 flex-col items-start gap-3 border-b pb-4 pt-2 sm:flex-row">
      <div className="log-message max-w-full grow break-words text-3xl font-semibold text-[#444]">
        {question}
      </div>
    </div>
  );
};

export default Question;
