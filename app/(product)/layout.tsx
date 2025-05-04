"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import bgGrid from "@/assets/images/bgGrid.svg";
import { AuthContextProvider } from "@/contexts/auth.context";
import Nav from "@/components/Nav";
import { Toaster } from "@/components/ui/toaster";
import { ConversationProvider } from "@/contexts/conversation.context";
import { useState, useEffect } from "react";
import { Menu, ChevronLeft } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopNavHidden, setIsDesktopNavHidden] = useState(true);

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
          {/* <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button> */}

          {/* Desktop Nav Toggle Button */}
          <button 
            onClick={() => setIsDesktopNavHidden(!isDesktopNavHidden)}
            className={cn(
              "fixed top-3 z-50 p-1 bg-white rounded-lg hidden md:block transition-all duration-300",
              isDesktopNavHidden ? "left-4" : "left-[260px]"
            )}
          >
            <ChevronLeft className={cn(
              "h-6 w-6 transition-transform duration-300",
              isDesktopNavHidden ? "rotate-180" : ""
            )} />
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
            "fixed inset-y-0 left-0 z-40 w-[280px] transform transition-transform duration-300 ease-in-out bg-white h-full overflow-y-auto",
            // Mobile classes (default hidden, shown when menu open)
            "md:hidden",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
            // Desktop classes (in a separate div)
          )}>
            <Nav />
          </div>

          {/* Desktop Navigation */}
          <div className={cn(
            "",
            // Desktop only
            "",
            isDesktopNavHidden ? "hidden" : "block",
          )}>
            <Nav />
          </div>

          {/* Main Content */}
          <div className={cn(
            "relative isolate flex flex-1 flex-col overflow-x-clip bg-[#FAFAFA]",
            "w-full transition-all duration-300",
            "md:pt-0",
            isDesktopNavHidden ? "md:pl-0" : "md:pl-[312px]"
          )}>
            <div className="fixed inset-0 translate-x-[20%] overflow-clip pointer-events-none">
              {/* <Image
                src={bgGrid}
                alt="bg image"
                aria-hidden
                fill
                className={cn(
                  "object-fill mix-blend-lighten",
                  "[mask-image:_radial-gradient(circle_600px_at_50%_30%,_black,_transparent_90%)]"
                )}
              /> */}
            </div>
            <main className="">
              {children}
            </main>
            <Toaster />
          </div>
        </div>
      </ConversationProvider>
    </AuthContextProvider>
  );
}
