// import Image from "next/image";
import { cn } from "@/lib/utils";
import LogMessage from "./elements/LogMessage";
import { useEffect, useRef, useState } from "react";

interface Log {
  header: string;
  text: string;
  metadata: any;
  key: string;
}

interface OrderedLogsProps {
  logs: Log[];
}

const LogsSection = ({ logs }: OrderedLogsProps) => {
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    // Scroll to bottom whenever logs change
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop =
        logsContainerRef.current.scrollHeight;
    }
  }, [logs]); // Dependency on logs array ensures this runs when new logs are added

  console.log(logs);

  return (
    !!logs.length && (
      <div className="container h-max shrink-0 rounded-lg">
        <div className="flex items-start gap-4 pb-3 lg:pb-3.5">
          {/* TODO: Agent Image */}
          <h3 className="text-base font-bold uppercase leading-[152.5%] text-[#444]">
            Agent Work
          </h3>
        </div>
        <div
          ref={logsContainerRef}
          className={cn(
            "scrollbar-thin scrollbar-thumb-accent scrollbar-track-accent-fg max-h-[500px] overflow-y-auto",
            isExpanded ? "h-full min-h-[200px]" : "h-0",
          )}
        >
          <LogMessage logs={logs} />
        </div>
      </div>
    )
  );
};

export default LogsSection;
