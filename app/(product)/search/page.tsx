"use client";

import React, { useState, useEffect, useRef } from "react";
// import { useUser } from "@auth0/nextjs-auth0/client"; // Commented out
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Copy,
  MoreHorizontal,
  Paperclip,
  Smile,
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- Swiper Imports ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
// --- End Swiper Imports ---

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define message types
type SearchMessage = {
  messageId: string;
  role: 'user' | 'assistant' | 'thinking';
  content: string;
};

type Source = {
  host: string;
  link: string;
  title: string;
  text: string;
};

// Helper function to convert [number] citations to markdown links
const processCitations = (text: string): string => {
  // First, handle standalone citations [number] not part of a reference link
  let processedText = text.replace(/(?<!\])\[(\d+)\]/g, (match, number) => `[\[${number}\]](#cite-${number})`);
  
  // Handle reference-style links with citation format - check if first part is just a number
  processedText = processedText.replace(/\[(.*?)\]\[(\d+)\]/g, (match, linkText, number) => {
    // Check if linkText is just a number
    if (/^\d+$/.test(linkText)) {
      // If it's just a number, treat it like a regular citation
      return `[\[${linkText}\]](#cite-${linkText})`;
    } else {
      // Otherwise, it's a text reference
      return `[${linkText}](#ref-cite-${number})`;
    }
  });
  
  return processedText;
};

// Modify the preprocessMarkdown function to REMOVE follow-up questions
const preprocessMarkdown = (text: string): string => {
  let processedText = text;

  // 1. Process citations: [number] -> [[number]](#cite-number)
  processedText = processCitations(processedText);
  
  // 2. Remove the "Suggested Follow-up Questions" section entirely
  // Look for any section that might contain the follow-up questions
  
  // First, try to find a section with heading marker (#) followed by "Suggested Follow-up Questions"
  let followUpSectionRegex = /#+\s*Suggested\s+Follow-up\s+Questions[\s\S]*?(?=#+|$)/i;
  processedText = processedText.replace(followUpSectionRegex, '');
  
  // Also look for the text directly (without heading marker) as a fallback
  followUpSectionRegex = /Suggested\s+Follow-up\s+Questions[\s\S]*?(?=#+|$)/i;
  processedText = processedText.replace(followUpSectionRegex, '');
  
  // Specifically target the numbered questions pattern at the end of the document
  const questionsAtEndRegex = /(?:^|\n)(\d+\.\s+.*?\?[\s\S]*?)+$/;
  processedText = processedText.replace(questionsAtEndRegex, '');
  
  return processedText;
};

// Let's update the title in all tooltip content sections to be clickable
// First, let's create a reusable tooltip content to avoid repetition
const createSourceTooltipContent = (source: Source) => (
  <TooltipContent side="top" align="center" className="max-w-xs p-3 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999]">
    <div className="flex items-center gap-2 mb-1.5">
      <img src={`https://www.google.com/s2/favicons?domain=${source.host}&sz=16`} alt="" className="w-4 h-4"/>
      <p className="text-xs font-medium text-purple-600 truncate">{source.host}</p>
    </div>
    <a 
      href={source.link} 
      target="_blank"
      rel="noopener noreferrer"
      className="block mb-1 hover:underline"
    >
      <p className="text-sm text-gray-800 font-medium line-clamp-2">{source.title}</p>
    </a>
    <p className="text-xs text-gray-500 line-clamp-3">{source.text}</p>
  </TooltipContent>
);

const SearchResults = () => {
  // const { user, error, isLoading } = useUser(); // Commented out
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params hook
  const query = searchParams.get('query'); // Get the 'query' parameter using the hook
  const [followUpInput, setFollowUpInput] = useState("");
  const [messages, setMessages] = useState<SearchMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sources, setSources] = useState<Source[]>([]); // Add state for sources

  // Add a ref to track if we've already made the initial request
  const initialRequestMade = React.useRef(false);

  // Add a state to keep track of whether we're in the follow-up questions section
  const [followUpSectionActive, setFollowUpSectionActive] = useState(false);

  // Modified useEffect with ref check
  useEffect(() => {
    if (query && 
        typeof query === 'string' && 
        !messages.length && 
        !isProcessing && 
        !initialRequestMade.current) {
      initialRequestMade.current = true;
      handleSearch(query);
    }
  }, [query]);

  // Commented out the useEffect that checks for user/isLoading
  // useEffect(() => {
  //   if (!isLoading && !user) {
  //     router.push("/api/auth/login");
  //   }
  // }, [user, isLoading, router]);

  const handleSearch = async (searchQuery: string) => {
    const userMessageId = Date.now().toString() + "-user";
    const assistantMessageId = Date.now().toString() + "-assistant"; // Pre-generate ID for the assistant message

    try {
      const userQuery: SearchMessage = { messageId: userMessageId, role: 'user', content: searchQuery };
      // Add user message and an initial ASSISTANT message with thinking role and ID
      setMessages(prev => [...prev, userQuery, { messageId: assistantMessageId, role: 'thinking', content: 'Processing your request...' }]);
      setIsProcessing(true);
      setSources([]);
      setFollowUpInput("");

      const controller = new AbortController();
      const { signal } = controller;

      const apiUrl = `https://scrapper-api-service-558909567626.us-central1.run.app/summarize?query=${encodeURIComponent(searchQuery)}&engine=google`;
      const response = await fetch(apiUrl, { signal });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }
      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedSummary = '';
      let buffer = '';
      let summaryCompleteEventReceived = false;

      // Process the SSE stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            let eventData;
            try {
              eventData = JSON.parse(line.substring(6));
            } catch (e) {
              console.error("Failed to parse SSE data line:", line, e);
              continue;
            }

            // Update state based on event type
            switch (eventData.type) {
              case 'status':
                // Update the content of the message with assistantMessageId if it's still 'thinking'
                setMessages(prevMessages => prevMessages.map(msg =>
                  (msg.messageId === assistantMessageId && msg.role === 'thinking')
                    ? { ...msg, content: eventData.data.message }
                    : msg
                ));
                break;

              case 'sources':
                setSources(eventData.data.sources || []);
                 // Update the content of the message with assistantMessageId if it's still 'thinking'
                 setMessages(prevMessages => prevMessages.map(msg =>
                   (msg.messageId === assistantMessageId && msg.role === 'thinking' && msg.content === 'Processing your request...')
                     ? { ...msg, content: 'Analyzing sources...' }
                     : msg
                 ));
                break;

              case 'summary_delta':
                accumulatedSummary += eventData.data.text;
                // --- Update state progressively ---
                // Find the message by ID and update its content and role
                setMessages(prevMessages => prevMessages.map(msg =>
                  msg.messageId === assistantMessageId
                    ? { ...msg, role: 'assistant', content: accumulatedSummary } // Change role to 'assistant' on first delta
                    : msg
                ));
                break;

              case 'summary_complete':
                summaryCompleteEventReceived = true;
                 // Ensure the final message has the 'assistant' role
                 setMessages(prevMessages => prevMessages.map(msg =>
                    msg.messageId === assistantMessageId ? { ...msg, role: 'assistant' } : msg
                 ));
                break;

              default:
                console.warn("Unknown SSE event type:", eventData.type);
                break;
            }
          }
        }
      }

      // If the loop finished but 'summary_complete' wasn't received, update state now
      if (!summaryCompleteEventReceived && accumulatedSummary) {
          setMessages(prevMessages => {
            return prevMessages.map(msg =>
              msg.messageId === assistantMessageId
                 // --- Explicitly cast role ---
                ? { ...msg, role: 'assistant' as const, content: accumulatedSummary } 
                : msg
            ).filter(msg => msg.role !== 'thinking'); // Clean up thinking message here too
          });
      } else if (!summaryCompleteEventReceived && !accumulatedSummary) {
           // If stream ended with no summary, just remove thinking message
           setMessages(prev => prev.filter(msg => msg.messageId !== assistantMessageId || msg.role !== 'thinking')); // More specific filter
      }


    } catch (error) {
      console.error('Error processing search:', error);
      setMessages(prevMessages => {
         // Remove thinking/partial assistant message using the specific ID
        const filteredMessages = prevMessages.filter(msg => msg.messageId !== assistantMessageId);
        filteredMessages.push({
          messageId: Date.now().toString() + "-error",
          role: 'assistant',
          content: `Sorry, there was an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
        });
        return filteredMessages;
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFollowUpSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (followUpInput.trim()) {
      handleSearch(followUpInput);
      setFollowUpInput("");
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  // Commented out loading and error states related to useUser
  // if (isLoading)
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       Loading...
  //     </div>
  //   );
  // if (error)
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       {error.message}
  //     </div>
  //   );
  // Commented out the check for user
  // if (!user) return null;

  // The ReactMarkdown components with proper typing
  const markdownComponents = {
    // Define the heading component with proper types
    h3: (props: React.HTMLProps<HTMLHeadingElement>) => { 
      // Check if this is the follow-up questions heading
      if (props.children?.toString()?.includes('Suggested Follow-up Questions')) {
        // Set the state to indicate we're in the follow-up questions section
        setTimeout(() => setFollowUpSectionActive(true), 0);
        return <h3 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">{props.children}</h3>;
      }
      // If it's a different h3, we're no longer in that section
      setTimeout(() => setFollowUpSectionActive(false), 0);
      return <h3 className="font-semibold mt-6 mb-2">{props.children}</h3>; 
    },
    
    // Define the li component with proper types
    li: (props: React.HTMLProps<HTMLLIElement>) => {
      const content = typeof props.children === 'string' 
        ? props.children 
        : props.children && React.isValidElement(props.children) 
          ? props.children.props?.children 
          : '';
      
      // If we're in the follow-up section and this is formatted like a question
      if (
        followUpSectionActive && 
        typeof content === 'string' && 
        content.trim().endsWith('?')
      ) {
        return (
          <div className="border-b border-gray-100 last:border-b-0">
            <button
              onClick={() => handleSearch(content.trim())}
              disabled={isProcessing}
              className="w-full py-4 px-4 flex items-center justify-between text-left text-slate-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <span className="text-[17px] font-medium">{content.trim()}</span>
              <span className="text-gray-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </span>
            </button>
          </div>
        );
      }
      
      // Default rendering
      return <li className="my-1">{props.children}</li>;
    },
    
    // Define the ol component with proper types
    ol: (props: React.HTMLProps<HTMLOListElement>) => {
      // If we're in the follow-up questions section
      if (followUpSectionActive) {
        return (
          <div className="mt-4 mb-8 border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
            {props.children}
          </div>
        );
      }
      
      // Default rendering
      return <ol className="list-decimal list-inside space-y-2 my-4">{props.children}</ol>;
    },
    
    // Preserve the citation handling
    a: ({ node, ...props }: any) => {
      const href = props.href || '';
      
      // Handle plain numeric links that should be rendered as citation numbers
      if (props.children && typeof props.children === 'string') {
        const numericMatch = props.children.toString().match(/^(\d+)$/);
        if (numericMatch) {
          const sourceIndex = parseInt(numericMatch[1]);
          const source = sources[sourceIndex - 1];
          if (!source) return <>{props.children}</>;
          
          return (
            <Tooltip>
              <TooltipTrigger className="inline-block align-middle relative">
                <span
                  onClick={(e) => { e.preventDefault(); window.open(source.link, '_blank'); }}
                  className="inline-flex items-center justify-center align-baseline w-4 h-4 bg-gray-200 text-gray-600 text-[10px] font-bold rounded-full leading-none text-center mx-0.5 mb-px no-underline hover:bg-gray-300 hover:text-gray-700 cursor-pointer"
                >
                  {sourceIndex}
                </span>
              </TooltipTrigger>
              {createSourceTooltipContent(source)}
            </Tooltip>
          );
        }
      }
      
      // Handle reference-style links containing citation numbers
      const refCiteMatch = href.match(/^#ref-cite-(\d+)$/);
      if (refCiteMatch) {
        const sourceIndex = parseInt(refCiteMatch[1]);
        const source = sources[sourceIndex - 1];
        if (!source) return <>{props.children}</>;
        
        return (
          <Tooltip>
            <TooltipTrigger className="inline-block">
              <span
                onClick={(e) => { e.preventDefault(); window.open(source.link, '_blank'); }}
                className="text-blue-600 underline cursor-pointer hover:text-blue-800"
              >
                {props.children}
              </span>
            </TooltipTrigger>
            {createSourceTooltipContent(source)}
          </Tooltip>
        );
      }
      
      // Handle bracketed citation numbers
      if (props.children && typeof props.children === 'string') {
        const refCitationMatch = props.children.toString().match(/^\[(\d+)\]$/);
        if (refCitationMatch) {
          const sourceIndex = parseInt(refCitationMatch[1]);
          const source = sources[sourceIndex - 1];
          if (!source) return <>{props.children}</>;
          
          return (
            <Tooltip>
              <TooltipTrigger className="inline-block align-middle relative">
                <span
                  onClick={(e) => { e.preventDefault(); window.open(source.link, '_blank'); }}
                  className="inline-flex items-center justify-center align-baseline w-4 h-4 bg-gray-200 text-gray-600 text-[10px] font-bold rounded-full leading-none text-center mx-0.5 mb-px no-underline hover:bg-gray-300 hover:text-gray-700 cursor-pointer"
                >
                  {sourceIndex}
                </span>
              </TooltipTrigger>
              {createSourceTooltipContent(source)}
            </Tooltip>
          );
        }
      }

      // Handle standard citations
      const sourceIndexMatch = href.match(/^#cite-(\d+)$/);
      if (sourceIndexMatch) {
        const sourceIndex = parseInt(sourceIndexMatch[1]);
        const source = sources[sourceIndex - 1];
        if (!source) return <>{`[${sourceIndex}]`}</>;
        return (
          <Tooltip>
            <TooltipTrigger className="inline-block align-middle relative">
              <span
                onClick={(e) => { e.preventDefault(); window.open(source.link, '_blank'); }}
                className="inline-flex items-center justify-center align-baseline w-4 h-4 bg-gray-200 text-gray-600 text-[10px] font-bold rounded-full leading-none text-center mx-0.5 mb-px no-underline hover:bg-gray-300 hover:text-gray-700 cursor-pointer"
              >
                {sourceIndex}
              </span>
            </TooltipTrigger>
            {createSourceTooltipContent(source)}
          </Tooltip>
        );
      }

      // Regular links
      return <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium" />;
    },
    
    // Add custom component for our follow-up container
    div: (props: React.HTMLProps<HTMLDivElement>) => {
      if (props.className === 'follow-up-questions-container') {
        return (
          <div className="mt-4 mb-8 border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
            {props.children}
          </div>
        );
      }
      
      if (props.className === 'follow-up-question-item') {
        return <div className="border-b border-gray-100 last:border-b-0">{props.children}</div>;
      }
      
      return <div {...props} />;
    },
    
    // Add custom component for our follow-up buttons
    button: (props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
      // Define custom properties with proper typing
      'data-question'?: string;
    }) => {
      if (props.className === 'follow-up-button' && props['data-question']) {
        const question = decodeURIComponent(props['data-question']);
        
        return (
          <button
            onClick={() => handleSearch(question)}
            disabled={isProcessing}
            className="w-full py-4 px-4 flex items-center justify-between text-left text-slate-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <span className="text-[17px] font-medium">{props.children}</span>
            <span className="text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </span>
          </button>
        );
      }
      
      return <button {...props} />;
    }
  };

  // SSE based streaming setup
  useEffect(() => {
    // Search automatically on page load if query parameter is present
    if (searchParams.get('q')) {
      handleSearch(searchParams.get('q') || "");
    }
  }, [searchParams]);

  // Update the FollowUpQuestions component with more compact styling
  const FollowUpQuestions = () => {
    const [questions, setQuestions] = useState<string[]>([]);
    
    // Extract questions from all assistant messages when messages change
    useEffect(() => {
      const assistantMessages = messages.filter(msg => msg.role === 'assistant');
      if (assistantMessages.length === 0) return;
      
      // Get the last assistant message
      const lastMessage = assistantMessages[assistantMessages.length - 1];
      
      // Look for questions directly in the content
      let extractedQuestions: string[] = [];
      
      // First, try to find a section with a heading "Suggested Follow-up Questions"
      const headingRegex = /#+\s*Suggested\s+Follow-up\s+Questions[\s\S]*?(?=#+|$)/i;
      const headingMatch = lastMessage.content.match(headingRegex);
      
      if (headingMatch && headingMatch[0]) {
        // Extract the questions after the heading
        const numberedItems = headingMatch[0].match(/\d+\.\s+(.*?)(?:\n|$)/g) || [];
        extractedQuestions = numberedItems.map(item => item.replace(/^\s*\d+\.\s+/, '').trim());
      } 
      // If no heading section found, try looking for numbered questions directly
      else {
        // Look for a section that has numbered items 1. 2. 3. 4. etc.
        const fullContentQuestionsRegex = /(?:^|\n)\s*\d+\.\s+(.*?\?)\s*(?:\n|$)/g;
        let match;
        while ((match = fullContentQuestionsRegex.exec(lastMessage.content)) !== null) {
          if (match[1] && match[1].trim().endsWith('?')) {
            extractedQuestions.push(match[1].trim());
          }
        }
      }
      
      // Filter to only include items that look like questions (ending with '?')
      extractedQuestions = extractedQuestions.filter(q => q.trim().endsWith('?'));
      
      if (extractedQuestions.length > 0) {
        setQuestions(extractedQuestions);
      }
    }, [messages]);

    if (questions.length === 0) return null;

    return (
      <div className="mt-6 mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Suggested Follow-up Questions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {questions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleSearch(question)}
              disabled={isProcessing}
              className="text-left py-2 px-3 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 
                       transition-colors flex items-center justify-between group hover:border-gray-300 
                       disabled:opacity-50 shadow-sm"
            >
              <span className="font-medium text-gray-700 line-clamp-2 flex-1 mr-2">{question}</span>
              <span className="text-gray-400 group-hover:text-blue-500 flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header - Make it sticky */}
      <header className="border-b sticky top-0 bg-white z-20">
        <div className="max-w-screen-xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>
             {/* Removed query from header, maybe add a static title or leave empty */}
            {/* <h1 className="text-lg font-medium text-gray-800 truncate">Search Results</h1> */}
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
              <MoreHorizontal size={20} />
            </button>
            <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
              <Copy size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Wrap main content with TooltipProvider */}
      <TooltipProvider delayDuration={100}>
        <main className="flex-1 max-w-screen-xl w-full mx-auto p-4 overflow-y-auto">
          {/* Display Query Prominently */}
          <h1 className="text-2xl font-semibold mb-6 text-gray-800">{query}</h1>

          {/* --- Sources Section --- */}
          {sources.length > 0 && (
            <div className="mb-6 relative group">
               {/* Removed "Sources" heading for cleaner look like reference */}
               {/* <h3 className="text-sm font-semibold mb-2 text-gray-700">Sources</h3> */}
              <Swiper
                modules={[Navigation]}
                spaceBetween={8}
                slidesPerView={'auto'}
                navigation={{
                  prevEl: '.swiper-button-prev-sources',
                  nextEl: '.swiper-button-next-sources',
                }}
                className="!pb-1"
              >
                {sources.map((source, index) => (
                    <SwiperSlide key={index} className="!w-auto">
                      <a
                        href={source.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 max-w-[160px] sm:max-w-[180px] h-full bg-white rounded-md border border-gray-200 hover:shadow-sm hover:border-gray-300 transition-all duration-200"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <img src={`https://www.google.com/s2/favicons?domain=${source.host}&sz=16`} alt="" className="w-3 h-3"/>
                          <p className="text-[11px] font-medium text-purple-600 truncate">{source.host}</p>
                        </div>
                        <p className="text-xs text-gray-700 line-clamp-2 font-medium">{source.title}</p>
                      </a>
                    </SwiperSlide>
                  ))}
                   <SwiperSlide className="!w-auto">
                    <div className="flex items-center justify-center p-2 h-full bg-gray-50 rounded-md border border-gray-200 text-xs text-gray-500 min-w-[80px]">
                      +{sources.length} sources
                    </div>
                  </SwiperSlide>
              </Swiper>

              {/* Navigation buttons */}
               <button className="swiper-button-prev-sources absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-3 w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0">
                  <ChevronLeft className="h-3 w-3 text-gray-600" />
                </button>
                <button className="swiper-button-next-sources absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-3 w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0">
                  <ChevronRight className="h-3 w-3 text-gray-600" />
                </button>
            </div>
          )}
          {/* --- End Sources Section --- */}

          {/* Answer Display Area */}
          <div className="mb-8">
            {/* Updated Answer Header */}
            <div className="flex items-center mb-4"> {/* Removed justify-between */}
              <div className="bg-gray-100 p-2 rounded-md mr-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
              </div>
              <h2 className="text-lg font-medium">Answer</h2>
               {/* Removed the "1 task" div */}
            </div>
            {/* End Updated Answer Header */}

            {/* Message Mapping */}
            <div className="border-t pt-4 mb-4">
              <TooltipProvider delayDuration={100}>
                {messages.map((msg) => {
                  // Skip rendering user messages
                  if (msg.role === 'user') {
                    return null;
                  }
                  
                  if (msg.role === 'thinking') {
                    return (
                      <div key={msg.messageId} className="mb-4 flex justify-start">
                        <div className="inline-block p-3 rounded-lg max-w-[80%] bg-gray-100 text-gray-500 italic">
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '600ms' }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  if (msg.role === 'assistant') {
                    return (
                      <div key={msg.messageId}>
                        <div className="mb-4 flex justify-start">
                          <div className="inline-block p-3 rounded-lg max-w-[80%] bg-transparent text-gray-800">
                            <div className="prose prose-sm max-w-none text-gray-800 prose-p:my-2 prose-li:my-1 prose-ul:my-2 prose-ol:my-2">
                              <ReactMarkdown components={markdownComponents}>
                                {preprocessMarkdown(msg.content)}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                        
                        {/* Add the follow-up questions component for each assistant message */}
                        <FollowUpQuestions />
                      </div>
                    );
                  }
                  
                  return null;
                })}
              </TooltipProvider>
            </div>
            {/* End Message Display Area */}

            {/* Action buttons */}
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 text-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 text-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
                <span>Export</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 text-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
                <span>Rewrite</span>
              </button>
              <div className="ml-auto flex items-center space-x-2">
                <button className="text-gray-500 hover:text-gray-800 p-1">
                  <ThumbsUp size={18} />
                </button>
                <button className="text-gray-500 hover:text-gray-800 p-1">
                  <ThumbsDown size={18} />
                </button>
                <button className="text-gray-500 hover:text-gray-800 p-1">
                  <Copy size={18} />
                </button>
                <button className="text-gray-500 hover:text-gray-800 p-1">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
          </div>
          {/* End Answer Wrapper */}
        </main>
      </TooltipProvider> {/* Close TooltipProvider */}

      {/* Footer Area - Sticky, contains ONLY Input */}
      <footer className="sticky bottom-0 bg-transparent z-10">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="mt-4 mb-4">
            <form onSubmit={handleFollowUpSearch} className="border rounded-2xl overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-md">
              <div className="flex items-center px-4 py-4 bg-white">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 mr-2 flex-shrink-0 transition-transform duration-300 hover:scale-110">
                  <span className="text-white font-medium text-xs">pro</span>
                </div>
                <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center mr-2 flex-shrink-0 transition-colors duration-300 hover:bg-gray-200">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </div>
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value)}
                    placeholder="Ask follow-up"
                    className="w-full border-none focus:outline-none focus:ring-0 placeholder-gray-400 text-gray-800 py-2 text-base transition-all duration-300 bg-transparent z-10"
                    disabled={isProcessing}
                  />
                  {followUpInput.length > 0 && (
                    <div 
                      className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                      style={{ width: `${Math.min(100, followUpInput.length * 2)}%` }}
                    ></div>
                  )}
                </div>
                <div className="flex items-center">
                  <button 
                    type="button" 
                    className="p-2 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-300"
                    disabled={isProcessing}
                  >
                    <Paperclip size={20} className="transform transition-transform duration-300 hover:rotate-15" />
                  </button>
                  <button 
                    type="button"
                    className="p-2 rounded-full text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors duration-300"
                    disabled={isProcessing}
                  >
                    <Smile size={20} className="transform transition-transform duration-300 hover:scale-110" />
                  </button>
                  <button
                    type="submit"
                    className="ml-2 p-2 rounded-full text-gray-700 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:bg-gray-50"
                    disabled={isProcessing || !followUpInput.trim()}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SearchResults;