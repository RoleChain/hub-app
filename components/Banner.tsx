"use client"
// import { Button } from "@/components/ui/button";
import Image from "next/image";
import Robot from "@/assets/images/Banner.webp";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export default function Banner() {
    const router = useRouter();
  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-gradient-to-b from-[#76135A] to-[#550E61]">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            repeating-linear-gradient(to right, #AC1D94 0px, #AC1D94 1px, transparent 1px, transparent 50px),
            repeating-linear-gradient(to bottom, #AC1D94 0px, #AC1D94 1px, transparent 1px, transparent 50px)
          `,
          backgroundSize: "50px 50px",
          maskImage: "none", // Removed to prevent transparency on edges
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-0">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <h1 className="text-xl font-bold text-white md:text-2xl lg:text-3xl">
              Create Your AI Agent{" "}
              <span
                role="img"
                aria-label="AI agent creation"
              >
                🚀
              </span>
            </h1>
            <p className="text-lg text-gray-300">
              Build a smart AI Agent tailored to your needs. Customize,
              automate, and elevate your workflow in a few seconds!
            </p>
            <button
              className={`flex items-center gap-2 rounded-[8px] px-4 py-2.5 font-semibold bg-gradient-to-b from-[#FF6600] via-[#F700F7] to-[#0078F6] text-white`}
              onClick={() => router.push("/agents/new")}
            >
              <Plus
                width={12}
                height={12}
              />
              <span className="block text-nowrap text-sm">
                Create New Agent
              </span>
            </button>
          </div>

          <div className="relative h-[260px] w-full  ">
            <Image
              src={Robot}
              alt="AI Robots Illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
