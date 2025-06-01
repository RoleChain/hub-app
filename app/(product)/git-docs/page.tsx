"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Github, Code, Zap, Sparkles, FileText, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Git repository analysis topics with icons
const gitTopics = [
  { icon: "📝", text: "smart contract documentation" },
  { icon: "🔧", text: "API reference generation" },
  { icon: "📊", text: "code architecture analysis" },
  { icon: "🚀", text: "deployment guide creation" },
  { icon: "🧪", text: "testing documentation" },
  { icon: "🔍", text: "security audit reports" },
  { icon: "📚", text: "developer onboarding guides" },
  { icon: "⚙️", text: "configuration documentation" },
  { icon: "🎯", text: "typescript interface docs" },
  { icon: "🔐", text: "authentication flow docs" },
  { icon: "🌐", text: "REST API documentation" },
  { icon: "📋", text: "project structure analysis" },
  { icon: "🏗️", text: "build process documentation" },
  { icon: "💡", text: "code best practices guide" },
  { icon: "📈", text: "performance optimization docs" },
  { icon: "🔄", text: "CI/CD pipeline documentation" }
];

export default function GitDocsPage() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("master");
  const [extensions, setExtensions] = useState("sol,js,ts,json");
  const [maxFiles, setMaxFiles] = useState("15");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll topics from right to left
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollAmount = 2;
        
        container.scrollLeft += scrollAmount;
        
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
          container.scrollLeft = 0;
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      const params = new URLSearchParams({
        repo_url: repoUrl.trim(),
        branch: branch,
        extensions: extensions,
        max_files: maxFiles
      });
      router.push(`/git-docs/generate?${params.toString()}`);
    }
  };

  const handleTopicClick = (topic: string) => {
    setRepoUrl(`https://github.com/example/repo-for-${topic.replace(/\s+/g, '-')}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Github className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-800">GitDocs AI</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-green-800 bg-clip-text text-transparent">
              git documentation generator
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Transform any Git repository into comprehensive documentation. Generate API docs, guides, and architecture analysis automatically
            </p>
          </div>

          {/* Animated Features */}
          <div className="flex items-center justify-center space-x-8 py-8">
            <div className="flex items-center space-x-2 text-green-600 animate-pulse">
              <Code className="w-5 h-5" />
              <span className="text-sm font-medium">Code Analysis</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-600 animate-pulse" style={{ animationDelay: '0.5s' }}>
              <FileText className="w-5 h-5" />
              <span className="text-sm font-medium">Auto Documentation</span>
            </div>
            <div className="flex items-center space-x-2 text-green-800 animate-pulse" style={{ animationDelay: '1s' }}>
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Smart Insights</span>
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
                {gitTopics.slice(0, 8).concat(gitTopics.slice(0, 8)).map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => handleTopicClick(topic.text)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white rounded-full border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-300 whitespace-nowrap group hover:scale-105"
                  >
                    <span className="text-base">{topic.icon}</span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors">
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
                {gitTopics.slice(8, 16).concat(gitTopics.slice(8, 16)).map((topic, index) => (
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

          {/* Repository Input Form */}
          <div className="w-full max-w-3xl mx-auto space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Main Repository URL Input */}
              <div className="relative group">
                <Input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="Enter GitHub repository URL (e.g., https://github.com/user/repo)"
                  className="w-full h-14 pl-6 pr-16 text-lg border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  required
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  disabled={!repoUrl.trim()}
                >
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Advanced Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <GitBranch className="w-4 h-4" />
                    <span>Branch</span>
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="h-12 w-full rounded-xl border-2 border-gray-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all duration-300 bg-white px-3"
                  >
                    <option value="master">master</option>
                    <option value="main">main</option>
                    <option value="develop">develop</option>
                    <option value="dev">dev</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <Code className="w-4 h-4" />
                    <span>File Extensions</span>
                  </label>
                  <Input
                    value={extensions}
                    onChange={(e) => setExtensions(e.target.value)}
                    placeholder="sol,js,ts,json"
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Max Files</span>
                  </label>
                  <Input
                    type="number"
                    value={maxFiles}
                    onChange={(e) => setMaxFiles(e.target.value)}
                    min="1"
                    max="50"
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button 
              onClick={() => router.push('/git-docs/learn')}
              className="text-green-600 hover:text-green-800 font-medium transition-colors duration-300 flex items-center justify-center space-x-2 mx-auto group"
            >
              <span>Learn how Git Documentation AI works</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </main>

      {/* CSS for smooth animations */}
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