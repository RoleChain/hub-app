"use client";

import useAuth from "@/hooks/useAuth";
import { LogOutIcon, Plus } from "lucide-react";
import { useState } from "react";
import * as Avatar from "@radix-ui/react-avatar";
import { useRouter } from "next/navigation";
import { AuthDialog } from "@/components/Dialogs";

const BASE_URL = "https://api.rolechain.org";
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  return response.json();
};

type TUser = {
  name: string;
  email: string;
  avatar?: string;
};

export default function Header() {
  const { user, signOut } = useAuth();
  const typedUser = user as TUser | null; // Ensures TypeScript recognizes the type
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const router = useRouter();

  return (
    <nav
    className="fixed  z-[9999] flex w-[81%] items-center justify-between bg-white px-6 py-3 shadow-md"
  >
  
      <div className="whitespace-nowrap text-lg font-semibold">Get Started</div>
      <div className="flex items-center gap-4">
        <button
          className="flex items-center gap-2 rounded-[8px] bg-gradient-to-b from-[#FF6600] via-[#F700F7] to-[#0078F6] px-4 py-2.5 font-semibold text-white"
          onClick={() => router.push("/agents/new")}
        >
          <Plus width={12} height={12} />
          <span className="block text-nowrap text-sm">Create New Agent</span>
        </button>

        {typedUser ? (
          <div className="mb-2 mt-auto w-full px-8 pb-5">
            <div className="mt-2 flex gap-1">
              <div className="mt-6 flex cursor-default items-center justify-between gap-2 overflow-clip">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="h-10 w-10 shrink-0 rounded-full">
                    <Avatar.Root className="inline-flex h-full w-full select-none items-center justify-center overflow-hidden rounded-full border align-middle">
                      <Avatar.Image
                        className="size-full h-full w-full object-cover"
                        src={
                          typedUser.avatar ||
                          "https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                        }
                        alt="user img"
                      />
                      <Avatar.Fallback
                        className="flex content-center items-center bg-white text-sm"
                        delayMs={600}
                      >
                        CT
                      </Avatar.Fallback>
                    </Avatar.Root>
                  </div>
                  <div className="flex flex-col justify-between truncate">
                    <span className="inline-block text-sm font-semibold text-[#344054]">
                      {typedUser.name}
                    </span>
                    <span className="inline-block w-full truncate text-sm text-[#444]">
                      {typedUser.email}
                    </span>
                  </div>
                </div>
                <button onClick={signOut}>
                  <LogOutIcon className="opacity-50" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex w-full cursor-pointer items-center gap-2 px-8 text-muted-foreground hover:text-foreground">
            <button
              className="w-full rounded-[12px] bg-gradient-to-b from-[#FF6600] via-[#F700F7] to-[#0078F6] px-4 py-2.5 font-semibold text-white transition-opacity hover:opacity-90"
              onClick={() => setIsAuthDialogOpen(true)}
            >
              Sign up
            </button>
            <AuthDialog
              isOpen={isAuthDialogOpen}
              toggleIsOpen={() => setIsAuthDialogOpen((prev) => !prev)}
            />
          </div>
        )}
      </div>
    </nav>
  );
}
