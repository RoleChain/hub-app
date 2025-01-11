"use client";
import Image from "next/image";
import Link from "next/link";
import headerBg from "@/assets/icons/mission_header.png";
import ReaiCard from "@/components/Missions/ReaiCard";
import InfoCard from "@/components/Missions/InfoCard";
import * as Avatar from "@radix-ui/react-avatar";
import RecentContributions from "./_components/recentContributions";
import ImgBlurTemp from "@/components/icons/imgBlurTemp";
import Footer from "./_components/footer";
import { useEffect, useState } from "react";
import { Mission } from "@/types";
import axios from "axios";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export const runtime = "edge";

export default function Page() {
  const [missionInfo, setMissionInfo] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { id: missionId } = useParams();

  const fetchMissionInfo = async () => {
    try {
      const { data } = await axios.get<{ mission: Mission }>(
        "https://research-ai-backend-production.up.railway.app/mission/" +
          missionId,
      );
      console.log(data);
      setMissionInfo(data.mission);
    } catch (err) {
      console.error("Could not fetch missions", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMissionInfo();
  }, []);

  return (
    <section
      id="mission_details"
      className="relative"
    >
      <Link
        href="/"
        className="flex items-center gap-2"
      >
        <svg
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.71484 7.35742L3.57199 12.5003L8.71484 17.6431"
            stroke="#444444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19 12.5L3.57143 12.5"
            stroke="#444444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-2xl font-semibold text-[#444]">Missions</span>
      </Link>
      {/* header */}
      {missionInfo ? (
        <div className="grid h-full grid-rows-[1fr_auto] gap-4 md:gap-6">
          <div className="mt-5 h-max space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:gap-8">
              <div className="relative isolate flex h-max min-h-[120px] w-full flex-col justify-between gap-8 overflow-clip rounded-[8px] bg-gradient-to-r from-[rgba(250,_250,_250,_0.60)] to-[#fafafa] to-90% p-8 pb-4 xl:flex-row">
                <div className="absolute inset-0">
                  <Image
                    src={headerBg}
                    alt="background"
                    aria-hidden="true"
                    fill
                    className="pointer-events-none absolute -z-[1] opacity-40"
                  />
                </div>
                <div className="absolute inset-0 z-[-1] size-full bg-gradient-to-b from-transparent to-white to-[125%]" />
                <div className="flex basis-2/3 flex-col gap-2">
                  {/* title */}
                  <span className="block text-2xl font-bold leading-tight text-[#444]">
                    {missionInfo.title}
                  </span>
                  {/* description */}
                  <p className="line-clamp-3 text-[16px] leading-tight text-[#444]">
                    {missionInfo.description}
                  </p>
                  {/* tags */}
                  <div className="mt-2 flex items-center justify-start gap-8 lg:gap-16">
                    <div className="flex gap-2">
                      {missionInfo?.categories.map((category) => (
                        <span
                          key={category}
                          className="rounded-[10px] bg-white px-3 py-1 text-[14px] font-light text-black"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                    <div className="inline-flex items-center">
                      <Avatar.Root className="inline-flex h-5 w-5 select-none items-center justify-center overflow-hidden rounded-full border align-middle">
                        <Avatar.Image
                          className="size-full h-5 w-5 object-cover"
                          src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                          alt="user img"
                        />
                        <Avatar.Fallback
                          className="flex content-center items-center bg-white text-sm"
                          delayMs={600}
                        >
                          CT
                        </Avatar.Fallback>
                      </Avatar.Root>
                      <Avatar.Root className="-ml-2 inline-flex h-5 w-5 select-none items-center justify-center overflow-hidden rounded-full border align-middle">
                        <Avatar.Image
                          className="size-full h-5 w-5 object-cover"
                          src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                          alt="user img"
                        />
                        <Avatar.Fallback
                          className="flex content-center items-center bg-white text-sm"
                          delayMs={600}
                        >
                          CT
                        </Avatar.Fallback>
                      </Avatar.Root>
                      <Avatar.Root className="-ml-2 inline-flex h-5 w-5 select-none items-center justify-center overflow-hidden rounded-full border align-middle">
                        <Avatar.Image
                          className="size-full h-5 w-5 object-cover"
                          src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                          alt="user img"
                        />
                        <Avatar.Fallback
                          className="flex content-center items-center bg-white text-sm"
                          delayMs={600}
                        >
                          CT
                        </Avatar.Fallback>
                      </Avatar.Root>
                      <span className="ml-2">
                        Contributions: {missionInfo?.contributions.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
                <ReaiCard reward={missionInfo?.reward || 100} />
              </div>
            </div>
            
            {/* Info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoCard className="items-center">
                <div>
                  <svg
                    width="36"
                    height="37"
                    viewBox="0 0 36 37"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.24023 14.7772C9.24023 13.357 10.3915 12.2058 11.8117 12.2058H31.7402C33.1604 12.2058 34.3117 13.357 34.3117 14.7772V30.2056C34.3117 31.6258 33.1604 32.7771 31.7402 32.7771H11.8117C10.3915 32.7771 9.24023 31.6258 9.24023 30.2056V14.7772Z"
                      stroke="#ABCE1E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M26.7589 7.62541V6.9022C26.7589 5.48205 25.6077 4.33077 24.1875 4.33077H4.25893C2.83878 4.33077 1.6875 5.48205 1.6875 6.9022V22.3308C1.6875 23.7509 2.83878 24.9022 4.25893 24.9022H4.74107"
                      stroke="#ABCE1E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19.0459 17.6726L26.7602 22.494L19.0459 27.3153V17.6726Z"
                      stroke="#ABCE1E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="h-min">
                  <span className="block text-sm font-bold">
                    Discover Missions
                  </span>
                  <p className="text-[12px]">
                    Find available missions to contribute research papers
                  </p>
                </div>
              </InfoCard>
              <InfoCard className="items-center">
                <div>
                  <svg
                    width="36"
                    height="37"
                    viewBox="0 0 36 37"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.24023 14.7772C9.24023 13.357 10.3915 12.2058 11.8117 12.2058H31.7402C33.1604 12.2058 34.3117 13.357 34.3117 14.7772V30.2056C34.3117 31.6258 33.1604 32.7771 31.7402 32.7771H11.8117C10.3915 32.7771 9.24023 31.6258 9.24023 30.2056V14.7772Z"
                      stroke="#ABCE1E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M26.7589 7.62541V6.9022C26.7589 5.48205 25.6077 4.33077 24.1875 4.33077H4.25893C2.83878 4.33077 1.6875 5.48205 1.6875 6.9022V22.3308C1.6875 23.7509 2.83878 24.9022 4.25893 24.9022H4.74107"
                      stroke="#ABCE1E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19.0459 17.6726L26.7602 22.494L19.0459 27.3153V17.6726Z"
                      stroke="#ABCE1E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <span className="block text-sm font-bold">
                    Curate Research
                  </span>
                  <p className="text-[12px]">
                    Select and organize key research papers.
                  </p>
                </div>
              </InfoCard>
              <InfoCard className="items-center">
                <ImgBlurTemp
                  height={48}
                  width={48}
                  className="hidden h-auto min-w-[24px] text-accent xl:block"
                />
                <div>
                  <span className="block text-sm font-bold">Fuel Data</span>
                  <p className="text-[12px]">
                    Accelerate AI development by gathering and refining data.
                  </p>
                </div>
              </InfoCard>
              <InfoCard className="items-center">
                <ImgBlurTemp
                  height={48}
                  width={48}
                  className="hidden h-auto min-w-[24px] text-accent xl:block"
                />
                <div>
                  <span className="block text-sm font-bold">Earn $reAI</span>
                  <p className="text-[12px]">
                    Get rewarded with $reAI tokens for your contributions.
                  </p>
                </div>
              </InfoCard>
            </div>
            {/* contributions */}
            <div className="mt-2 pb-10">
              <RecentContributions
                contributions={missionInfo.contributions}
                reward={missionInfo.reward}
              />
            </div>
          </div>
          {/* footer */}
          <Footer />
        </div>
      ) : isLoading ? (
        <div className="mt-5">
          <Skeleton className="h-40 w-full rounded-lg bg-gray-200" />
          <div className="mt-4 flex justify-between">
            <Skeleton className="h-20 w-60 rounded-lg bg-gray-200" />
            <Skeleton className="h-20 w-60 rounded-lg bg-gray-200" />
            <Skeleton className="h-20 w-60 rounded-lg bg-gray-200" />
            <Skeleton className="h-20 w-60 rounded-lg bg-gray-200" />
          </div>
          <div className="mt-8 flex flex-col gap-4">
            <Skeleton className="h-20 w-full rounded-lg border bg-gray-200" />
            <Skeleton className="h-20 w-full rounded-lg border bg-gray-200" />
            <Skeleton className="h-20 w-full rounded-lg border bg-gray-200" />
            <Skeleton className="h-20 w-full rounded-lg border bg-gray-200" />
            <Skeleton className="h-20 w-full rounded-lg border bg-gray-200" />
          </div>
        </div>
      ) : (
        <></>
      )}
    </section>
  );
}
