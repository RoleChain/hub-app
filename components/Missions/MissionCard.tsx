import { cn } from "@/lib/utils";
import Link from "next/link";

const MissionCard = ({
  id,
  className,
  children,
}: {
  id: string;
  className: string;
  children: React.ReactNode;
}) => {
  return (
    <Link
      href={`mission/${id}`}
      className={cn(
        "flex h-full w-full flex-col justify-between rounded-[10px] px-7 py-5",
        "bg-missionCardGradient",
        className,
      )}
    >
      {children}
    </Link>
  );
};

export default MissionCard;
