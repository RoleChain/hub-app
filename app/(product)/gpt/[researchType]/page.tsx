"use client";
import EmptyChat from "@/components/chat/EmptyChat";
import { AuthDialog } from "@/components/Dialogs";
import { toast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  ArrowDownIcon,
  Disc3Icon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
// import { chatApi } from "@/api";
import axios from "axios";
import Markdown from "markdown-to-jsx";
import CopyAction from "@/components/chat/MessageActions/Copy";
import { v4 } from "uuid";
import { marked } from 'marked';
import Question from "@/components/ReportGen/ResearchBlocks/Question";

type Message = {
  messageId: string;
  content: string;
  role: "user" | "assistant";
  sources?: unknown[];
  renderedContent?: string;
  symbol?: string;
  marketData?: {
    price: number;
    priceChange24h: number;
    marketCap: number;
    volume24h: number;
    ath: number;
    atl: number;
    sentiment: number;
    lastUpdated: string;
  };
};

const formatCryptoPrice = (price: number): string => {
  if (price < 0.01) return price.toFixed(6);
  if (price < 1) return price.toFixed(4);
  if (price < 10) return price.toFixed(3);
  return price.toFixed(2);
};

const Page = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowScrollToBottom, setIsShowScrollToBottom] = useState(false);
  const [seoAnalysisStep, setSeoAnalysisStep] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const queryInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const params = useParams();
  const researchType = params.researchType as string;
  console.log(researchType);

  const handleQuery = async (query: string) => {
    setMessages((prev) => [
      ...prev,
      {
        messageId: v4(),
        content: query,
        role: "user",
      },
    ]);
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');

      if (researchType === 'research-assistant') {
        const { data } = await axios.post(
          'https://api.rolechain.org/news/smart-search',
          { query },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (data.markdown) {
          // Create a formatted news content with search results
          const newsContent = `
            <div class="news-analysis-container space-y-6">
              <!-- Main Analysis -->
              <div class="prose max-w-none">
                ${marked(data.markdown)}
              </div>

              <!-- Search Results -->
              ${data.rawData?.searchResults?.[0]?.results?.organicResults ? `
                <div class="mt-8">
                  <h2 class="text-xl font-bold mb-4">Sources</h2>
                  <div class="grid gap-4">
                    ${data.rawData.searchResults[0].results.organicResults.map((result: any) => `
                      <div class="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                        <a href="${result.link}" target="_blank" rel="noopener noreferrer" class="block">
                          <h3 class="text-lg font-semibold text-blue-600 hover:text-blue-800 mb-2">${result.title}</h3>
                          <p class="text-gray-600 text-sm mb-2">${result.snippet}</p>
                          ${result.date ? `<div class="text-sm text-gray-500">${result.date}</div>` : ''}
                        </a>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              ${data.rawData?.searchResults?.[0]?.results?.metadata ? `
                <div class="text-sm text-gray-500 mt-4">
                  ${data.rawData.searchResults[0].results.metadata.totalResults} 
                  (${data.rawData.searchResults[0].results.metadata.searchTime})
                </div>
              ` : ''}
            </div>
          `;

          setMessages(prev => [
            ...prev,
            {
              messageId: v4(),
              role: "assistant",
              content: data.markdown,
              renderedContent: newsContent
            },
          ]);
        }
      } else if (researchType === 'token-economics-expert') {
        const formData = new FormData();
        formData.append('prompt', query);
        if (selectedFile) {
          formData.append('files', selectedFile);
        }

        const { data } = await axios.post(
          'https://api.rolechain.org/research/tokenomics',
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (data.success) {
          const recommendations = data.expert_recommendations;
          const analysisContent = `
            <div class="tokenomics-analysis-container space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Token Mechanics -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 class="text-lg font-semibold mb-3">🔧 Token Mechanics</h3>
                  <div class="space-y-2">
                    ${recommendations.token_mechanics.map((rec: string) => `
                      <div class="flex items-start gap-3">
                        <span class="text-blue-500 text-lg">•</span>
                        <span class="text-gray-800">${rec}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- Supply Analysis -->
                <div class="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 class="text-lg font-semibold mb-3">📊 Supply Analysis</h3>
                  <div class="space-y-2">
                    ${recommendations.supply_analysis.map((rec: string) => `
                      <div class="flex items-start gap-3">
                        <span class="text-purple-500 text-lg">•</span>
                        <span class="text-gray-800">${rec}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- Incentive Structure -->
                <div class="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 class="text-lg font-semibold mb-3">🎯 Incentive Structure</h3>
                  <div class="space-y-2">
                    ${recommendations.incentive_structure.map((rec: string) => `
                      <div class="flex items-start gap-3">
                        <span class="text-green-500 text-lg">•</span>
                        <span class="text-gray-800">${rec}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- Value Accrual -->
                <div class="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h3 class="text-lg font-semibold mb-3">💰 Value Accrual</h3>
                  <div class="space-y-2">
                    ${recommendations.value_accrual.map((rec: string) => `
                      <div class="flex items-start gap-3">
                        <span class="text-orange-500 text-lg">•</span>
                        <span class="text-gray-800">${rec}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Risks and Considerations -->
              <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 class="text-lg font-semibold mb-3">⚠️ Risks and Considerations</h3>
                <div class="space-y-2">
                  ${recommendations.risks_and_considerations.map((rec: string) => `
                    <div class="flex items-start gap-3">
                      <span class="text-red-500 text-lg">•</span>
                      <span class="text-gray-800">${rec}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Sustainability Assessment -->
              <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                <h3 class="text-lg font-semibold mb-3">♻️ Sustainability Assessment</h3>
                <p class="text-gray-800">${recommendations.sustainability_assessment}</p>
              </div>

              <!-- Expert Insights -->
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 class="text-lg font-semibold mb-3">💡 Expert Insights</h3>
                <p class="text-gray-800">${recommendations.expert_insights}</p>
              </div>
            </div>
          `;

          setMessages(prev => [
            ...prev,
            {
              messageId: v4(),
              role: "assistant",
              content: analysisContent,
            },
          ]);
        }
      } else if (researchType === 'seo-analyzer') {
        // Show analysis steps
        const steps = [
          'Fetching website content...',
          'Analyzing SERP data...',
          'Evaluating website performance...',
          'Checking technical SEO elements...',
          'Analyzing content quality...',
          'Generating recommendations...'
        ];

        let stepIndex = 0;
        const stepInterval = setInterval(() => {
          if (stepIndex < steps.length) {
            setSeoAnalysisStep(steps[stepIndex]);
            stepIndex++;
          }
        }, 12000); // Change step every 12 seconds

        const { data } = await axios.post(
          'https://api.rolechain.org/analyzer/analyze',
          { prompt: query },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        clearInterval(stepInterval);
        setSeoAnalysisStep('');

        if (data.success) {
          if (researchType === 'seo-analyzer') {
            let analysisContent = '';

            if (data.seo_analysis) {
              analysisContent = `
                <div class="seo-analysis-container space-y-6">
                  <div class="flex items-center gap-2 mb-4">
                    <h1 class="text-2xl font-bold">🔍 SEO Analysis Report for</h1>
                    <a href="${data.url}" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      ${data.url}
                    </a>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                      <h3 class="text-lg font-semibold mb-3">📊 Page Speed Score</h3>
                      <div class="text-4xl font-bold ${data.seo_analysis.technical.page_speed_score?.score >= 90 ? 'text-green-500' :
                  data.seo_analysis.technical.page_speed_score?.score >= 50 ? 'text-yellow-500' :
                    'text-red-500'
                }">
                        ${data.seo_analysis.technical.page_speed_score?.score || '0'}/100
                      </div>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                      <h3 class="text-lg font-semibold mb-3">📝 Content Stats</h3>
                      <div class="space-y-3">
                        <div class="flex justify-between items-center">
                          <span class="text-gray-600">Words</span>
                          <span class="font-semibold text-lg">${data.seo_analysis.content?.word_count || '0'}</span>
                        </div>
                        <div class="flex justify-between items-center">
                          <span class="text-gray-600">Reading Time</span>
                          <span class="font-semibold text-lg">${data.seo_analysis.content?.reading_time_minutes || '0'} min</span>
                        </div>
                      </div>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                      <h3 class="text-lg font-semibold mb-3">🔗 Link Analysis</h3>
                      <div class="space-y-3">
                        <div class="flex justify-between items-center">
                          <span class="text-gray-600">Total Links</span>
                          <span class="font-semibold text-lg">${data.seo_analysis.technical.links?.total || '0'}</span>
                        </div>
                        <div class="flex justify-between items-center">
                          <span class="text-gray-600">Internal Links</span>
                          <span class="font-semibold text-lg">${data.seo_analysis.technical.links?.internal || '0'}</span>
                        </div>
                        <div class="flex justify-between items-center">
                          <span class="text-gray-600">External Links</span>
                          <span class="font-semibold text-lg">${data.seo_analysis.technical.links?.external || '0'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  ${data.summary?.critical_issues ? `
                    <div class="mt-8">
                      <h2 class="text-xl font-bold mb-4">Critical Issues</h2>
                      <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                        ${data.summary.critical_issues.map((issue: string) => `
                          <div class="flex items-start gap-3 mb-3">
                            <span class="text-red-500 text-lg">•</span>
                            <span class="text-gray-800">${issue}</span>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}

                  ${data.summary?.quick_wins ? `
                    <div class="mt-8">
                      <h2 class="text-xl font-bold mb-4">⚡ Quick Wins</h2>
                      <div class="bg-green-50 border border-green-200 rounded-lg p-6">
                        ${data.summary.quick_wins.map((win: string) => `
                          <div class="flex items-start gap-3 mb-3">
                            <span class="text-green-500 text-lg">•</span>
                            <span class="text-gray-800">${win}</span>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}

                  ${data.expert_recommendations ? `
                    <div class="mt-8 space-y-8">
                      <div>
                        <h2 class="text-xl font-bold mb-4">💡 Opportunities</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <!-- Technical Recommendations -->
                          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 class="text-lg font-semibold mb-3">Technical Improvements</h3>
                            <div class="space-y-2">
                              ${data.expert_recommendations.technical_recommendations.map((rec: string) => `
                                <div class="flex items-start gap-3">
                                  <span class="text-blue-500 text-lg">•</span>
                                  <span class="text-gray-800">${rec}</span>
                                </div>
                              `).join('')}
                            </div>
                          </div>

                          <!-- Content Recommendations -->
                          <div class="bg-purple-50 border border-purple-200 rounded-lg p-6">
                            <h3 class="text-lg font-semibold mb-3">Content Strategy</h3>
                            <div class="space-y-2">
                              ${data.expert_recommendations.content_recommendations.map((rec: string) => `
                                <div class="flex items-start gap-3">
                                  <span class="text-purple-500 text-lg">•</span>
                                  <span class="text-gray-800">${rec}</span>
                                </div>
                              `).join('')}
                            </div>
                          </div>

                          <!-- Competitive Recommendations -->
                          <div class="bg-orange-50 border border-orange-200 rounded-lg p-6">
                            <h3 class="text-lg font-semibold mb-3">Competitive Edge</h3>
                            <div class="space-y-2">
                              ${data.expert_recommendations.competitive_recommendations.map((rec: string) => `
                                <div class="flex items-start gap-3">
                                  <span class="text-orange-500 text-lg">•</span>
                                  <span class="text-gray-800">${rec}</span>
                                </div>
                              `).join('')}
                            </div>
                          </div>

                          <!-- Keyword Strategy -->
                          <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                            <h3 class="text-lg font-semibold mb-3">Keyword Strategy</h3>
                            <div class="space-y-2">
                              ${data.expert_recommendations.keyword_strategy.map((rec: string) => `
                                <div class="flex items-start gap-3">
                                  <span class="text-emerald-500 text-lg">•</span>
                                  <span class="text-gray-800">${rec}</span>
                                </div>
                              `).join('')}
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Expert Insights -->
                      <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <h3 class="text-lg font-semibold mb-3">🎯 Expert Insights</h3>
                        <p class="text-gray-800">${data.expert_recommendations.expert_insights}</p>
                      </div>
                    </div>
                  ` : ''}
                </div>
              `;
            }

            setMessages(prev => [
              ...prev,
              {
                messageId: v4(),
                role: "assistant",
                content: analysisContent,
              },
            ]);
          } else if (data.markdown) {
            const chartId = v4();

            // Configure marked options if needed
            marked.setOptions({
              breaks: true,
              gfm: true
            });

            // Parse the markdown safely
            let parsedMarkdown;
            try {
              parsedMarkdown = marked(data.markdown);
            } catch (err) {
              console.error('Error parsing markdown:', err);
              parsedMarkdown = data.markdown;
            }

            // Add market data summary
            const marketDataHtml = data.marketData ? `
              <div class="market-data-summary mb-4">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="stat-item">
                    <div class="text-sm text-gray-500">Price</div>
                    <div class="font-bold">$${formatCryptoPrice(data.marketData.price)}</div>
                  </div>
                  <div class="stat-item">
                    <div class="text-sm text-gray-500">24h Change</div>
                    <div class="font-bold ${data.marketData.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}">
                      ${data.marketData.priceChange24h.toFixed(2)}%
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="text-sm text-gray-500">Market Cap</div>
                    <div class="font-bold">$${(data.marketData.marketCap / 1e6).toFixed(2)}M</div>
                  </div>
                  <div class="stat-item">
                    <div class="text-sm text-gray-500">24h Volume</div>
                    <div class="font-bold">$${(data.marketData.volume24h / 1e6).toFixed(2)}M</div>
                  </div>
                </div>
              </div>` : '';

            const combinedContent = `
              <div class="analysis-container">
                ${marketDataHtml}
                <div class="tradingview-widget-container mb-4" style="height: 500px !important;">
                  <div id="tradingview_${chartId}" style="height: 500px !important; min-height: 500px !important;"></div>
                </div>
                <div class="markdown-content">
                  ${parsedMarkdown}
                </div>
              </div>`;

            setMessages((prev) => [
              ...prev,
              {
                messageId: v4(),
                role: "assistant",
                content: data.markdown,
                renderedContent: combinedContent,
                symbol: data.symbol,
                marketData: data.marketData
              },
            ]);

            // Initialize TradingView widget
            setTimeout(() => {
              const script = document.createElement('script');
              script.src = "https://s3.tradingview.com/tv.js";
              script.async = true;
              script.onload = () => {
                const tryLoadChart = (index: number = 0) => {
                  if (index >= data.chartConfig.alternativePairs.length) {
                    console.error('No valid trading pair found');
                    return;
                  }

                  try {
                    // @ts-ignore
                    new TradingView.widget({
                      "width": "100%",
                      "height": "500",
                      "symbol": data.chartConfig.alternativePairs[index],
                      "interval": data.chartConfig.interval,
                      "timezone": "Etc/UTC",
                      "theme": "dark",
                      "style": "1",
                      "locale": "en",
                      "toolbar_bg": "#f1f3f6",
                      "enable_publishing": false,
                      "allow_symbol_change": true,
                      "container_id": `tradingview_${chartId}`,
                      "studies": [
                        "RSI@tv-basicstudies",
                        "MACD@tv-basicstudies",
                        "BB@tv-basicstudies"
                      ],
                      "autosize": false,
                      "loading_screen": { backgroundColor: "#000000" },
                      "onChartError": () => {
                        console.error(`Failed to load chart with pair ${data.chartConfig.alternativePairs[index]}`);
                        tryLoadChart(index + 1);
                      }
                    });
                  } catch (error) {
                    console.error(`Error initializing chart with pair ${data.chartConfig.alternativePairs[index]}:`, error);
                    tryLoadChart(index + 1);
                  }
                };

                tryLoadChart(); // Start with the current pairIndex
              };
              document.head.appendChild(script);
            }, 100);

            return;
          }
        }
      } else {
        const { data } = await axios.post(
          'https://api.rolechain.org/agents/chartmaster/analyze',
          { question: query },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (data.success) {
          if (data.markdown) {
            const chartId = v4();

            // Configure marked options if needed
            marked.setOptions({
              breaks: true,
              gfm: true
            });

            // Parse the markdown safely
            let parsedMarkdown;
            try {
              parsedMarkdown = marked(data.markdown);
            } catch (err) {
              console.error('Error parsing markdown:', err);
              parsedMarkdown = data.markdown;
            }

            // Add market data summary
            const marketDataHtml = data.marketData ? `
              <div class="market-data-summary mb-4">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="stat-item">
                    <div class="text-sm text-gray-500">Price</div>
                    <div class="font-bold">$${formatCryptoPrice(data.marketData.price)}</div>
                  </div>
                  <div class="stat-item">
                    <div class="text-sm text-gray-500">24h Change</div>
                    <div class="font-bold ${data.marketData.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}">
                      ${data.marketData.priceChange24h.toFixed(2)}%
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="text-sm text-gray-500">Market Cap</div>
                    <div class="font-bold">$${(data.marketData.marketCap / 1e6).toFixed(2)}M</div>
                  </div>
                  <div class="stat-item">
                    <div class="text-sm text-gray-500">24h Volume</div>
                    <div class="font-bold">$${(data.marketData.volume24h / 1e6).toFixed(2)}M</div>
                  </div>
                </div>
              </div>` : '';

            const combinedContent = `
              <div class="analysis-container">
                ${marketDataHtml}
                <div class="tradingview-widget-container mb-4" style="height: 500px !important;">
                  <div id="tradingview_${chartId}" style="height: 500px !important; min-height: 500px !important;"></div>
                </div>
                <div class="markdown-content">
                  ${parsedMarkdown}
                </div>
              </div>`;

            setMessages((prev) => [
              ...prev,
              {
                messageId: v4(),
                role: "assistant",
                content: data.markdown,
                renderedContent: combinedContent,
                symbol: data.symbol,
                marketData: data.marketData
              },
            ]);

            // Initialize TradingView widget
            setTimeout(() => {
              const script = document.createElement('script');
              script.src = "https://s3.tradingview.com/tv.js";
              script.async = true;
              script.onload = () => {
                const tryLoadChart = (index: number = 0) => {
                  if (index >= data.chartConfig.alternativePairs.length) {
                    console.error('No valid trading pair found');
                    return;
                  }

                  try {
                    // @ts-ignore
                    new TradingView.widget({
                      "width": "100%",
                      "height": "500",
                      "symbol": data.chartConfig.alternativePairs[index],
                      "interval": data.chartConfig.interval,
                      "timezone": "Etc/UTC",
                      "theme": "dark",
                      "style": "1",
                      "locale": "en",
                      "toolbar_bg": "#f1f3f6",
                      "enable_publishing": false,
                      "allow_symbol_change": true,
                      "container_id": `tradingview_${chartId}`,
                      "studies": [
                        "RSI@tv-basicstudies",
                        "MACD@tv-basicstudies",
                        "BB@tv-basicstudies"
                      ],
                      "autosize": false,
                      "loading_screen": { backgroundColor: "#000000" },
                      "onChartError": () => {
                        console.error(`Failed to load chart with pair ${data.chartConfig.alternativePairs[index]}`);
                        tryLoadChart(index + 1);
                      }
                    });
                  } catch (error) {
                    console.error(`Error initializing chart with pair ${data.chartConfig.alternativePairs[index]}:`, error);
                    tryLoadChart(index + 1);
                  }
                };

                tryLoadChart(); // Start with the current pairIndex
              };
              document.head.appendChild(script);
            }, 100);

            return;
          }
        }
      }
    } catch (err) {
      toast({
        title: "Something went wrong",
        variant: "destructive",
      });
      // remove last query
      setMessages((prev) => {
        if (prev.length > 1 && prev[prev.length - 1].role === "user")
          prev.pop();
        return prev;
      });
      console.error(err);
    } finally {
      setIsLoading(false);
      queryInputRef.current?.focus();
      setQuery("");
      setSelectedFile(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setQuery("Please analyze the tokenomics in the uploaded file");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    const { scrollY, innerHeight } = window;
    if (!containerRef.current) {
      return;
    }
    const { scrollHeight } = containerRef.current;
    if (scrollHeight > scrollY + Math.max(600, innerHeight) * 2) {
      setIsShowScrollToBottom(true);
    } else {
      setIsShowScrollToBottom(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    // console.log(queryInputRef.current);
    queryInputRef.current?.focus();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="relative flex flex-col gap-4 px-4 md:px-6">
      <div className="relative flex h-full w-full flex-col rounded-md bg-white pb-12 pl-4 md:pl-16 pt-6">
        {messages.length ? (
          <div className="w-full max-w-full md:max-w-[80%]">
            {messages.map((message, idx) => {
              const isLast = idx === messages.length - 1;
              return (
                <div key={message.messageId}>
                  {message.role === "user" ? (
                    <>
                      <div
                        className={cn(
                          "w-full max-w-[80%]",
                          idx > 0 ? "mt-8" : null,
                        )}
                      >
                        <span className="block text-2xl font-semibold text-black">
                          {message.content}
                        </span>
                        <div className="my-6 h-[1px] w-full bg-black/10" />
                      </div>
                      {isLoading && isLast && (
                        <div className="flex min-h-10 pe-12 flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Disc3Icon className="animate-spin" />
                            {researchType === 'seo-analyzer' && seoAnalysisStep && (
                              <span className="text-sm text-gray-600">{seoAnalysisStep}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="max flex flex-col gap-4">
                      {researchType === 'token-economics-expert' ? (
                        // Tokenomics Analysis Rendering
                        <div
                          className="prose prose-lg max-w-full dark:prose-invert prose-headings:font-bold prose-strong:font-bold"
                          dangerouslySetInnerHTML={{ 
                            __html: typeof message.content === 'string' ? message.content : ''
                          }}
                        />
                      ) : researchType === 'seo-analyzer' ? (
                        // SEO Analysis Rendering
                        <div
                          className="prose prose-lg max-w-full dark:prose-invert prose-headings:font-bold prose-strong:font-bold"
                          dangerouslySetInnerHTML={{ 
                            __html: typeof message.content === 'string' ? message.content : ''
                          }}
                        />
                      ) : message.renderedContent ? (
                        // Chart Analysis with TradingView
                        <div
                          className="prose prose-lg max-w-full dark:prose-invert prose-headings:font-bold prose-strong:font-bold"
                          dangerouslySetInnerHTML={{ 
                            __html: message.renderedContent 
                          }}
                        />
                      ) : (
                        // Fallback for plain markdown content
                        <Markdown
                          className={cn(
                            "prose max-w-[80%] dark:prose-invert prose-p:leading-relaxed prose-pre:p-0",
                            "break-words text-sm font-medium text-black dark:text-white md:text-base",
                          )}
                        >
                          {message.content}
                        </Markdown>
                      )}
                      
                      {/* Common Actions for all types */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 lg:mr-24">
                        <CopyAction report={message.content} />
                        <div className="flex gap-2">
                          <button className="text-sm">
                            <ThumbsUpIcon width={18} height={18} />
                          </button>
                          <button className="text-sm">
                            <ThumbsDownIcon width={18} height={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div
                    ref={messagesEndRef}
                    className="h-[0px]"
                  />
                </div>
              );
            })}

            <button
              className={cn(
                "sticky inset-0 bottom-24 left-0 right-0 mx-auto mt-auto w-fit rounded-full bg-black p-1 text-white shadow shadow-black duration-500",
                isShowScrollToBottom
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-full opacity-0",
              )}
              onClick={scrollToBottom}
            >
              <ArrowDownIcon />
            </button>
          </div>
        ) : (
          <div className="flex flex-col w-full max-w-3xl mx-auto pt-8 pb-12">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">
                Hi {user?.displayName || 'there'} 👋
              </h1>
              <p className="text-gray-600">
                {researchType === 'research-assistant' && "I'm your AI Research Assistant. I can help you explore any topic in depth, from academic research to market analysis. What would you like to learn about today?"}
                {researchType === 'crypto-analyzer' && "I'm your Crypto Analysis Expert. I can help you analyze any cryptocurrency or token. What would you like to analyze today?"}
                {researchType === 'seo-analyzer' && "I'm your SEO Analysis Expert. Enter a crypto website URL above and I'll provide a comprehensive SEO analysis with optimization recommendations."}
                {researchType === 'token-economics-expert' && "I'm your Token Economics Expert. Upload a whitepaper or enter your questions about token economics above."}
              </p>
            </div>

            {(researchType === 'research-assistant' || researchType === 'crypto-analyzer') && (
              <div className="w-full space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-[#8B5CF6]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                  <h2 className="text-base text-gray-600">Popular Questions</h2>
                </div>
                <p className="text-sm text-gray-500">Select a question or ask your own</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {researchType === 'research-assistant' ? [
                    "What are the key differences between Web2 and Web3 technology?",
                    "Explain the concept of Zero-Knowledge Proofs in simple terms",
                    "What are the environmental impacts of blockchain technology?",
                    "How does artificial intelligence impact modern healthcare?"
                  ].map((query) => (
                    <button
                      key={query}
                      onClick={() => handleQuery(query)}
                      className="w-full text-left p-4 rounded-lg bg-gray-50 hover:bg-gray-100 group flex items-center justify-between"
                    >
                      <span className="mr-2">{query}</span>
                      <span className="bg-[#8B5CF6] rounded-full p-1 group-hover:bg-[#7C3AED] transition-colors flex-shrink-0">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </button>
                  )) : [
                    "Analyze $BTC price action and market sentiment",
                    "What's the current market outlook for $ETH?",
                    "Technical analysis for $SOL",
                    "Analyze recent $DOGE price movements",
                    "Market analysis for $XRP",
                  ].map((query) => (
                    <button
                      key={query}
                      onClick={() => handleQuery(query)}
                      className="w-full text-left p-4 rounded-lg bg-gray-50 hover:bg-gray-100 group flex items-center justify-between"
                    >
                      <span className="mr-2">{query}</span>
                      <span className="bg-[#8B5CF6] rounded-full p-1 group-hover:bg-[#7C3AED] transition-colors flex-shrink-0">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {researchType === 'seo-analyzer' && (
              <div className="w-full space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-[#8B5CF6]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                  <h2 className="text-base text-gray-600">Popular Crypto Website Analysis</h2>
                </div>
                <p className="text-sm text-gray-500">Select a website to analyze or enter your own</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Analyze SEO for https://uniswap.org",
                    "Check SEO performance of https://aave.com",
                    "SEO analysis for https://curve.fi",
                    "Analyze https://compound.finance SEO metrics"
                  ].map((query) => (
                    <button
                      key={query}
                      onClick={() => handleQuery(query)}
                      className="w-full text-left p-4 rounded-lg bg-gray-50 hover:bg-gray-100 group flex items-center justify-between"
                    >
                      <span className="mr-2">{query}</span>
                      <span className="bg-[#8B5CF6] rounded-full p-1 group-hover:bg-[#7C3AED] transition-colors flex-shrink-0">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {/* Footer */}
        {user ? (
          <div className="sticky bottom-0 mt-auto flex gap-4 py-5">
            <div className="relative flex h-full w-full flex-col rounded-[12px] border border-[#ECECEC] bg-white outline-[#E056B8] focus-within:outline">
              {researchType === 'token-economics-expert' && (
                <label className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,image/*"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                  />
                  <svg 
                    className="w-5 h-5 text-gray-400 hover:text-gray-600"
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 11v6m3-3h-6" 
                    />
                  </svg>
                </label>
              )}
              <input
                ref={queryInputRef}
                autoFocus
                type="text"
                placeholder={researchType === 'token-economics-expert' 
                  ? "Analyze tokenomics or upload a file" 
                  : "Start your research"}
                className={cn(
                  "h-full w-full border-none bg-transparent py-2 pe-16 focus-within:outline-none disabled:cursor-no-drop",
                  researchType === 'token-economics-expert' ? "ps-12" : "ps-4"
                )}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDownCapture={(e) => {
                  if (e.key === "Enter") handleQuery(query);
                }}
                disabled={isLoading}
              />
            </div>
            <button
              className="flex h-fit items-center gap-4 self-end rounded-[12px] bg-gradient-to-r from-[#E056B8] to-[#8B5CF6] p-4 hover:from-[#D346A7] hover:to-[#7C3AED] disabled:animate-pulse disabled:cursor-progress"
              onClick={() => handleQuery(query)}
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M20.5107 13.5846L6.31372 20.4806C6.04657 20.6126 5.74426 20.6561 5.45074 20.6045C5.15722 20.553 4.88778 20.4092 4.68159 20.194C4.47297 19.9815 4.338 19.7077 4.29651 19.4128C4.25502 19.1179 4.3092 18.8175 4.45109 18.5556L7.3417 13.0749H13.5769C13.8832 13.0749 14.1314 12.8266 14.1314 12.5204C14.1314 12.2142 13.8832 11.9659 13.5769 11.9659H7.56577L4.44476 6.0655C4.30233 5.80446 4.24841 5.50426 4.29109 5.20998C4.33377 4.91569 4.47075 4.64319 4.68146 4.43337L4.70015 4.41468C4.90641 4.20548 5.17357 4.06691 5.46338 4.0188C5.75319 3.97068 6.0508 4.0155 6.31359 4.14683L20.5107 11.043C20.7502 11.1579 20.9523 11.3382 21.0938 11.5631C21.2353 11.7879 21.3104 12.0482 21.3104 12.3138C21.3104 12.5795 21.2353 12.8397 21.0939 13.0646C20.9524 13.2894 20.7502 13.4697 20.5107 13.5846Z"
                  fill="white"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className={"absolute bottom-0 left-0 right-0 isolate bg-white py-5"}>
            <div className="absolute inset-0 -mx-12 h-[1px] w-screen bg-[#dcdcdc]" />
            <div className="mx-auto w-fit">
              <button
                className="w-full rounded-[12px] bg-gradient-to-r from-[#E056B8] to-[#8B5CF6] px-4 py-2.5 font-semibold text-white hover:from-[#D346A7] hover:to-[#7C3AED]"
                onClick={() => setIsAuthDialogOpen(true)}
              >
                Sign up to contribute and earn rewards
              </button>
              <AuthDialog
                isOpen={isAuthDialogOpen}
                toggleIsOpen={() => setIsAuthDialogOpen((prev) => !prev)}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Page;
