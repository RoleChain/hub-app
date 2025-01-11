import { cn } from "@/lib/utils";

const InfoCard = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "flex w-fit max-w-[23%] items-start gap-2 overflow-clip text-balance rounded-[10px] bg-white p-1",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default InfoCard;
