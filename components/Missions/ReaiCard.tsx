import { InfoIcon } from "lucide-react";

const ReaiCard = ({ reward = 100 }: { reward: number }) => {
  return (
    <div className="aspect-video h-[117px] w-[242px]">
      <div className="flex h-[71px] flex-col rounded-t-[10px] bg-[#424242D9] px-4 py-4 text-accent">
        <span className="text-xs font-semibold">upto</span>
        <span className="-mt-0.5 text-[22px] font-semibold">
          {reward} $ROAI
        </span>
      </div>
      <div className="flex items-center gap-0.5 whitespace-nowrap rounded-b-[10px] bg-[#42424280] px-4 py-3 text-white">
        <InfoIcon width={14} />
        <span className="text-xs font-semibold">Learn more about $ROAI</span>
      </div>
    </div>
  );
};

export default ReaiCard;
