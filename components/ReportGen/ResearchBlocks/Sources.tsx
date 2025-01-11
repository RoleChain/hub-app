import Image from "next/image";
import SourceCard from "./elements/SourceCard";

export default function Sources({
  sources,
}: {
  sources: { name: string; url: string }[];
}) {
  return (
    <div className="no-scrollbar h-auto bg-yellow-400">
      <div className="flex w-min items-start pb-3 lg:pb-3.5">
        {/* <Image src="/img/browser.svg" alt="footer" width={24} height={24} /> */}
        <h3 className="text-base font-bold uppercase leading-[152.5%] text-black">
          sources
        </h3>
      </div>
      <div className="scrollbar-thin scrollbar-thumb-accent scrollbar-track-accent-fg max-h-[350px] w-full overflow-y-auto overflow-x-clip">
        <div className="flex w-full flex-col items-center gap-3">
          {sources.length > 0 ? (
            sources.map((source) => (
              <SourceCard
                source={source}
                key={source.url}
              />
            ))
          ) : (
            <>
              <div className="h-20 w-[260px] max-w-sm animate-pulse rounded-md bg-gray-300" />
              <div className="h-20 w-[260px] max-w-sm animate-pulse rounded-md bg-gray-300" />
              <div className="h-20 w-[260px] max-w-sm animate-pulse rounded-md bg-gray-300" />
              <div className="h-20 w-[260px] max-w-sm animate-pulse rounded-md bg-gray-300" />
              <div className="h-20 w-[260px] max-w-sm animate-pulse rounded-md bg-gray-300" />
              <div className="h-20 w-[260px] max-w-sm animate-pulse rounded-md bg-gray-300" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
