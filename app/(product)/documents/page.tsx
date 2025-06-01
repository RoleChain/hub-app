"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Upload, FileText, Brain, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Document AI topic suggestions with icons
const documentTopics = [
  { icon: "📄", text: "contract analysis and review", category: "legal" },
  { icon: "📊", text: "financial report summarization", category: "finance" },
  { icon: "🔍", text: "research paper insights", category: "research" },
  { icon: "📝", text: "meeting notes optimization", category: "productivity" },
  { icon: "🏥", text: "medical records processing", category: "healthcare" },
  { icon: "📋", text: "compliance document audit", category: "legal" },
  { icon: "💼", text: "business proposal enhancement", category: "business" },
  { icon: "📚", text: "educational content creation", category: "education" },
  { icon: "🔧", text: "technical documentation update", category: "technical" },
  { icon: "📈", text: "data analysis report generation", category: "analytics" },
  { icon: "🎯", text: "marketing copy optimization", category: "marketing" },
  { icon: "⚖️", text: "legal brief summarization", category: "legal" },
  { icon: "🏗️", text: "project documentation review", category: "project" },
  { icon: "🧬", text: "research data extraction", category: "research" },
  { icon: "💡", text: "innovation proposal drafting", category: "innovation" }
];

export default function DocumentsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll topics from right to left
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollAmount = 2; // Pixels to scroll per frame
        
        container.scrollLeft += scrollAmount;
        
        // Reset scroll when reaching the end
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
          container.scrollLeft = 0;
        }
      }
    }, 50); // Smooth 60fps scrolling

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/documents/process?query=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleTopicClick = (topic: string) => {
    setQuery(topic);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-800">Techilia</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              document intelligence
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Transform any document with AI. Get insights, summaries, and intelligent updates from all your files
            </p>
          </div>

          {/* Animated Features */}
          <div className="flex items-center justify-center space-x-8 py-8">
            <div className="flex items-center space-x-2 text-blue-600 animate-pulse">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium">Instant Analysis</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-600 animate-pulse" style={{ animationDelay: '0.5s' }}>
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Smart Insights</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-800 animate-pulse" style={{ animationDelay: '1s' }}>
              <FileText className="w-5 h-5" />
              <span className="text-sm font-medium">Auto Enhancement</span>
            </div>
          </div>

          {/* Sliding Topics */}
          <div className="w-full space-y-4">
            {/* First Row */}
            <div className="w-full overflow-hidden py-2">
              <div 
                className="flex space-x-4 px-6 overflow-x-hidden"
                style={{ 
                  width: 'max-content',
                  animation: 'slideRightToLeft 45s linear infinite'
                }}
              >
                {/* First row topics */}
                {[
                  { icon: "📄", text: "contract analysis and review" },
                  { icon: "💼", text: "business proposal enhancement" },
                  { icon: "📊", text: "financial report summarization" },
                  { icon: "🏥", text: "medical records processing" },
                  { icon: "📈", text: "data analysis report generation" },
                  { icon: "🔍", text: "research paper insights" },
                  { icon: "⚖️", text: "legal brief summarization" },
                  { icon: "🎯", text: "marketing copy optimization" }
                ].concat([
                  { icon: "📄", text: "contract analysis and review" },
                  { icon: "💼", text: "business proposal enhancement" },
                  { icon: "📊", text: "financial report summarization" },
                  { icon: "🏥", text: "medical records processing" },
                  { icon: "📈", text: "data analysis report generation" },
                  { icon: "🔍", text: "research paper insights" },
                  { icon: "⚖️", text: "legal brief summarization" },
                  { icon: "🎯", text: "marketing copy optimization" }
                ]).map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => handleTopicClick(topic.text)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white rounded-full border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 whitespace-nowrap group hover:scale-105"
                  >
                    <span className="text-base">{topic.icon}</span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                      {topic.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Second Row */}
            <div className="w-full overflow-hidden py-2">
              <div 
                className="flex space-x-4 px-6 overflow-x-hidden"
                style={{ 
                  width: 'max-content',
                  animation: 'slideLeftToRight 50s linear infinite'
                }}
              >
                {/* Second row topics */}
                {[
                  { icon: "📝", text: "meeting notes optimization" },
                  { icon: "📋", text: "compliance document audit" },
                  { icon: "📚", text: "educational content creation" },
                  { icon: "🔧", text: "technical documentation update" },
                  { icon: "🏗️", text: "project documentation review" },
                  { icon: "🧬", text: "research data extraction" },
                  { icon: "💡", text: "innovation proposal drafting" },
                  { icon: "📑", text: "policy document analysis" }
                ].concat([
                  { icon: "📝", text: "meeting notes optimization" },
                  { icon: "📋", text: "compliance document audit" },
                  { icon: "📚", text: "educational content creation" },
                  { icon: "🔧", text: "technical documentation update" },
                  { icon: "🏗️", text: "project documentation review" },
                  { icon: "🧬", text: "research data extraction" },
                  { icon: "💡", text: "innovation proposal drafting" },
                  { icon: "📑", text: "policy document analysis" }
                ]).map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => handleTopicClick(topic.text)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white rounded-full border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 whitespace-nowrap group hover:scale-105"
                  >
                    <span className="text-base">{topic.icon}</span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                      {topic.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Third Row */}
            <div className="w-full overflow-hidden py-2">
              <div 
                className="flex space-x-4 px-6 overflow-x-hidden"
                style={{ 
                  width: 'max-content',
                  animation: 'slideRightToLeft 55s linear infinite'
                }}
              >
                {/* Third row topics */}
                {[
                  { icon: "🎓", text: "academic paper review" },
                  { icon: "📈", text: "market research analysis" },
                  { icon: "🏛️", text: "government document processing" },
                  { icon: "🌐", text: "multilingual document translation" },
                  { icon: "📊", text: "survey data compilation" },
                  { icon: "🔒", text: "confidential document redaction" },
                  { icon: "📋", text: "quality assurance reports" },
                  { icon: "💰", text: "invoice and receipt processing" }
                ].concat([
                  { icon: "🎓", text: "academic paper review" },
                  { icon: "📈", text: "market research analysis" },
                  { icon: "🏛️", text: "government document processing" },
                  { icon: "🌐", text: "multilingual document translation" },
                  { icon: "📊", text: "survey data compilation" },
                  { icon: "🔒", text: "confidential document redaction" },
                  { icon: "📋", text: "quality assurance reports" },
                  { icon: "💰", text: "invoice and receipt processing" }
                ]).map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => handleTopicClick(topic.text)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white rounded-full border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 whitespace-nowrap group hover:scale-105"
                  >
                    <span className="text-base">{topic.icon}</span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                      {topic.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div className="w-full max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative group">
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Describe what you want to do with your document..."
                  className="w-full h-14 pl-6 pr-32 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                />
                <div className="absolute right-2 top-2 flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 px-3 rounded-xl border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  <Button
                    type="submit"
                    className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    disabled={!query.trim()}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setQuery(`Analyze uploaded document: ${e.target.files[0].name}`);
                    }
                  }}
                />
              </div>
            </form>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button 
              onClick={() => router.push('/documents/learn')}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300 flex items-center justify-center space-x-2 mx-auto group"
            >
              <span>Learn how Document Intelligence works</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </main>

      {/* CSS for smooth right-to-left animation */}
      <style jsx>{`
        @keyframes slideRightToLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes slideLeftToRight {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
} 