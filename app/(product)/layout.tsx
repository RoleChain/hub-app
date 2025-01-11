"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import bgGrid from "@/assets/images/bgGrid.svg";
import { AuthContextProvider } from "@/contexts/auth.context";
import Nav from "@/components/Nav";
import { Toaster } from "@/components/ui/toaster";
import { ConversationProvider } from "@/contexts/conversation.context";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [isMobileMenuOpen]);

  return (
    <AuthContextProvider>
      <ConversationProvider>
        <div className="flex min-h-screen w-full flex-col">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div 
              className="mobile-menu-overlay"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Navigation */}
          <div className={cn(
            "fixed inset-y-0 left-0 z-40 w-[280px] transform transition-transform duration-300 ease-in-out bg-white md:relative md:transform-none md:w-[312px]",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
            "h-full overflow-y-auto"
          )}>
            <Nav />
          </div>

          {/* Main Content */}
          <div className={cn(
            "relative isolate flex flex-1 flex-col overflow-x-clip bg-[#FAFAFA]",
            "w-full transition-all duration-300",
            "px-4 pt-16 md:pt-0 md:pl-[312px]"
          )}>
            <div className="fixed inset-0 translate-x-[20%] overflow-clip pointer-events-none">
              <Image
                src={bgGrid}
                alt="bg image"
                aria-hidden
                fill
                className={cn(
                  "object-fill mix-blend-lighten",
                  "[mask-image:_radial-gradient(circle_600px_at_50%_30%,_black,_transparent_90%)]"
                )}
              />
            </div>
            <main className="relative isolate z-[0] grid flex-1 gap-2 md:gap-4 lg:px-9 lg:pt-10">
              {children}
            </main>
            <Toaster />
          </div>
        </div>
      </ConversationProvider>
    </AuthContextProvider>
  );
}
