"use client";
import RecentContributionCard from "./recentContributionCard";
import { cn } from "@/lib/utils";
import { Mission } from "@/types";
import { useEffect, useRef, useState } from "react";

const RecentContributions = ({
  contributions,
  reward,
}: Pick<Mission, "contributions"> & { reward: number }) => {
  console.log(contributions);
  const recentContributionsRef = useRef<HTMLDivElement>(null);
  const [isScrollDn, setIsScrollDn] = useState(false);
  // const [contribList, setContribList] = useState(contributions)
  useEffect(() => {
    const recentContributionsContainer =
      document.getElementById("mission_details");

    const handleScrollCheck = () => {
      if (!recentContributionsContainer) return;
      const { scrollHeight, scrollTop } = recentContributionsContainer;
      setIsScrollDn(scrollHeight > scrollTop);
    };

    if (recentContributionsContainer) {
      recentContributionsContainer.addEventListener(
        "scroll",
        handleScrollCheck,
      );
    }
    return () => {
      if (recentContributionsContainer)
        recentContributionsContainer.removeEventListener(
          "scroll",
          handleScrollCheck,
        );
    };
  }, []);
  useEffect(() => console.log(isScrollDn), [isScrollDn]);
  return (
    <div
      ref={recentContributionsRef}
      className="overflow-y-auto"
    >
      <span className="text-capitalize block text-lg font-semibold">
        Recent contributions
      </span>
      <div className="relative isolate mt-2 flex flex-col gap-4">
        <div
          className={cn(
            "pointer-event-none absolute inset-0 z-10 opacity-50",
            isScrollDn
              ? "bg-green-300 bg-gradient-to-t from-transparent to-background to-90%"
              : "",
          )}
        />
        {contributions.map((contribution) => (
          <RecentContributionCard
            key={contribution.id}
            title={contribution.metadata.title}
            authors={contribution.metadata.authors
              .map((author) => author.name)
              .join(", ")}
            DOI={contribution.metadata.doi}
            reai={reward}
          />
        ))}
      </div>
    </div>
  );
};

export default RecentContributions;
