interface SubQuestionsProps {
  metadata: string[];
  handleClickSuggestion: (value: string) => void;
}

const SubQuestions: React.FC<SubQuestionsProps> = ({
  metadata,
  // handleClickSuggestion,
}) => {
  return (
    <div className="container flex w-full items-start gap-3 pb-2 pt-5">
      {/* TODO: Thinking Img */}
      {/* <div className="flex w-fit items-center gap-4"> */}
      {/* </div> */}
      <div className="grow text-white">
        <p className="pb-[20px] pr-5 text-base font-bold leading-[152.5%] text-[#444]">
          Pondering your question from several angles
        </p>
        <div className="flex flex-row flex-wrap items-center gap-2.5 pb-[20px]">
          {metadata.map((item, subIndex) => (
            <div
              className="flex cursor-pointer items-center justify-center rounded-full px-2.5 py-2 text-[#444] shadow"
              // onClick={() => handleClickSuggestion(item)}
              key={`${item}-${subIndex}`}
            >
              <span className="text-sm font-light leading-[normal] text-[#1B1B16]">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubQuestions;
