import { FileTextIcon } from "lucide-react";
import { getHost } from "../../../helpers/getHost";

interface TProps {
  accessData: any;
}

const PdfView: React.FC<TProps> = ({ accessData }) => {
  const host = getHost();

  const getReportLink = (dataType: string) => {
    return `${host}/${accessData[dataType]}`;
  };

  return (
    <div className="flex justify-end w-full">
      <a
        id="downloadLink"
        href={getReportLink("pdf")}
        className="text-sm md:text-base font-bold uppercase text-[#444] opacity-50 outline-none transition-all duration-150 ease-linear hover:opacity-80 p-2 md:p-3 touch-target"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="sr-only">View as PDF</span>
        <FileTextIcon className="w-5 h-5 md:w-6 md:h-6" />
      </a>
    </div>
  );
};

export default PdfView;
