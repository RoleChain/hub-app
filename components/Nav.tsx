"use client";
import { cn, copyToClip } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import Logo from "@/assets/icons/logo.svg";
import ChatIcon from "@/assets/icons/chat_icon.svg";
import { AuthDialog } from "@/components/Dialogs";
import useAuth from "@/hooks/useAuth";
import PapersIcon from "./icons/papers";
import ImgBlurTemp from "./icons/imgBlurTemp";
import * as Avatar from "@radix-ui/react-avatar";
import { HistoryIcon, LogOutIcon, PlusIcon, ChevronDown, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

const BASE_URL = 'https://api.rolechain.org';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };
  
  const response = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  return response.json();
};

type Agent = {
  _id: string;
  name: string;
};

export default function Nav() {
  const segments = useSelectedLayoutSegments();
  const { user, isConnecting, signOut } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const { toast } = useToast();
  const [isAgentsOpen, setIsAgentsOpen] = useState(false);
  const [isGPTOpen, setIsGPTOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      if (!user) return; // Don't fetch if user is not logged in
      
      setIsLoadingAgents(true);
      try {
        const data = await fetchWithAuth('/agents');
        setAgents(data);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
        toast({
          title: "Error",
          description: "Failed to load agents",
          variant: "destructive",
        });
      } finally {
        setIsLoadingAgents(false);
      }
    };

    if (isAgentsOpen) {
      fetchAgents();
    }
  }, [isAgentsOpen, user]);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-10 box-border w-full flex-col bg-white shadow-inner shadow-[#ECECEC] flex",
        "max-w-[312px]"
      )}
    >
      <nav className="flex flex-col items-center pt-8">
        <Link
          className="ml-2 mr-auto w-fit px-4"
          href="/"
        >
          <Image
            src={Logo}
            alt="Site Logo"
            className="mt-12 md:mt-0"
          />
        </Link>
        {/* separator #1 */}
        <div className="mx-auto my-6 h-[1px] w-[80%] border-t-[0.01em] border-[#444]" />
        <div className="flex w-full flex-col gap-1 px-4">
          {user && (
            <button
              onClick={() => setIsAgentsOpen(!isAgentsOpen)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-lg border border-white bg-white px-3 py-2 font-semibold text-[#344054] transition-colors",
                isAgentsOpen ? "border-purple-200 bg-purple-50 text-purple-900" : null
              )}
            >
              <div className="flex items-center gap-2">
                <Bot 
                  size={20}
                  className="text-[#667085]" 
                />
                <span className="inline-block">All Agents</span>
              </div>
              <ChevronDown
                className={cn("transition-transform", isAgentsOpen && "rotate-180")}
                size={20}
                stroke="#667085"
              />
            </button>
          )}
          {isAgentsOpen && agents.map((agent) => (
            <Link
              key={agent._id}
              href={`/agents/${agent._id}`}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg border border-white bg-white px-3 py-2 pl-8 text-sm text-[#344054] transition-colors hover:bg-purple-50",
                segments.includes("agents") && segments.includes(agent._id)
                  ? "border-purple-200 bg-purple-50 text-purple-900"
                  : null
              )}
            >
              {agent.name}
            </Link>
          ))}
          {user && (
            <button
              onClick={() => setIsGPTOpen(!isGPTOpen)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-lg border border-white bg-white px-3 py-2 font-semibold text-[#344054] transition-colors",
                isGPTOpen ? "border-purple-200 bg-purple-50 text-purple-900" : null
              )}
            >
              <div className="flex items-center gap-2">
                <Image 
                  src={ChatIcon}
                  alt="Chat"
                  width={20}
                  height={20}
                />
                <span className="inline-block">All GPT</span>
              </div>
              <ChevronDown
                className={cn("transition-transform", isGPTOpen && "rotate-180")}
                size={20}
                stroke="#667085"
              />
            </button>
          )}
          {isGPTOpen && (
            <>
            <Link
                href="/gpt/research-assistant"
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border border-white bg-white px-3 py-2 pl-8 text-sm text-[#344054] transition-colors hover:bg-purple-50",
                  segments.includes("gpt") && segments.includes("seo-analyzer")
                    ? "border-purple-200 bg-purple-50 text-purple-900"
                    : null
                )}
              >
                Research Assistant
              </Link>
              <Link
                href="/gpt/seo-analyzer"
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border border-white bg-white px-3 py-2 pl-8 text-sm text-[#344054] transition-colors hover:bg-purple-50",
                  segments.includes("gpt") && segments.includes("seo-analyzer")
                    ? "border-purple-200 bg-purple-50 text-purple-900"
                    : null
                )}
              >
                SEO Analyzer
              </Link>
              <Link
                href="/gpt/crypto-analyzer"
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border border-white bg-white px-3 py-2 pl-8 text-sm text-[#344054] transition-colors hover:bg-purple-50",
                  segments.includes("gpt") && segments.includes("crypto-analyzer")
                    ? "border-purple-200 bg-purple-50 text-purple-900"
                    : null
                )}
              >
                Crypto Analyzer
              </Link>
              <Link
                href="/gpt/token-economics-expert"
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border border-white bg-white px-3 py-2 pl-8 text-sm text-[#344054] transition-colors hover:bg-purple-50",
                  segments.includes("gpt") && segments.includes("token-economics-expert")
                    ? "border-purple-200 bg-purple-50 text-purple-900"
                    : null
                )}
              >
                Token Economics Expert
              </Link>
            </>
          )}
          <Link
            href="/chats"
            className={cn(
              "flex w-full items-center gap-2 rounded-lg border border-white bg-white px-3 py-2 font-semibold text-[#344054] transition-colors",
              segments.includes("chats")
                ? "border-purple-200 bg-purple-50 text-purple-900"
                : null,
            )}
          >
            <HistoryIcon stroke="#667085" />
            <span className="inline-block">Chat History</span>
          </Link>
          {user && (
            <Link
              href="/agents/new"
              className={cn(
                "flex w-full items-center gap-2 rounded-lg border border-white bg-white px-3 py-2 font-semibold text-[#344054] transition-colors",
                segments.includes("agents") && segments.includes("new")
                  ? "border-purple-200 bg-purple-50 text-purple-900"
                  : null
              )}
            >
              <PlusIcon stroke="#667085" />
              <span className="inline-block">New Agent</span>
            </Link>
          )}
        </div>
      </nav>
      {/* separator #2 */}
      {/* <div className="mx-auto my-6 h-[1px] w-[80%] border-t-[0.5px] border-[#444]" />
      {user && (
        <div className="flex flex-col gap-2 px-8">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#344054]">
              Research Drafts
            </span>
            <span className="cursor-pointer text-sm font-medium text-[#444] opacity-75 hover:underline">
              View All
            </span>
          </div>
          <div className="mt-1 flex select-none flex-col rounded-[10px] border bg-white p-3">
            <div className="flex items-center gap-2">
              <PapersIcon width={48} />
              <span className="block text-sm font-medium text-[#444]">
                Blockchain Technology and Intelligence Together
              </span>
            </div>
            <span className="text-xs font-medium opacity-50">23 mins ago</span>
          </div>
          <div className="flex select-none flex-col rounded-[10px] border bg-white p-3">
            <div className="flex items-center gap-2">
              <PapersIcon width={48} />
              <span className="block text-sm font-medium text-[#444]">
                Blockchain Technology and Intelligence Together
              </span>
            </div>
            <span className="text-xs font-medium opacity-50">23 mins ago</span>
          </div>
        </div>
      )} */}
      {user ? (
        <div className="mb-2 mt-auto w-full px-8 pb-5">
          <span className="text-sm font-semibold text-[#344054]">My Stats</span>
          <div className="mt-2 flex gap-1">
            <div className="flex select-none flex-col rounded-[10px] border bg-white p-3">
              <span className="text-sm font-medium tracking-tight text-[#444] opacity-75">
                Contributions
              </span>
              <div className="flex items-center gap-1.5 md:mt-0 mt-4">
                <PapersIcon
                  width={16}
                  height={16}
                  className="text-black"
                />
                <span className="text-xl font-semibold">20</span>
              </div>
            </div>
            <div className="flex select-none flex-col rounded-[10px] border bg-white p-3">
              <span className="text-sm font-medium tracking-tight text-[#444] opacity-75">
                $ROAI Earned
              </span>
              <div className="flex items-center gap-1.5">
                <ImgBlurTemp
                  width={20}
                  height={20}
                />
                <span className="text-xl font-semibold">4200</span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-between rounded-lg border border-purple-200 bg-purple-50 px-3 py-2">
            <span className="text-xs text-purple-900">Invite to curate together.</span>
            <button
              className="rounded-[6px] bg-purple-600 p-1.5 md:text-sm text-xs uppercase text-white hover:bg-purple-700"
              onClick={() => {
                copyToClip("rolecieco");
                toast({
                  title: "Copied!",
                  description:
                    "Your referral code has been copied to your clipboard",
                });
              }}
            >
             rolecieco
            </button>
          </div>
          <div className="mt-6 flex cursor-default items-center justify-between gap-2 overflow-clip">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="h-10 w-10 shrink-0 rounded-full">
                <Avatar.Root className="inline-flex h-full w-full select-none items-center justify-center overflow-hidden rounded-full border align-middle">
                  <Avatar.Image
                    className="size-full h-full w-full object-cover"
                    src={
                      user.picture ||
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
                  {user.first_name}
                </span>
                <span className="inline-block w-full truncate text-sm text-[#444]">
                  {user.email}
                </span>
              </div>
            </div>
            <button
              onClick={signOut}
              disabled={isConnecting}
            >
              <LogOutIcon className="opacity-50" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex w-full cursor-pointer items-center gap-2 px-8 text-muted-foreground hover:text-foreground">
          <button
            className="w-full rounded-[12px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
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
    </aside>
  );
}
