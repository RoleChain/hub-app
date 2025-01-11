import React from "react";
import Question from "./ResearchBlocks/Question";
import Answer from "./ResearchBlocks/Answer";
import Sources from "./ResearchBlocks/Sources";
import ImageSection from "./ResearchBlocks/ImageSection";
import SubQuestions from "./ResearchBlocks/elements/SubQuestions";
import LogsSection from "./ResearchBlocks/LogsSection";
import { preprocessOrderedData } from "../../utils/dataPreprocessing";
import { Data } from "../../types/data";
import PdfView from "../chat/MessageActions/PdfView";
import CopyAction from "../chat/MessageActions/Copy";
import { Disc3Icon } from "lucide-react";

interface ResearchResultsProps {
  isLoading: boolean;
  orderedData: Data[];
  answer: string;
  allLogs: any[];
  handleClickSuggestion: (value: string) => void;
}

export const ResearchResults: React.FC<ResearchResultsProps> = ({
  isLoading,
  orderedData,
  answer,
  allLogs,
  handleClickSuggestion,
}) => {
  const groupedData = preprocessOrderedData(orderedData);
  const pathData = groupedData.find((data) => data.type === "path");
  const initialQuestion = groupedData.find((data) => data.type === "question");

  const chatComponents = groupedData
    .filter((data) => {
      if (data.type === "question" && data === initialQuestion) {
        return false;
      }
      return (
        data.type === "question" ||
        data.type === "chat" ||
        data.type === "reportBlock"
      );
    })
    .map((data, index) => {
      if (data.type === "question") {
        return (
          <Question
            key={`question-${index}`}
            question={data.content}
          />
        );
      } else {
        return (
          <>
            <Answer
              key={`chat-${index}`}
              answer={data.content}
            />
            <div className="flex justify-end gap-4 lg:mr-12">
              <CopyAction report={data.content} />
              {pathData && <PdfView accessData={pathData.output} />}
            </div>
          </>
        );
      }
    });

  const sourceComponents = groupedData
    .filter((data) => data.type === "sourceBlock")
    .map((data, index) => (
      <Sources
        key={`sourceBlock-${index}`}
        sources={data.items}
      />
    ));

  // const imageComponents = groupedData
  //   .filter((data) => data.type === "imagesBlock")
  //   .map((data, index) => (
  //     <ImageSection
  //       key={`images-${index}`}
  //       metadata={data.metadata}
  //     />
  //   ));

  // filter out all report objects and join to get final answer
  // const initialReport = groupedData
  //   .filter((data) => data.type === "reportBlock")
  //   .map((data) => data.content)
  //   .join("\n");

  // console.log("orderedData", orderedData);
  // console.log("groupedData", groupedData);
  // console.log("InitialReport", initialReport);
  // console.log("Answer", answer);
  // console.log("initialReport", initialReport);

  const subqueriesComponent = groupedData.find(
    (data) => data.content === "subqueries",
  );
  return (
    <section className="flex w-full flex-col gap-12">
      {initialQuestion && <Question question={initialQuestion.content} />}
      <div className="flex w-full flex-col gap-12 lg:flex-row">
        <div className="order-2 lg:order-1 lg:w-2/3">
          {orderedData.length > 0 && <LogsSection logs={allLogs} />}
          {/* {initialReport && <Answer answer={initialReport} />} */}
          {chatComponents}
          {isLoading && <Disc3Icon className="mt-2 animate-spin" />}
        </div>
        <div className="order-1 hidden lg:order-2 lg:block lg:w-1/3">
          {subqueriesComponent && (
            <SubQuestions
              metadata={subqueriesComponent.metadata}
              handleClickSuggestion={handleClickSuggestion}
            />
          )}
          {sourceComponents}
          {/* {imageComponents} */}
        </div>
      </div>
    </section>
  );
};
