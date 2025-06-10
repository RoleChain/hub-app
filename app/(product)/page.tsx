"use client";
import { Grid, Globe, Link, Mic, CloudSun, Landmark, ChevronDown, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";

const THEME_COLORS = {
  background: '#FFFFFF',  // White background 
  sidebarBg: '#FFFFFF',
  // Vibrant gradient for main heading from pink to purple
  textGradient: 'linear-gradient(to right, #E93A90, #8A63D2)',
  textSecondary: '#52525B',
  buttonBg: '#FFFFFF',
  buttonHoverBg: '#F3F4F6',
  inputBorder: '#E5E7EB',
  inputFocusBorder: '#E93A90', 
  inputBg: '#FFFFFF',
  suggestionBg: '#F9FAFB',  
  proBadgeBg: '#FCE7F3',   
  proBadgeText: '#E93A90', 
  micButtonBg: '#E93A90',  
  micButtonIcon: '#FFFFFF',
  footerText: '#71717A',
  helpIconBg: '#F7F7F8',
  helpIconFg: '#52525B',
  // Vibrant gradient for buttons from pink to blue as seen in the screenshot
  buttonGradient: 'linear-gradient(to right, #E93A90, #8A63D2, #6366F1)',
};

export default function Page() {
  const router = useRouter();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isGatedDialogOpen, setIsGatedDialogOpen] = useState(false);
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const swiperRef = useRef(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.length > 0) {
      setSuggestions([
        `${value} in finance`,
        `${value} latest news`,
        `${value} market analysis`,
        `${value} trends`
      ]);
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && inputValue.trim() !== '') {
      // Navigate to the search results page with the query
      router.push(`/search?query=${encodeURIComponent(inputValue)}`);
    }
  };

  const handlEnter = () => {
      // Navigate to the search results page with the query
      router.push(`/search?query=${encodeURIComponent(inputValue)}`);
  };

  useEffect(() => {
    console.log(user)
    if (!user) {
      // setIsAuthDialogOpen(true);
    } else {
      if (!user?.isGated) {
        // setIsGatedDialogOpen(true);
      }
    }
  }, [user]);

  return (
    <div className="flex flex-col  overflow-hidden h-[100vh]">
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-4xl flex flex-col items-center px-4 md:px-16">
          <h1 className="text-4xl font-semibold mb-8 bg-clip-text text-transparent animate-fadeIn" 
              style={{ backgroundImage: THEME_COLORS.textGradient }}>
            What do you want to know?
          </h1>

          <div className="relative w-full bg-white rounded-2xl shadow-lg border border-[#E5E7EB] focus-within:border-[#E056B8] focus-within:ring-1 focus-within:ring-[#E056B8] mb-8 transition-all duration-300 hover:shadow-xl animate-fadeIn animation-delay-300 z-10">
            <div className="flex flex-col p-4">
              <div className="flex items-center mb-6">
            <Input
              type="text"
              placeholder="Ask anything..."
              value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="flex-grow py-3 px-4 border-none focus:ring-0 text-lg bg-transparent text-gray-700 placeholder:text-gray-400 placeholder:text-[16px]"
                />
              </div>
              
              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 max-h-60 overflow-y-auto z-[9999]">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
                      onClick={() => {
                        setInputValue(suggestion);
                        setSuggestions([]);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant="ghost"
                    size="sm" 
                    className="text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 h-auto rounded-full transition-all duration-200 whitespace-nowrap"
            >
                    <Globe className="h-3 w-3 mr-2 text-purple-600" />
                    <span className="font-size-xs">Research</span>
            </Button>
          </div>

                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full w-8 h-8 transition-all duration-200">
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button size="icon" className="rounded-full w-9 h-9 shadow-md hover:shadow-lg transition-all duration-300" 
                          style={{ background: THEME_COLORS.buttonGradient }}>
                    <Mic className="h-4 w-4 text-white" />
                  </Button>
                  <Button onClick={handlEnter} size="icon" className="rounded-full w-9 h-9 shadow-md hover:shadow-lg transition-all duration-300"
                          style={{ background: THEME_COLORS.buttonGradient }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 12h14" />
                    </svg>
             </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full mb-8 animate-fadeIn animation-delay-300 relative group">
            <Swiper
              modules={[Navigation]}
              spaceBetween={16}
              slidesPerView="auto"
              navigation={{
                prevEl: '.swiper-button-prev-custom',
                nextEl: '.swiper-button-next-custom',
              }}
              className="mySwiper px-2"
            >
              <SwiperSlide className="!w-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3" style={{ minWidth: '220px' }}>
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Grid className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-800">Custom Agents</h3>
                    <p className="text-xs text-gray-500">Create AI agents</p>
                  </div>
                </div>
              </SwiperSlide>
              
              <SwiperSlide className="!w-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3" style={{ minWidth: '240px' }}>
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Link className="h-4 w-4 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-800">Workflow Builder</h3>
                    <p className="text-xs text-gray-500">Connect agents for automation</p>
                  </div>
                </div>
              </SwiperSlide>
              
              <SwiperSlide className="!w-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3" style={{ minWidth: '260px' }}>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CloudSun className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-800">Personalized News</h3>
                    <p className="text-xs text-gray-500">Get curated insights daily</p>
                  </div>
                </div>
              </SwiperSlide>
              
              <SwiperSlide className="!w-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3" style={{ minWidth: '200px' }}>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Landmark className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-800">Finance</h3>
                    <p className="text-xs text-gray-500">Market updates</p>
                  </div>
                </div>
              </SwiperSlide>

              <SwiperSlide className="!w-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3" style={{ minWidth: '240px' }}>
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Globe className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-800">Travel Planning</h3>
                    <p className="text-xs text-gray-500">Personalized itineraries</p>
                  </div>
                </div>
              </SwiperSlide>

              <SwiperSlide className="!w-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3" style={{ minWidth: '220px' }}>
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Mic className="h-4 w-4 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-800">Voice Assistant</h3>
                    <p className="text-xs text-gray-500">Smart conversations</p>
                  </div>
                </div>
              </SwiperSlide>

              <SwiperSlide className="!w-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3" style={{ minWidth: '230px' }}>
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <HelpCircle className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-800">Quick Support</h3>
                    <p className="text-xs text-gray-500">24/7 assistance</p>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
            
            {/* Custom navigation buttons */}
            <button className="swiper-button-prev-custom absolute left-0 top-1/2 transform -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <button className="swiper-button-next-custom absolute right-0 top-1/2 transform -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-5 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-gray-500">
            <a href="#" className="hover:text-purple-600 transition-colors duration-200">Pro</a>
            <a href="#" className="hover:text-purple-600 transition-colors duration-200">Enterprise</a>
            <a href="#" className="hover:text-purple-600 transition-colors duration-200">API</a>
            <a href="#" className="hover:text-purple-600 transition-colors duration-200">Blog</a>
            <a href="#" className="hover:text-purple-600 transition-colors duration-200">Careers</a>
            <a href="#" className="hover:text-purple-600 transition-colors duration-200">Store</a>
            <a href="#" className="hover:text-purple-600 transition-colors duration-200">Finance</a>
            <div className="flex items-center">
              <span>English</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
