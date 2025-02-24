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
import { Users, MessageSquare, UserCircle, Wrench, BarChart2, Activity } from "lucide-react";
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
    <aside className="fixed inset-y-0 left-0 z-10 w-[280px] bg-white p-4 flex flex-col">
      <nav className="flex flex-col h-full">
        {/* Logo */}
        <Link href="/" className="flex items-center mb-4">
          <Image
            src={Logo}
            alt="RolechAin"
            className="h-8"
          />
        </Link>

        {/* Main Navigation */}
        <div className="space-y-0.5">
          <Link
            href="/get-started"
            className="flex items-center w-full px-3 py-1.5 text-white rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
          >
            Get Started
          </Link>
          <Link
            href="/settings"
            className="flex items-center w-full px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            Settings
          </Link>
          <Link
            href="/templates"
            className="flex items-center w-full px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Templates
          </Link>
        </div>

        {/* Workforce Section */}
        <div className="space-y-0.5 mt-2">
          <div className="px-3 text-xs font-medium text-gray-500">Workforce</div>
          <Link
            href="/agents"
            className="flex items-center w-full px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Users className="w-4 h-4 mr-2" />
            Agents
          </Link>
          <Link
            href="/gpt"
            className="flex items-center w-full px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            GPT
          </Link>
          <Link
            href="/role"
            className="flex items-center w-full px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <UserCircle className="w-4 h-4 mr-2" />
            Role
          </Link>
          <Link
            href="/tools"
            className="flex items-center w-full px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Wrench className="w-4 h-4 mr-2" />
            Tools
          </Link>
        </div>

        {/* Monitor Section */}
        <div className="space-y-0.5 mt-2">
          <div className="px-3 text-xs font-medium text-gray-500">Monitor</div>
          <Link
            href="/analytics"
            className="flex items-center w-full px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <BarChart2 className="w-4 h-4 mr-2" />
            Analytics
          </Link>
          <Link
            href="/activity"
            className="flex items-center w-full px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Activity className="w-4 h-4 mr-2" />
            Activity Center
          </Link>
        </div>

        {/* Stats Section - updated design */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="px-3 text-xs font-medium text-gray-500 mb-2">My Stats</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-white rounded-xl border border-gray-100">
              <div className="text-gray-600 text-sm mb-1">Credits</div>
              <div className="text-2xl text-center font-semibold">20</div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-gray-100">
              <div className="text-gray-600 text-sm mb-1">Gems</div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
                <span className="text-2xl font-semibold">4200</span>
              </div>
            </div>
          </div>
          
          {/* Invite Card */}
          <div className="mt-3 p-3 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50">
            <div className="text-sm font-medium mb-2">Invite & Earn a Rolecieco!</div>
            <div className="text-xs text-gray-600 mb-2">Share friends and unlock exclusive rewards!</div>
            <button
              onClick={() => {
                copyToClip("ROLECIECO");
                toast({
                  title: "Copied!",
                  description: "Referral code copied to clipboard",
                });
              }}
              className="w-full py-2 text-center text-white rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
            >
              ROLECIECO
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
}
