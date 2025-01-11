// Accordion.tsx
import Markdown from "markdown-to-jsx";
import { useState } from "react";

type ProcessedData = {
  field: string;
  isMarkdown: boolean;
  htmlContent: string | object;
};

type Log = {
  header: string;
  text: string;
  processedData?: ProcessedData[];
};

interface AccordionProps {
  logs: Log[];
}

const plainTextFields = [
  "task",
  "sections",
  "headers",
  "sources",
  "research_data",
];

const Accordion: React.FC<AccordionProps> = ({ logs }) => {
  const getLogHeaderText = (log: Log): string => {
    const regex = /📃 Source: (https?:\/\/[^\s]+)/;
    const match = log.text.match(regex);
    let sourceUrl = "";

    if (match) {
      sourceUrl = match[1];
    }

    return log.header === "differences"
      ? "The following fields on the Langgraph were updated: " +
          Object.keys(JSON.parse(log.text).data).join(", ")
      : `📄 Retrieved relevant content from the source: ${sourceUrl}`;
  };

  const renderLogContent = (log: Log) => {
    if (log.header === "differences" && log.processedData) {
      return log.processedData.map((data, index) => (
        <div
          key={index}
          className="mb-4"
        >
          <h3 className="text-body-color dark:text-dark-6 text-lg font-semibold">
            {data.field}:
          </h3>
          {data.isMarkdown ? (
            <Markdown>{data.htmlContent as string}</Markdown>
          ) : (
            <p className="text-black">
              {typeof data.htmlContent === "object"
                ? JSON.stringify(data.htmlContent)
                : data.htmlContent}
            </p>
          )}
        </div>
      ));
    } else {
      return (
        <p className="text-body-color dark:text-dark-6 mb-2">{log.text}</p>
      );
    }
  };

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div
      id="accordion-collapse"
      data-accordion="collapse"
      className="mt-4 rounded-lg"
    >
      {logs.map((log, index) => (
        <div key={index}>
          <h2 id={`accordion-collapse-heading-${index}`}>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-t-xl p-5 font-medium text-black"
              onClick={() => handleToggle(index)}
              aria-expanded={openIndex === index}
              aria-controls={`accordion-collapse-body-${index}`}
            >
              <span className="flex-grow text-left">
                {getLogHeaderText(log)}
              </span>
              <svg
                data-accordion-icon
                className={`h-3 w-3 ${openIndex === index ? "rotate-180" : ""} shrink-0`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5 5 1 1 5"
                />
              </svg>
            </button>
          </h2>
          <div
            id={`accordion-collapse-body-${index}`}
            className={`${openIndex === index ? "" : "hidden"}`}
            aria-labelledby={`accordion-collapse-heading-${index}`}
          >
            <div className="border border-b-0 border-gray-900 p-5 text-white dark:border-gray-900">
              {renderLogContent(log)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Accordion;

