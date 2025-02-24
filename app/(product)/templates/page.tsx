"use client"
import multiavatar from '@multiavatar/multiavatar'
import Banner from '@/components/Banner'
import { useState } from 'react'
import { motion } from 'framer-motion'

const templates = [
  {
    id: 1,
    title: 'Hacker News Reporter',
    author: {
      name: 'Jenny Wilson',
    },
  },
  {
    id: 2,
    title: 'FAQ Write',
    author: {
      name: 'Floyd Miles',
    },
  },
  {
    id: 3,
    title: 'Magic Hour Manager',
    author: {
      name: 'Courtney Henry',
    },
  },
  {
    id: 4,
    title: 'SEO Optimized Blog',
    author: {
      name: 'Albert Flores',
    },
  },
  {
    id: 5,
    title: 'Integration Builder',
    author: {
      name: 'Ralph Edwards',
    },
  },
  {
    id: 6,
    title: 'Linear Sprint summary',
    author: {
      name: 'Kathryn Murphy',
    },
  }
]

// Add new template categories
const roleTemplates = [
  {
    id: 1,
    title: 'Sales Development Rep',
    author: { name: 'Leslie Alexander' },
  },
  {
    id: 2,
    title: 'Customer Success Manager',
    author: { name: 'Cameron Williamson' },
  },
  {
    id: 3,
    title: 'Account Executive',
    author: { name: 'Brooklyn Simmons' },
  },
]

const taskTemplates = [
  {
    id: 1,
    title: 'Lead Qualification',
    author: { name: 'Devon Lane' },
  },
  {
    id: 2,
    title: 'Meeting Scheduler',
    author: { name: 'Robert Fox' },
  },
  {
    id: 3,
    title: 'Follow-up Generator',
    author: { name: 'Savannah Nguyen' },
  },
]

// Add new suggestion data
const suggestions = [
  { id: 1, text: 'Automate sales pipeline updates', category: 'sales' },
  { id: 2, text: 'Identify stalled deals for re-engagement', category: 'sales' },
  { id: 3, text: 'Optimize account assignments', category: 'accounts' },
  { id: 4, text: 'Identify cross-sell opportunities in CRM', category: 'sales' },
  { id: 5, text: 'Streamline contract renewal reminders', category: 'contracts' },
  { id: 6, text: 'Score deal health based on activity', category: 'analytics' },
  { id: 7, text: 'Flag high-risk deals', category: 'risk' },
  { id: 8, text: 'Predict churn likelihood', category: 'analytics' },
  { id: 9, text: 'Sync CRM data across tools', category: 'integration' },
  { id: 10, text: 'Optimize follow-up cadences', category: 'communication' },
]

// Add featured templates for slider
const featuredTemplates = [
  {
    id: 1,
    title: 'Sales Assistant Pro',
    description: 'AI-powered sales assistant that helps qualify leads and schedule meetings',
    image: '/templates/sales-assistant.png',
    category: 'Featured'
  },
  {
    id: 2,
    title: 'Customer Support Bot',
    description: 'Automated support agent that handles common customer inquiries',
    image: '/templates/support-bot.png',
    category: 'Featured'
  },
  // Add more featured templates...
]

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState('top') // Options: 'top', 'hot', 'best'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null)

  // State for all three sections
  const [visibleItems, setVisibleItems] = useState({
    general: 6,
    role: 3,
    task: 3
  });

  // Add new state for modal
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null)

  // Add new state for multi-select
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [deploymentConfigs, setDeploymentConfigs] = useState({
    telegram: {
      telegramToken: '',
    },
    discord: {
      clientId: '',
      botToken: '',
      guildId: '',
    },
    api: {
      apiKey: '',
      apiEndpoint: '',
    },
  })

  // Add new state for deployment configuration
  const [selectedDeployOption, setSelectedDeployOption] = useState<string | null>(null)

  // Add state for active config tab
  const [activeConfigTab, setActiveConfigTab] = useState<string | null>(null)

  // Function to handle showing more items for any section
  const handleShowMore = (section: 'general' | 'role' | 'task') => {
    setVisibleItems(prev => ({
      ...prev,
      [section]: prev[section] + 6
    }));
  };

  // Add deployment options
  const deploymentOptions = [
    {
      id: 'telegram',
      name: 'Telegram',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/>
        </svg>
      ),
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.075.075 0 01-.008-.125c.126-.094.252-.192.372-.292a.075.075 0 01.078-.01c3.927 1.793 8.18 1.793 12.062 0a.075.075 0 01.079.01c.12.098.246.198.373.292.044.032.04.1-.006.125a12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      ),
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      id: 'api',
      name: 'API',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
  ]

  // Add function to render template grid
  const renderTemplateGrid = (templateList: typeof templates, section: 'general' | 'role' | 'task') => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templateList.slice(0, visibleItems[section]).map((template) => (
          <div key={template.id} className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: multiavatar(template.title)
                }}
                className="w-10 h-10"
              />
              <h3 className="text-lg font-semibold">{template.title}</h3>
            </div>
            
            {/* Technology Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">
                Qdrant API
              </span>
              <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">
                Qdrant URL
              </span>
              <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">
                Qdrant Collection Name
              </span>
              <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">
                OpenAI
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-gray-500 text-sm">By:</span>
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: multiavatar(template.author.name)
                }}
                className="w-5 h-5"
              />
              <span className="text-gray-600 text-sm">{template.author.name}</span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-purple-50 text-purple-600 py-2 rounded-lg text-sm flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Clone
              </button>
              <button 
                onClick={() => {
                  setSelectedTemplate(template)
                  setIsDeployModalOpen(true)
                }}
                className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Deploy
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {templateList.length > visibleItems[section] && (
        <div className="mt-8 text-center">
          <button
            onClick={() => handleShowMore(section)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-full shadow-sm hover:shadow-md transition-all duration-200 border border-purple-100 hover:border-purple-200"
          >
            <span>Show More</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )

  // Add suggestion handler
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    setSelectedSuggestion(suggestion)
  }

  // Update platform toggle handler to set initial active tab
  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => {
      const newSelection = prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
      
      // Set active tab to the newly selected platform or the first remaining one
      if (!prev.includes(platformId)) {
        setActiveConfigTab(platformId)
      } else if (platformId === activeConfigTab) {
        setActiveConfigTab(newSelection[0] || null)
      }
      
      return newSelection
    })
  }

  // Update deploy handler
  const handleDeploy = () => {
    const configsToSubmit = selectedPlatforms.reduce((acc, platform) => ({
      ...acc,
      [platform]: deploymentConfigs[platform as keyof typeof deploymentConfigs]
    }), {})
    
    console.log('Deploying with configs:', configsToSubmit)
    
    // Reset states
    setIsDeployModalOpen(false)
    setSelectedPlatforms([])
    setDeploymentConfigs({
      telegram: { telegramToken: '' },
      discord: { clientId: '', botToken: '', guildId: '' },
      api: { apiKey: '', apiEndpoint: '' },
    })
  }

  // Update config fields renderer
  const renderConfigFields = () => {
    if (!activeConfigTab) return null

    const configSections = {
      telegram: (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Telegram Bot Token
            <input
              type="text"
              value={deploymentConfigs.telegram.telegramToken}
              onChange={(e) => setDeploymentConfigs(prev => ({
                ...prev,
                telegram: { ...prev.telegram, telegramToken: e.target.value }
              }))}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your bot token"
            />
          </label>
          <p className="text-sm text-gray-500">
            Get this from @BotFather on Telegram
          </p>
        </div>
      ),
      discord: (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Discord Client ID
            <input
              type="text"
              value={deploymentConfigs.discord.clientId}
              onChange={(e) => setDeploymentConfigs(prev => ({
                ...prev,
                discord: { ...prev.discord, clientId: e.target.value }
              }))}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter Discord Client ID"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Discord Bot Token
            <input
              type="password"
              value={deploymentConfigs.discord.botToken}
              onChange={(e) => setDeploymentConfigs(prev => ({
                ...prev,
                discord: { ...prev.discord, botToken: e.target.value }
              }))}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter Bot Token"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Discord Guild ID (Optional)
            <input
              type="text"
              value={deploymentConfigs.discord.guildId}
              onChange={(e) => setDeploymentConfigs(prev => ({
                ...prev,
                discord: { ...prev.discord, guildId: e.target.value }
              }))}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter Guild ID"
            />
          </label>
        </div>
      ),
      api: (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            API Key
            <input
              type="password"
              value={deploymentConfigs.api.apiKey}
              onChange={(e) => setDeploymentConfigs(prev => ({
                ...prev,
                api: { ...prev.api, apiKey: e.target.value }
              }))}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter API Key"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            API Endpoint
            <input
              type="text"
              value={deploymentConfigs.api.apiEndpoint}
              onChange={(e) => setDeploymentConfigs(prev => ({
                ...prev,
                api: { ...prev.api, apiEndpoint: e.target.value }
              }))}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter API Endpoint"
            />
          </label>
        </div>
      )
    }

    return (
      <div className="mt-6">
        {/* Configuration Tabs */}
        {selectedPlatforms.length > 1 && (
          <div className="flex gap-2 mb-4">
            {selectedPlatforms.map(platform => (
              <button
                key={platform}
                onClick={() => setActiveConfigTab(platform)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeConfigTab === platform
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {deploymentOptions.find(opt => opt.id === platform)?.name}
              </button>
            ))}
          </div>
        )}

        {/* Configuration Fields */}
        <div className="bg-purple-50 p-6 rounded-xl">
          <h4 className="font-medium text-purple-800 mb-4">
            {deploymentOptions.find(opt => opt.id === activeConfigTab)?.name} Configuration
          </h4>
          {configSections[activeConfigTab as keyof typeof configSections]}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner />

      {/* General Templates */}
      <section>
        <div className="text-center mb-6 mt-6">
          <div className="inline-block bg-orange-500 text-white px-3 py-0.5 rounded-full text-sm mb-3">
            Agent Template
          </div>
          <h2 className="text-2xl font-bold mb-2">
            Supercharge Your Workflow with AI Agents
          </h2>
          <p className="text-gray-600 text-sm">
            Boost productivity and automate tasks effortlessly with ready-to-use AI Agent templates.
          </p>
        </div>

        {/* Template Tabs */}
        <div className="flex gap-3 mb-6 justify-center">
          <button 
            onClick={() => setActiveTab('top')}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              activeTab === 'top' 
                ? 'bg-[#E439FF] text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Top Template
          </button>
          <button 
            onClick={() => setActiveTab('hot')}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              activeTab === 'hot' 
                ? 'bg-[#E439FF] text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Hot Template
          </button>
          <button 
            onClick={() => setActiveTab('best')}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              activeTab === 'best' 
                ? 'bg-[#E439FF] text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Best Template
          </button>
        </div>

        {/* Template Grid */}
        {renderTemplateGrid(templates, 'general')}
      </section>

      {/* Search and Suggestions Hero Section */}
      <div className="relative bg-gradient-to-b from-purple-900 to-purple-800 text-white py-20 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block bg-[#E439FF]/20 text-white px-4 py-1 rounded-full text-sm mb-3 backdrop-blur-sm border border-[#E439FF]/30">
              AI Assistant Finder
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-[#E439FF]">
              Find Your Perfect AI Assistant
            </h2>
            <p className="text-xl text-purple-200 max-w-2xl mx-auto">
              Discover AI agents tailored to your specific needs
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-3xl mx-auto relative z-10">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/10">
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-[#E439FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-12 py-4 bg-white/5 border border-[#E439FF]/30 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-[#E439FF] focus:border-transparent transition-all"
                  placeholder="I want an agent that..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedSuggestion(null)
                    }}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <svg className="h-5 w-5 text-purple-300 hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Suggestions */}
              <div>
                <h3 className="text-sm text-purple-200 mb-3 font-medium">Popular searches</h3>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                        selectedSuggestion === suggestion.text
                          ? 'bg-[#E439FF] text-white shadow-lg shadow-[#E439FF]/30'
                          : 'bg-white/5 text-purple-200 hover:bg-white/10 border border-white/10 hover:border-[#E439FF]/50'
                      }`}
                    >
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-[#E439FF] rounded-full opacity-20 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-purple-500 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-purple-400 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      {/* Featured Templates Slider */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-block bg-purple-100 text-purple-600 px-4 py-1 rounded-full text-sm mb-3">
              Featured Templates
            </div>
            <h2 className="text-3xl font-bold">Most Popular AI Agents</h2>
          </div>

          <div className="overflow-hidden">
            <motion.div 
              className="flex gap-6 py-4"
              animate={{ x: [-100, 0] }}
              transition={{ duration: 0.5 }}
            >
              {featuredTemplates.map((template) => (
                <div key={template.id} className="flex-none w-80">
                  <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-purple-600 text-sm mb-2">{template.category}</div>
                    <h3 className="text-xl font-semibold mb-2">{template.title}</h3>
                    <p className="text-gray-600 text-sm">{template.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Role Templates */}
      <section className="py-16">
        <div className="text-center mb-6">
          <div className="inline-block bg-blue-500 text-white px-3 py-0.5 rounded-full text-sm mb-3">
            Role Templates
          </div>
          <h2 className="text-2xl font-bold mb-2">
            AI Agents for Every Role
          </h2>
          <p className="text-gray-600 text-sm">
            Purpose-built AI assistants designed for specific business roles and functions.
          </p>
        </div>
        {renderTemplateGrid(roleTemplates, 'role')}
      </section>

      {/* Task Templates */}
      <section className="py-16">
        <div className="text-center mb-6">
          <div className="inline-block bg-green-500 text-white px-3 py-0.5 rounded-full text-sm mb-3">
            Task Templates
          </div>
          <h2 className="text-2xl font-bold mb-2">
            Automated Task Solutions
          </h2>
          <p className="text-gray-600 text-sm">
            Ready-to-use AI agents for common business tasks and workflows.
          </p>
        </div>
        {renderTemplateGrid(taskTemplates, 'task')}
      </section>

      {/* Updated Deploy Modal */}
      {isDeployModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Deploy {selectedTemplate?.title}</h3>
              <button 
                onClick={() => {
                  setIsDeployModalOpen(false)
                  setSelectedPlatforms([])
                  setActiveConfigTab(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {deploymentOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handlePlatformToggle(option.id)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                    selectedPlatforms.includes(option.id)
                      ? 'border-purple-500 bg-purple-50 shadow-sm'
                      : 'border-purple-100 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <div className="text-purple-600">{option.icon}</div>
                  <span className="text-sm font-medium text-gray-700">{option.name}</span>
                </button>
              ))}
            </div>

            {renderConfigFields()}

            {selectedPlatforms.length > 0 && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleDeploy}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Deploy to {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
