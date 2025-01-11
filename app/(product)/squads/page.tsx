"use client";

import { SearchIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import SquadSample from "@/assets/images/Rectangle 40849.png";

const Page = () => {
  const [table, setTable] = useState<"top" | "all">("top");

  return (
    <section className="mb-10">
      {/* Table title */}
      <div className="flex w-full flex-col items-center justify-between uppercase lg:flex-row">
        <div className="flex gap-6">
          <button
            className={cn(
              "border-b-2 p-4 font-semibold uppercase",
              table === "top"
                ? "border-accent text-accent"
                : "border-transparent",
            )}
            onClick={() => setTable("top")}
          >
            <p>Top Squads</p>
          </button>
          <button
            className={cn(
              "border-b-2 p-4 font-semibold uppercase",
              table === "all"
                ? "border-accent text-accent"
                : "border-transparent",
            )}
            onClick={() => setTable("all")}
          >
            <p>All Squads</p>
          </button>
        </div>
        <label className="group relative w-full rounded-[8px] bg-white outline outline-1 outline-[#E7E7E7] focus-within:outline-accent lg:max-w-[40%]">
          <div className="absolute inset-y-0 left-4 my-auto h-fit">
            <SearchIcon className="h-4 w-4 opacity-50 group-focus-within:text-accent group-focus-within:opacity-75" />
          </div>
          <input
            className="w-full border-none bg-none py-3 pe-4 pl-10 font-medium uppercase focus:outline-none"
            type="text"
            placeholder="Search for a squad"
          />
        </label>
      </div>
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <table className="min-w-[800px] w-full">
          <thead className="text-white">
            <tr className="text-sm font-semibold uppercase">
              <td className="rounded-l-[10px] bg-accent py-3 ps-2">Rank</td>
              <td className="bg-accent py-2">Squads</td>
              <td className="bg-accent py-2 text-center">Contributing</td>
              <td className="bg-accent py-2 text-center">Points</td>
              <td className="rounded-r-[10px] bg-accent py-2 pe-2 text-center">
                Join Squad
              </td>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <tr
                key={i}
                className="group border-b align-baseline font-medium uppercase hover:bg-accent/10"
              >
                <td className="ps-2">
                  <span className="block w-fit rounded-l-[10px] bg-gray-200 px-6 py-2.5 group-hover:bg-accent group-hover:text-white">
                    {i}
                  </span>
                </td>
                <td className="font-semibold">
                  <div className="inline-flex items-center gap-6">
                    <Image
                      className="object-cover"
                      width={24}
                      height={24}
                      src={SquadSample}
                      alt="squad img"
                    />
                    <span>Squad Name</span>
                  </div>
                </td>
                <td className="text-center">30</td>
                <td className="pb-4 pt-7 text-center">1k</td>
                <td className="pe-2 text-center">
                  <button className="w-fit rounded-[12px] border border-[#D0D5DD] bg-[#ebebeb] px-8 py-2 text-sm font-semibold uppercase hover:bg-accent hover:text-white">
                    Join Squad
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Page;
