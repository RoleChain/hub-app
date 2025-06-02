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
import remarkGfm from 'remark-gfm';
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
  sources?: Source[]; // Added to store sources per message
};

type Source = {
  host: string;
  link: string;
  title: string;
  text: string;
};

// Utility function to get or create session ID
const getOrCreateSessionId = (): string => {
  if (typeof window === 'undefined') {
    // Fallback for SSR
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  const SESSION_KEY = 'research_ai_session_id';
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
    console.log('🆕 Created new session ID:', sessionId);
  } else {
    console.log('♻️ Using existing session ID:', sessionId);
  }
  
  return sessionId;
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

  // 1. Process citations first, as this is independent of follow-up question removal.
  processedText = processCitations(processedText);

  // 2. Remove structured sections that start with Markdown headings like
  //    "## Suggested Follow-up Questions" or "## Follow-up Questions".
  //    This removes the heading and all content until the next Markdown heading or end of string.
  const markdownSectionRegex = /^(#+\s*(?:Suggested\s+)?Follow-up\s+Questions[:\s]*\r?\n)([\s\S]*?)(?=\r?\n#+|$)/gim;
  processedText = processedText.replace(markdownSectionRegex, '');

  // 3. Remove sections that start with a plain text line "Follow-up Questions:" (or variations)
  //    followed by a list or block of text. This is for cases where no Markdown '#' is used for the heading.
  //    It attempts to remove the heading line and the subsequent block of questions.
  const plainTextBlockRegex = /^[ \t]*(?:Suggested\s+)?Follow-up\s+Questions[:\s]*\r?\n([\s\S]+?)(?=\r?\n[ \t]*\r?\n|\r?\n[ \t]*\S|$)/gim;
  processedText = processedText.replace(plainTextBlockRegex, '');

  // 4. Remove any remaining standalone lines that are just "Follow-up Questions:" or variations,
  //    optionally wrapped in <p> tags. This targets the exact text seen in the screenshot if it survived previous steps.
  const specificUnwantedLineRegex = /^[ \t]*(?:<p[^>]*>\s*)?(?:Suggested\s+)?Follow-up Questions[:\s]*(?:<\/p>\s*)?$/gim;
  processedText = processedText.replace(specificUnwantedLineRegex, '');

  // 5. Specifically remove numbered lists where items end with a question mark.
  //    This regex looks for one or more lines starting with a number and a period,
  //    followed by any characters, and ending with a question mark.
  //    It will remove the entire block of such listed questions.
  const numberedQuestionsListRegex = /(?:^[ \t]*\d+\.\s+.*?\?$\s*)+/gim;
  processedText = processedText.replace(numberedQuestionsListRegex, '');

  // 6. Trim the result to remove any leading/trailing whitespace left after replacements.
  return processedText.trim();
};

// Let's update the title in all tooltip content sections to be clickable
// First, let's create a reusable tooltip content to avoid repetition
const createSourceTooltipContent = (source: Source) => (
  <TooltipContent 
    side="top" 
    align="center" 
    sideOffset={15}
    collisionPadding={10}
    className="max-w-xs p-3 bg-white rounded-lg shadow-lg border border-gray-200 z-[99999] relative"
  >
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

// NEW: Wrapper for citations to handle click-to-open tooltip
interface CitationWrapperProps {
  source: Source;
  sourceIndex: number;
  triggerContent: React.ReactNode; // Content for the trigger (e.g., number or text)
  isNumericCitation: boolean; // Differentiates styling for [1] vs. [Text a]
}

const CitationWrapper: React.FC<CitationWrapperProps> = ({ source, sourceIndex, triggerContent, isNumericCitation }) => {
  const [isOpen, setIsOpen] = useState(false);

  const triggerClassName = isNumericCitation
    ? "inline-flex items-center justify-center align-baseline w-4 h-4 bg-gray-200 text-gray-600 text-[10px] font-bold rounded-full leading-none text-center mx-0.5 mb-px no-underline hover:bg-gray-300 hover:text-gray-700 cursor-pointer"
    : "text-blue-600 underline cursor-pointer hover:text-blue-800";

  return (
    <Tooltip open={isOpen} onOpenChange={setIsOpen}>
      <TooltipTrigger
        asChild // Important for custom trigger styling and behavior
        onClick={(e) => {
          e.preventDefault(); // Prevent default link navigation
          setIsOpen(true);    // Open tooltip on click
        }}
      >
        <span className={triggerClassName}>{triggerContent}</span>
      </TooltipTrigger>
      {isOpen && createSourceTooltipContent(source)} 
      {/* Conditionally render content only when open to ensure it picks up latest position if DOM shifts */}
    </Tooltip>
  );
};

// NEW: Function to generate markdown components with message-specific sources
const getMarkdownComponents = (messageSpecificSources?: Source[]) => ({
  // Define the heading component with proper types
  h3: (props: React.HTMLProps<HTMLHeadingElement>) => { 
    return <h3 className="font-semibold mt-6 mb-2 text-lg">{props.children}</h3>; 
  },
  
  // Define the li component with proper types
  li: (props: React.HTMLProps<HTMLLIElement>) => {
    // Tailwind Prose typically handles li styling, but we ensure a common pitfall (margin on p inside li) is okay.
    // If children are paragraphs, they might get extra margins from Prose.
    // However, simple text content with inline code and citations should flow okay.
    return <li className="my-1">{props.children}</li>;
  },
  
  // Define the ol component with proper types
  ol: (props: React.HTMLProps<HTMLOListElement>) => {
    return <ol className="list-decimal list-inside space-y-2 my-4">{props.children}</ol>;
  },

  // Custom renderer for inline code to ensure it plays well with adjacent citations
  code: ({node, inline, className, children, ...props}: any) => {
    const match = /language-(\w+)/.exec(className || '')
    if (!inline && match) {
      // This is a block code, let Prose handle it or add custom block styling
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }    
    // For inline code, apply specific styling that doesn't interfere with adjacent elements.
    // Tailwind Prose applies `bg-gray-100`, `px-1`, `py-0.5`, `rounded-sm`, `font-mono`, `text-sm` by default.
    // We can keep this or slightly adjust. The key is to ensure it's `inline` display.
    return (
      <code 
        className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded-sm font-mono text-xs break-words"
        {...props}
      >
        {children}
      </code>
    );
  },
  
  a: ({ node, ...props }: any) => {
    const localSources = messageSpecificSources || [];
    const href = props.href || '';
    
    // Handle plain numeric links (rendered as small numbers)
    if (props.children && typeof props.children === 'string') {
      const numericMatch = props.children.toString().match(/^(\d+)$/);
      if (numericMatch) {
        const sourceIndex = parseInt(numericMatch[1]);
        const source = localSources[sourceIndex - 1];
        if (!source) return <>{props.children}</>;
        return (
          <CitationWrapper 
            source={source} 
            sourceIndex={sourceIndex} 
            triggerContent={sourceIndex}
            isNumericCitation={true} 
          />
        );
      }
    }
    
    // Handle reference-style links containing citation numbers ([Text][1])
    const refCiteMatch = href.match(/^#ref-cite-(\d+)$/);
    if (refCiteMatch) {
      const sourceIndex = parseInt(refCiteMatch[1]);
      const source = localSources[sourceIndex - 1];
      if (!source) return <>{props.children}</>;
      return (
        <CitationWrapper 
          source={source} 
          sourceIndex={sourceIndex} 
          triggerContent={props.children}
          isNumericCitation={false} 
        />
      );
    }
    
    // Handle bracketed citation numbers rendered as small numbers ([ [1] ], from [1])
    if (props.children && typeof props.children === 'string') {
      const refCitationMatch = props.children.toString().match(/^\[(\d+)\]$/);
      if (refCitationMatch) {
        const sourceIndex = parseInt(refCitationMatch[1]);
        const source = localSources[sourceIndex - 1];
        if (!source) return <>{props.children}</>;
        return (
          <CitationWrapper 
            source={source} 
            sourceIndex={sourceIndex} 
            triggerContent={sourceIndex} 
            isNumericCitation={true}
          />
        );
      }
    }

    // Handle standard citations (href="#cite-1", content like "[1]")
    const sourceIndexMatch = href.match(/^#cite-(\d+)$/);
    if (sourceIndexMatch) {
      const sourceIndex = parseInt(sourceIndexMatch[1]);
      const source = localSources[sourceIndex - 1];
      if (!source) {
        // If source is not found, render a non-interactive, slightly distinct indicator
        return <span className="text-red-500 text-xs align-super">[{sourceIndex}]?</span>;
      }
      return (
        <CitationWrapper 
          source={source} 
          sourceIndex={sourceIndex} 
          triggerContent={sourceIndex} // Display the number
          isNumericCitation={true}
        />
      );
    }

    // Regular links (no change, these don't use tooltips)
    return <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium" />;
  },
  
  // Add custom component for our follow-up container (if used, but currently FollowUpQuestions component handles this)
  // div: (props: React.HTMLProps<HTMLDivElement>) => { ... },
  
  // Add custom component for our follow-up buttons (if used, but currently FollowUpQuestions component handles this)
  // button: (props: React.ButtonHTMLAttributes<HTMLButtonElement> & { ... }) => { ... }
});

// New component to display sources inline for each message
const InlineSourcesDisplay: React.FC<{ sources: Source[], messageId: string }> = ({ sources, messageId }) => {
  if (!sources || sources.length === 0) return null;

  // Unique class names for navigation buttons for this specific instance
  const prevButtonClass = `swiper-button-prev-inline-${messageId}`;
  const nextButtonClass = `swiper-button-next-inline-${messageId}`;

  return (
    <div className="mb-4 pt-2 relative group"> {/* Added relative and group for nav buttons */}
      <h4 className="text-xs font-semibold mb-1.5 text-gray-600">Sources:</h4>
      <Swiper
        modules={[Navigation]}
        spaceBetween={8}
        slidesPerView={'auto'}
        navigation={{
          prevEl: `.${prevButtonClass}`,
          nextEl: `.${nextButtonClass}`,
        }}
        className="!pb-1"
      >
        {sources.map((source, index) => (
          <SwiperSlide key={index} className="!w-auto">
            <a
              href={source.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2 max-w-[140px] sm:max-w-[160px] h-full bg-white rounded-md border border-gray-200 hover:shadow-sm hover:border-gray-300 transition-all duration-200"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <img src={`https://www.google.com/s2/favicons?domain=${source.host}&sz=16`} alt="" className="w-3 h-3"/>
                <p className="text-[11px] font-medium text-purple-600 truncate">{source.host}</p>
              </div>
              <p className="text-xs text-gray-700 line-clamp-2 font-medium">{source.title}</p>
            </a>
          </SwiperSlide>
        ))}
        {/* Optional: Display a count similar to main swiper if desired */}
        {sources.length > 0 && (
            <SwiperSlide className="!w-auto">
                <div className="flex items-center justify-center p-2 h-full bg-gray-50 rounded-md border border-gray-200 text-xs text-gray-500 min-w-[70px]">
                    +{sources.length} sources
                </div>
            </SwiperSlide>
        )}
      </Swiper>

      {/* Navigation buttons for inline swiper */}
      {sources.length > 3 && ( // Show buttons if more than ~3 sources, adjust as needed
        <>
          <button className={`${prevButtonClass} absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-3 w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0`}>
            <ChevronLeft className="h-3 w-3 text-gray-600" />
          </button>
          <button className={`${nextButtonClass} absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-3 w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0`}>
            <ChevronRight className="h-3 w-3 text-gray-600" />
          </button>
        </>
      )}
    </div>
  );
};

// NEW: Skeleton Loader for the main Answer text and Follow-up questions part
const AnswerTextAndFollowUpSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Skeleton for Answer Header */}
      <div className="flex items-center mt-4 mb-3">
        <div className="bg-gray-200 p-2 rounded-md mr-2 w-10 h-10"></div>
        <div className="h-5 bg-gray-200 rounded-full w-24"></div>
      </div>
      
      {/* Skeleton for Answer Text */}
      <div className="space-y-2.5 mb-4 pl-3"> {/* Added pl-3 to align with assistant message padding */}
        <div className="h-3.5 bg-gray-200 rounded-full w-full"></div>
        <div className="h-3.5 bg-gray-200 rounded-full w-5/6"></div>
        <div className="h-3.5 bg-gray-200 rounded-full w-full"></div>
        <div className="h-3.5 bg-gray-200 rounded-full w-3/4"></div>
      </div>

      {/* Skeleton for Follow-up Questions */}
      <div className="mt-4 mb-4 pl-3"> {/* Added pl-3 to align */}
        <div className="h-4 bg-gray-200 rounded-full w-40 mb-2.5"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// NEW: Skeleton Loader for Assistant Message Block
const AssistantMessageSkeleton = () => {
  return (
    <div className="mb-8 animate-pulse">
      {/* Skeleton for Sources */}
      <div className="mb-4 pt-2">
        <div className="h-3.5 bg-gray-200 rounded-full w-20 mb-2.5"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-2 h-[60px] bg-gray-200 rounded-md"></div>
          ))}
        </div>
      </div>

      {/* Skeleton for Answer Header */}
      <div className="flex items-center mt-4 mb-3">
        <div className="bg-gray-200 p-2 rounded-md mr-2 w-10 h-10"></div>
        <div className="h-5 bg-gray-200 rounded-full w-24"></div>
      </div>
      
      {/* Skeleton for Answer Text */}
      <div className="space-y-2.5 mb-4">
        <div className="h-3.5 bg-gray-200 rounded-full w-full"></div>
        <div className="h-3.5 bg-gray-200 rounded-full w-5/6"></div>
        <div className="h-3.5 bg-gray-200 rounded-full w-full"></div>
        <div className="h-3.5 bg-gray-200 rounded-full w-3/4"></div>
      </div>

      {/* Skeleton for Follow-up Questions */}
      <div className="mt-4 mb-4">
        <div className="h-4 bg-gray-200 rounded-full w-40 mb-2.5"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SearchResults = () => {
  // const { user, error, isLoading } = useUser(); // Commented out
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params hook
  const query = searchParams.get('query'); // Get the 'query' parameter using the hook
  const [followUpInput, setFollowUpInput] = useState("");
  const [messages, setMessages] = useState<SearchMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [_sources, setGlobalSources] = useState<Source[]>([]); // Renamed to avoid confusion with msg.sources
  
  // Create a session ID that persists across the entire user session
  const [sessionId] = useState(() => getOrCreateSessionId());

  // Use session ID as part of thread ID for API calls
  const [threadId] = useState(() => `${sessionId}-thread-${Date.now()}`);

  // Add a ref to track if we've already made the initial request
  const initialRequestMade = React.useRef(false);

  // Function to clear session (useful for debugging or starting fresh)
  const clearSession = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('research_ai_session_id');
      console.log('🗑️ Session cleared');
      // Optionally reload the page to start fresh
      window.location.reload();
    }
  };

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

  // Log session information on component mount
  useEffect(() => {
    console.log('🔧 Search component initialized with:', {
      sessionId,
      threadId,
      query
    });
  }, []);

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
      setGlobalSources([]);
      setFollowUpInput("");

      const controller = new AbortController();
      const { signal } = controller;

      // Include session ID in the API URL and headers
      const apiUrl = `https://scrapper-api-service-558909567626.us-central1.run.app/summarize?query=${encodeURIComponent(searchQuery)}&engine=google&thread_id=${threadId}&session_id=${sessionId}`;
      
      console.log('🔍 Making API call with:', {
        sessionId,
        threadId,
        query: searchQuery
      });

      const response = await fetch(apiUrl, { 
        signal,
        headers: {
          'X-API-Key': 'sk-rolechain-prod-43f5a28dbc1c4a0e8f7c9b2a',
          'X-Session-ID': sessionId,
          'X-Thread-ID': threadId
        }
      });

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
                const currentSources = eventData.data.sources || [];
                setGlobalSources(currentSources); // Update global sources for UI elements that might need latest (e.g. future dev)
                setMessages(prevMessages => prevMessages.map(msg =>
                  msg.messageId === assistantMessageId
                    ? { ...msg, sources: currentSources } // Store sources on the specific message
                    : msg
                ));
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

  // SSE based streaming setup
  useEffect(() => {
    // Search automatically on page load if query parameter is present
    if (searchParams.get('q')) {
      handleSearch(searchParams.get('q') || "");
    }
  }, [searchParams]);

  // Update the FollowUpQuestions component with more compact styling
  const FollowUpQuestions: React.FC<{ messageContent: string, isProcessing: boolean, onQuestionClick: (question: string) => void }> = ({ messageContent, isProcessing, onQuestionClick }) => {
    const [questions, setQuestions] = useState<string[]>([]);
    
    useEffect(() => {
      if (!messageContent) {
        setQuestions([]);
        return;
      }
      
      let foundQuestions: string[] = []; // Initialize a new local array

      // Attempt 1: Look for a heading and extract numbered items under it
      const headingRegex = /#+\s*Suggested\s+Follow-up\s+Questions[\s\S]*?(?=#+|$)/i;
      const headingMatch = messageContent.match(headingRegex);
      
      if (headingMatch && headingMatch[0]) {
        const itemsUnderHeading = headingMatch[0].match(/^\s*\d+\.\s+(.*?)(?=\r?\n|$)/gm) || [];
        foundQuestions = itemsUnderHeading.map(item => 
          item.replace(/^\s*\d+\.\s+/, '').trim()
        ).filter(q => q.endsWith('?'));
      } 
      
      // Attempt 2 (if first attempt yielded no questions): Look for generic numbered lists of questions
      if (foundQuestions.length === 0) {
        const genericNumberedItemsRegex = /^\s*\d+\.\s+(.+?)(?=\r?\n|$)/gm;
        let match;
        const currentQuestionsList: string[] = [];
        while ((match = genericNumberedItemsRegex.exec(messageContent)) !== null) {
          const questionText = match[1] ? match[1].trim() : "";
          if (questionText.endsWith('?')) {
            currentQuestionsList.push(questionText);
          }
        }
        foundQuestions = currentQuestionsList;
      }
      
      // Final filter for safety - ensure all are actual questions
      foundQuestions = foundQuestions.filter(q => q && q.trim().endsWith('?'));
      
      setQuestions(foundQuestions); // Update state once with the collected questions

    }, [messageContent]);

    if (questions.length === 0) return null;

    return (
      <div className="mt-4 mb-4 max-w-[80%] pl-3"> {/* Adjusted margin and padding to align with assistant message */}
        <h3 className="text-sm font-semibold mb-1.5 text-gray-700">Suggested Follow-up Questions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {questions.map((question, index) => (
            <button
              key={index}
              onClick={() => onQuestionClick(question)}
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
            {/* Session info for debugging - remove in production */}
            <div className="text-xs text-gray-400 mr-2 hidden sm:block">
              Session: {sessionId.split('-').pop()}
            </div>
            <button 
              onClick={clearSession}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 text-xs hidden sm:block"
              title="Clear Session"
            >
              🗑️
            </button>
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
        <main className="flex-1 max-w-screen-xl w-full mx-auto p-4">
          {/* Display Query Prominently - This will be handled by user messages in the loop now */}
          {/* <h1 className="text-2xl font-semibold mb-6 text-gray-800">{query}</h1> */}

          {/* Answer Display Area - This will now encompass query, sources, answer, follow-ups per message thread */}
          <div className="mb-8">
            {/* Message Mapping - This will be the main content area */}
            <div className="pt-4 mb-4">
              <TooltipProvider delayDuration={100}>
                {messages.map((msg, msgIdx) => {
                  // Handle User Messages - These are the Query Titles
                  if (msg.role === 'user') {
                    // For subsequent user messages, add some top margin for separation
                    const marginTopClass = msgIdx > 0 ? "mt-12" : ""; 
                    return (
                      <div key={msg.messageId} className={`mb-3 ${marginTopClass}`}>
                        <h2 className="text-2xl font-semibold text-gray-800">{msg.content}</h2>
                      </div>
                    );
                  }
                  
                  if (msg.role === 'thinking') {
                    if (msg.sources && msg.sources.length > 0) {
                      // Sources are available, text is still loading
                      return (
                        <div key={msg.messageId} className="mb-8 border-t pt-6 opacity-0 animate-fadeIn">
                           {/* Render actual sources immediately */}
                          <div className="max-w-[80%] pl-3 pt-2 mb-1">
                             <InlineSourcesDisplay sources={msg.sources} messageId={msg.messageId} />
                          </div>
                          {/* Skeleton for the rest of the answer */}
                          <AnswerTextAndFollowUpSkeleton />
                        </div>
                      );
                    } else {
                      // No sources yet, show full skeleton for the entire assistant block
                      return <AssistantMessageSkeleton key={msg.messageId} />;
                    }
                  }
                  
                  if (msg.role === 'assistant') {
                    // Full content is available or streaming
                    return (
                      <div key={msg.messageId} className="mb-8 border-t pt-6 opacity-0 animate-fadeIn">
                        {/* Display sources for this specific message if they exist */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="max-w-[80%] pl-3 pt-2 mb-1">
                             <InlineSourcesDisplay sources={msg.sources} messageId={msg.messageId} />
                          </div>
                        )}

                        {/* Answer Header */}
                        <div className="flex items-center mt-4 mb-3">
                          <div className="bg-gray-100 p-2 rounded-md mr-2">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                          </div>
                          <h2 className="text-lg font-medium">Answer</h2>
                        </div>
                        
                        {/* Assistant Message Content */}
                        <div className="mb-4 flex justify-start">
                          <div className="inline-block p-3 rounded-lg max-w-[95%] sm:max-w-[85%] bg-transparent text-gray-800">
                            <div className="prose prose-sm max-w-none text-gray-800 
                                          prose-p:my-2 prose-li:my-1 prose-ul:my-2 prose-ol:my-2 
                                          prose-table:table-fixed prose-table:w-full prose-table:my-4 
                                          prose-thead:bg-gray-100 prose-th:p-2 prose-th:text-left prose-th:font-semibold 
                                          prose-td:p-2 prose-td:border-b prose-td:border-gray-200 prose-tr:border-b prose-tr:border-gray-200">
                              <ReactMarkdown 
                                components={getMarkdownComponents(msg.sources)} 
                                rehypePlugins={[rehypeRaw]} 
                                remarkPlugins={[remarkGfm]}
                              >
                                {preprocessMarkdown(msg.content)}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                        
                        {/* Render FollowUpQuestions for this specific assistant message */}
                        <FollowUpQuestions 
                          messageContent={msg.content} 
                          isProcessing={isProcessing} 
                          onQuestionClick={handleSearch} 
                        />
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
        <div className="max-w-screen-xl mx-auto px-2 sm:px-4"> {/* Reduced horizontal padding for xs screens */}
          <div className="mt-2 mb-2 sm:mt-4 sm:mb-4"> {/* Reduced vertical margin for xs screens */}
            <form onSubmit={handleFollowUpSearch} className="border rounded-xl sm:rounded-2xl overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-md">
              <div className="flex items-center px-2 py-2 sm:px-4 sm:py-3 bg-white"> {/* Reduced padding for xs screens */}
                <div className="hidden sm:flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 mr-2 flex-shrink-0 transition-transform duration-300 hover:scale-110">
                  <span className="text-white font-medium text-xs">pro</span>
                </div>
                {/* Corrected X button for smaller screens */}
                <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center mr-1 sm:mr-2 flex-shrink-0 transition-colors duration-300 hover:bg-gray-200">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </div>
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value)}
                    placeholder="Ask follow-up"
                    className="w-full border-none focus:outline-none focus:ring-0 placeholder-gray-400 text-gray-800 py-1 sm:py-2 text-sm sm:text-base transition-all duration-300 bg-transparent z-10"
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
                    className="p-1.5 sm:p-2 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-300"
                    disabled={isProcessing}
                  >
                    <Paperclip size={18} className="w-4 h-4 sm:w-5 sm:h-5 transform transition-transform duration-300 hover:rotate-15" />
                  </button>
                  <button 
                    type="button"
                    className="p-1.5 sm:p-2 rounded-full text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors duration-300"
                    disabled={isProcessing}
                  >
                    <Smile size={18} className="w-4 h-4 sm:w-5 sm:h-5 transform transition-transform duration-300 hover:scale-110" />
                  </button>
                  <button
                    type="submit"
                    className="ml-1 sm:ml-2 p-1.5 sm:p-2 rounded-full text-gray-700 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:bg-gray-50"
                    disabled={isProcessing || !followUpInput.trim()}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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