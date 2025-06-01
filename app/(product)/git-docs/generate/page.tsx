"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, Download, Github, FileText, Code, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileData {
  path: string;
  content: string;
  language: string;
}

interface DocumentationResponse {
  repo_name: string;
  summary: string;
  files: FileData[];
  documentation: string;
}

export default function GenerateDocsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DocumentationResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  
  const repoUrl = searchParams.get('repo_url');
  const branch = searchParams.get('branch') || 'master';
  const extensions = searchParams.get('extensions') || 'sol,js,ts,json';
  const maxFiles = searchParams.get('max_files') || '15';

  useEffect(() => {
    if (repoUrl) {
      generateDocumentation();
    }
  }, [repoUrl]);

  const generateDocumentation = async () => {
    if (!repoUrl) {
      setError('Repository URL is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/generate-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'sk-rolechain-prod-43f5a28dbc1c4a0e8f7c9b2a',
          'Cookie': '__anonswqv_id=ae698b2e-52ea-4642-ae28-f6253606aa62'
        },
        body: JSON.stringify({
          repo_url: repoUrl,
          branch: branch,
          include_extensions: extensions.split(',').map(ext => ext.trim()),
          max_files: parseInt(maxFiles)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DocumentationResponse = await response.json();
      setResult(data);
      
      // Set the first file as selected by default
      if (data.files && data.files.length > 0) {
        setSelectedFile(data.files[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating documentation');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadDocumentation = () => {
    if (!result) return;
    
    const blob = new Blob([result.documentation], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.repo_name.replace('/', '-')}-documentation.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!repoUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Invalid Request</h1>
          <p className="text-gray-600 mb-4">Repository URL is required</p>
          <Button onClick={() => router.push('/git-docs')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/git-docs')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <div className="flex items-center space-x-2">
              <Github className="w-6 h-6 text-green-600" />
              <span className="text-lg font-semibold text-gray-800">GitDocs AI</span>
            </div>
          </div>
          
          {result && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(result.documentation)}
                className="flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Docs</span>
              </Button>
              <Button
                onClick={downloadDocumentation}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Generating Documentation</h2>
            <p className="text-gray-600 text-center max-w-md">
              Analyzing repository structure, extracting code, and generating comprehensive documentation...
            </p>
            <div className="mt-6 text-sm text-gray-500">
              <p>Repository: {repoUrl}</p>
              <p>Branch: {branch} | Extensions: {extensions} | Max Files: {maxFiles}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-red-600 text-center max-w-md mb-4">{error}</p>
            <Button onClick={generateDocumentation} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Repository Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Github className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{result.repo_name}</h1>
                    <p className="text-gray-600">{result.summary}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Documentation Generated</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* File List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <Code className="w-5 h-5" />
                    <span>Files ({result.files.length})</span>
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {result.files.map((file, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                          selectedFile?.path === file.path
                            ? 'bg-green-50 border-green-200 border-2'
                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-800 truncate">
                          {file.path.split('/').pop()}
                        </div>
                        <div className="text-xs text-gray-500">{file.path}</div>
                        <div className="text-xs text-green-600 mt-1">{file.language}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Selected File */}
                {selectedFile && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{selectedFile.path}</h3>
                        <p className="text-sm text-gray-600">{selectedFile.language}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(selectedFile.content)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-4 bg-white">
                      <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                        <code className="text-sm text-gray-800 whitespace-pre font-mono">
                          {selectedFile.content}
                        </code>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generated Documentation */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Generated Documentation</span>
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.documentation)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-6 bg-white">
                    <div className="bg-white text-gray-800 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                      {result.documentation}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 