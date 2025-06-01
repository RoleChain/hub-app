"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Copy,
  MoreHorizontal,
  FileText,
  Brain,
  Zap,
  Download,
  Share,
  RefreshCw
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProcessingMessage = {
  messageId: string;
  role: 'user' | 'assistant' | 'thinking';
  content: string;
};

export default function DocumentProcessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('query');
  const [followUpInput, setFollowUpInput] = useState("");
  const [messages, setMessages] = useState<ProcessingMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentType, setDocumentType] = useState<string>("");

  useEffect(() => {
    if (query && typeof query === 'string' && !messages.length && !isProcessing) {
      handleDocumentProcessing(query);
    }
  }, [query]);

  const handleDocumentProcessing = async (processingQuery: string) => {
    const userMessageId = Date.now().toString() + "-user";
    const assistantMessageId = Date.now().toString() + "-assistant";

    try {
      const userQuery: ProcessingMessage = { messageId: userMessageId, role: 'user', content: processingQuery };
      setMessages(prev => [...prev, userQuery, { messageId: assistantMessageId, role: 'thinking', content: 'Analyzing your document request...' }]);
      setIsProcessing(true);

      // Simulate document processing
      setTimeout(() => {
        setMessages(prev => prev.map(msg =>
          msg.messageId === assistantMessageId && msg.role === 'thinking'
            ? { ...msg, content: 'Processing document with AI...' }
            : msg
        ));
      }, 1000);

      setTimeout(() => {
        setMessages(prev => prev.map(msg =>
          msg.messageId === assistantMessageId && msg.role === 'thinking'
            ? { ...msg, content: 'Extracting insights and generating recommendations...' }
            : msg
        ));
      }, 2000);

      // Simulate final response
      setTimeout(() => {
        const response = generateDocumentResponse(processingQuery);
        setMessages(prev => prev.map(msg =>
          msg.messageId === assistantMessageId
            ? { ...msg, role: 'assistant' as const, content: response }
            : msg
        ));
        setIsProcessing(false);
      }, 3500);

    } catch (error) {
      console.error('Error processing document:', error);
      setIsProcessing(false);
    }
  };

  const generateDocumentResponse = (query: string): string => {
    // Simulate different responses based on query type
    if (query.includes('contract')) {
      setDocumentType('Legal Contract');
      return `# Contract Analysis Complete

## Key Findings
- **Contract Type**: Service Agreement
- **Duration**: 2 years with auto-renewal clause
- **Critical Clauses**: Payment terms, liability limitations, termination conditions
- **Risk Level**: Medium - Review recommended for clauses 7.3 and 12.1

## Recommendations
1. **Payment Terms**: Net 30 days - consider negotiating to Net 15
2. **Liability Cap**: Currently unlimited - recommend adding $50K cap
3. **Termination**: 90-day notice required - standard for this contract type

## Action Items
- [ ] Review liability limitations with legal team
- [ ] Negotiate payment terms
- [ ] Clarify intellectual property ownership in Section 9

*AI Confidence: 94% | Processing Time: 2.3 seconds*`;
    }

    if (query.includes('financial') || query.includes('report')) {
      setDocumentType('Financial Report');
      return `# Financial Report Analysis

## Executive Summary
Your Q3 financial report shows strong performance with **23% revenue growth** compared to Q2.

## Key Metrics
- **Revenue**: $2.4M (+23% QoQ)
- **Operating Expenses**: $1.8M (+12% QoQ)
- **Net Profit**: $600K (+45% QoQ)
- **Cash Flow**: Positive $400K

## Insights
1. **Revenue Growth**: Driven primarily by enterprise customer acquisition
2. **Cost Efficiency**: Operating leverage improving with 12% expense growth vs 23% revenue growth
3. **Profitability**: Margin expansion from 18% to 25%

## Recommendations
- Invest in sales team expansion to maintain growth trajectory
- Optimize marketing spend - 15% of budget underperforming
- Consider debt refinancing to reduce interest expenses

*Analysis based on standard financial metrics and industry benchmarks*`;
    }

    // Default response
    setDocumentType('Document');
    return `# Document Intelligence Analysis

## Summary
I've analyzed your document request for "${query}" and here's what I found:

## Key Insights
- Document appears to be ready for AI enhancement
- Multiple optimization opportunities identified
- Content structure is well-organized for processing

## Suggested Improvements
1. **Content Enhancement**: Add more specific details in key sections
2. **Structure Optimization**: Reorganize for better readability
3. **Data Extraction**: Key metrics and data points identified

## Next Steps
- Review the suggested changes
- Apply AI-recommended improvements
- Export the enhanced version

Would you like me to proceed with any specific modifications or provide more detailed analysis?`;
  };

  const handleFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (followUpInput.trim()) {
      handleDocumentProcessing(followUpInput);
      setFollowUpInput("");
    }
  };

  const handleBack = () => {
    router.push("/documents");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-screen-xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-800">Techilia</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-screen-xl w-full mx-auto p-6 space-y-6">
        {/* Query Display */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Processing Request</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">{query}</h1>
          {documentType && (
            <p className="text-sm text-gray-600 mt-2">Document Type: {documentType}</p>
          )}
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-blue-800 font-medium">AI Analysis in Progress</span>
            </div>
            <div className="mt-2 bg-blue-200 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          {messages.map((msg) => {
            if (msg.role === 'user') return null;
            
            if (msg.role === 'thinking') {
              return (
                <div key={msg.messageId} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-gray-600 italic">{msg.content}</span>
                  </div>
                </div>
              );
            }
            
            if (msg.role === 'assistant') {
              return (
                <div key={msg.messageId} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-gray-800">AI Analysis Results</span>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-800">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Regenerate
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-500 hover:text-green-600 p-2 rounded-lg hover:bg-green-50 transition-colors">
                        <ThumbsUp size={16} />
                      </button>
                      <button className="text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors">
                        <ThumbsDown size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
            
            return null;
          })}
        </div>
      </main>

      {/* Follow-up Input */}
      <footer className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t z-10">
        <div className="max-w-screen-xl mx-auto p-4">
          <form onSubmit={handleFollowUp} className="relative">
            <div className="flex items-center space-x-3 bg-white rounded-2xl border border-gray-200 p-3 shadow-sm">
              <Brain className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <Input
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                placeholder="Ask for more analysis or modifications..."
                className="flex-1 border-none focus:ring-0 text-gray-800 placeholder-gray-500"
                disabled={isProcessing}
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl"
                disabled={isProcessing || !followUpInput.trim()}
              >
                <Zap className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </footer>
    </div>
  );
} 