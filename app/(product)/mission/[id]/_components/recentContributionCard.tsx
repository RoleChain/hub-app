import PaperIcon from "@/assets/icons/paper_icon.svg";
import PenIcon from "@/assets/icons/pen_icon.svg";
import ImgBlurIcon from "@/assets/icons/imgBlur_icon.svg";
import Image from "next/image";

type RecentContributionCardProps = {
  title: string;
  authors: string;
  DOI: string;
  reai: number;
};

const RecentContributionCard = ({
  title,
  authors,
  DOI,
  reai,
}: RecentContributionCardProps) => {
  return (
    <div className="flex w-full min-w-0 justify-between gap-8 rounded border bg-white px-6 py-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Image
            src={PaperIcon}
            width={24}
            height={24}
            alt="title img"
            aria-hidden
            className="hidden lg:block"
          />
          <span className="text-[16px] font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Image
            src={PenIcon}
            width={16}
            height={16}
            alt="title img"
            aria-hidden
            className="hidden lg:block"
          />
          <span className="text-sm">Authors: {authors}</span>
        </div>
        <div className="flex items-center gap-2">
          <Image
            src={ImgBlurIcon}
            width={16}
            height={16}
            alt="title img"
            aria-hidden
            className="hidden lg:block"
          />
          <span className="text-sm">DOI: {DOI}</span>
        </div>
      </div>
      <div className="my-auto flex flex-col items-start gap-2 text-[#444]">
        <span className="block text-xs font-medium opacity-75">Earned</span>
        <span className="block text-[22px] font-semibold">{reai} $reAI</span>
      </div>
    </div>
  );
};

export default RecentContributionCard;
