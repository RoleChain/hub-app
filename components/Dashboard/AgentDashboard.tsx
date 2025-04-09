"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  BarChart, Users, Bot, Trash2, MessageSquare, Settings, 
  Plus, PlayIcon, Square, Terminal, Clock, CheckCircle, XCircle, ActivityIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card, 
  CardContent
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import useAuth from "@/hooks/useAuth";

const ScrollArea = ({ className, children, ...props }: any) => (
  <ScrollAreaPrimitive.Root className="relative overflow-hidden" {...props}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar
      className="flex touch-none select-none bg-slate-100 transition-colors ease-out data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
      orientation="vertical"
    >
      <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-slate-300" />
    </ScrollAreaPrimitive.Scrollbar>
  </ScrollAreaPrimitive.Root>
);

// Add a reusable gradient style with shadow
const gradientStyle = {
  button: "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white hover:opacity-90 shadow-lg shadow-purple-200",
  card: "hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300",
  iconContainer: "bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10"
};

// Types
interface Agent {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  active: boolean;
  lastActive?: string;
  platforms?: string[];
  activeChats: number;
  logs: AgentLog[];
  configuration?: Record<string, any>;
  telegramGroupId?: string;
  role: string;
  messageCount: number;
  lastMessage?: string;
  activeTasks: Task[];
  performance?: {
    responsiveness: number;
    accuracy: number;
    userRating: number;
  };
}

interface Task {
  _id: string;
  taskName: string;
  taskType: string;
  status: string;
  createdAt: string;
  parameters: Record<string, any>;
}

interface AgentLog {
  timestamp: string;
  message: string;
  status: 'success' | 'error' | 'info';
}

interface AgentTask {
  id: string;
  agentName: string;
  agentAvatar?: string;
  platform?: string;
  taskName: string;
  taskType: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  parameters: Record<string, any>;
  startedAt: string;
  completedAt?: string;
}

interface TaskGroups {
  [key: string]: AgentTask[];
}

type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'running';

interface AgentAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'danger' | 'default';
  customContent?: React.ReactNode;
}

interface AgentCardProps {
  agent: {
    _id: string;
    name?: string;
    description?: string;
    status?: string;
    startedAt?: string;
    platforms?: string[];
    active?: boolean;
    activeTasks: Task[];
    role?: string;
    activeChats?: number;
    messageCount?: number;
    lastActive?: string;
  };
  actions: AgentAction[];
}

interface TaskOption {
  id: string;
  title: string;
  description: string;
}

interface DashboardStats {
  overview: {
    activeAgents: number;
    activeTasks: number;
    failedTasks: number;
    totalTasks: number;
  };
  community: {
    totalUsers: number;
    percentageChange: string;
  };
  performance: {
    responseTime: string;
    status: string;
  };
  messages: {
    today: number;
    yesterday: number;
    percentageChange: string;
  };
  memories: {
    today: number;
    yesterday: number;
    percentageChange: string;
  };
}

// API endpoints and fetching functions would be defined here
const BASE_URL = 'https://api.rolechain.org';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };
  
  const response = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  return response.json();
};

// Sample data
const TASK_OPTIONS: TaskOption[] = [
  {
    id: 'manage-community',
    title: 'Manage Community',
    description: 'Monitor and moderate community discussions'
  },
  {
    id: 'analyze-feedback',
    title: 'Analyze Feedback',
    description: 'Process and categorize user feedback'
  },
  {
    id: 'generate-report',
    title: 'Generate Report',
    description: 'Create analytical reports from data'
  }
];

// Dummy data for development and testing
const DUMMY_AGENTS: Agent[] = [
  {
    _id: "1",
    name: "Customer Support Bot",
    description: "AI agent designed to handle customer inquiries and support tickets.",
    status: "active",
    active: true,
    lastActive: new Date().toISOString(),
    platforms: ["Telegram", "Discord"],
    activeChats: 5,
    logs: [],
    role: "support",
    messageCount: 124,
    activeTasks: []
  },
  {
    _id: "2",
    name: "Marketing Assistant",
    description: "Helps with social media content and marketing campaigns.",
    status: "inactive",
    active: false,
    activeChats: 0,
    logs: [],
    role: "marketing",
    messageCount: 56,
    activeTasks: []
  },
  {
    _id: "3",
    name: "Sales Agent",
    description: "Handles lead qualification and initial sales interactions.",
    status: "active",
    active: true,
    activeChats: 2,
    logs: [],
    role: "sales",
    messageCount: 75,
    activeTasks: []
  }
];

const DUMMY_DASHBOARD_STATS: DashboardStats = {
  overview: {
    activeAgents: 2,
    activeTasks: 3,
    failedTasks: 1,
    totalTasks: 10
  },
  community: {
    totalUsers: 250,
    percentageChange: "+12%"
  },
  performance: {
    responseTime: "1.2s",
    status: "Healthy"
  },
  messages: {
    today: 145,
    yesterday: 132,
    percentageChange: "+9.8%"
  },
  memories: {
    today: 50,
    yesterday: 45,
    percentageChange: "+11.1%"
  }
};

const LIVE_LOGS = [
  { agentId: "1", agentName: "Customer Support Bot", status: "info", message: "Initializing agent..." },
  { agentId: "1", agentName: "Customer Support Bot", status: "success", message: "Agent started successfully" },
  { agentId: "1", agentName: "Customer Support Bot", status: "info", message: "Received message from user #123456" },
  { agentId: "1", agentName: "Customer Support Bot", status: "info", message: "Processing intent..." },
  { agentId: "1", agentName: "Customer Support Bot", status: "success", message: "Intent recognized: 'help_request'" },
  { agentId: "1", agentName: "Customer Support Bot", status: "info", message: "Generating response..." },
  { agentId: "1", agentName: "Customer Support Bot", status: "info", message: "Response sent to user #123456" },
  { agentId: "2", agentName: "Marketing Assistant", status: "error", message: "Failed to connect to platform API" },
  { agentId: "2", agentName: "Marketing Assistant", status: "info", message: "Retrying connection..." },
  { agentId: "2", agentName: "Marketing Assistant", status: "success", message: "Connection established" }
];

// Performance data for chart
const performanceData = [
  { date: "Mon", performance: 85 },
  { date: "Tue", performance: 88 },
  { date: "Wed", performance: 92 },
  { date: "Thu", performance: 90 },
  { date: "Fri", performance: 94 },
  { date: "Sat", performance: 91 },
  { date: "Sun", performance: 93 }
];

// Sub-components will be implemented in the next steps

// AgentCard component
function AgentCard({ agent, actions }: AgentCardProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  
  const handleClickOutside = (event: MouseEvent) => {
    if (isActionsOpen) {
      setIsActionsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActionsOpen]);

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Calculate the difference in milliseconds
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} mins ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)} hours ago`;
    } else {
      return `${Math.floor(diffMins / 1440)} days ago`;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusInfo = (status: boolean) => {
    if (status) {
      return {
        label: 'Active',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: <CheckCircle className="h-3 w-3 text-green-600" />
      };
    } else {
      return {
        label: 'Inactive',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: <XCircle className="h-3 w-3 text-red-600" />
      };
    }
  };

  const statusInfo = getStatusInfo(agent.active || false);

  return (
    <div className={`rounded-xl border bg-card shadow p-5 ${gradientStyle.card}`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-lg">{agent.name}</h3>
            <div className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
              {statusInfo.icon}
              <span className="ml-1">{statusInfo.label}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">{agent.description}</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsActionsOpen(!isActionsOpen)}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            <Settings className="h-4 w-4" />
          </button>
          {isActionsOpen && (
            <div className="absolute right-0 z-50 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                {actions.map((action, index) => (
                  action.customContent || (
                    <button
                      key={index}
                      className={cn(
                        "flex w-full items-center px-4 py-2 text-sm text-left hover:bg-gray-100",
                        action.variant === "danger" ? "text-red-600 hover:text-red-700" : "text-gray-700"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick();
                        setIsActionsOpen(false);
                      }}
                    >
                      {action.icon}
                      <span className="ml-2">{action.label}</span>
                    </button>
                  )
                ))}
                {actions.filter(action => action.customContent).map((action, index) => (
                  <div key={`custom-${index}`} onClick={e => e.stopPropagation()}>
                    {action.customContent}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className={`rounded-md p-2 ${gradientStyle.iconContainer}`}>
          <div className="text-gray-500">Role</div>
          <div className="font-medium">{agent.role || 'General'}</div>
        </div>
        <div className={`rounded-md p-2 ${gradientStyle.iconContainer}`}>
          <div className="text-gray-500">Platforms</div>
          <div className="font-medium">{agent.platforms?.join(', ') || 'None'}</div>
        </div>
        <div className={`rounded-md p-2 ${gradientStyle.iconContainer}`}>
          <div className="text-gray-500">Active Chats</div>
          <div className="font-medium">{agent.activeChats || 0}</div>
        </div>
        <div className={`rounded-md p-2 ${gradientStyle.iconContainer}`}>
          <div className="text-gray-500">Messages</div>
          <div className="font-medium">{agent.messageCount || 0}</div>
        </div>
      </div>
      
      {agent.activeTasks && agent.activeTasks.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">Active Tasks</h4>
          <div className="space-y-2">
            {agent.activeTasks.slice(0, 2).map((task, index) => (
              <div 
                key={index}
                className="flex items-center justify-between rounded-md bg-gray-50 p-2 text-sm"
              >
                <span className="truncate">{task.taskName}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${getTaskStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
            ))}
            {agent.activeTasks.length > 2 && (
              <div className="text-xs text-center text-gray-500">
                +{agent.activeTasks.length - 2} more tasks
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-4 flex justify-between items-center pt-2 border-t text-xs text-gray-500">
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>Started: {formatTimestamp(agent.startedAt || '')}</span>
        </div>
        <div className="flex items-center">
          <MessageSquare className="h-3 w-3 mr-1" />
          <span>Last active: {agent.lastActive ? formatDate(agent.lastActive) : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}

// TaskCard component
function TaskCard({ task }: { task: AgentTask }) {
  const getStatusStyle = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'running':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} mins ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)} hours ago`;
    } else {
      return `${Math.floor(diffMins / 1440)} days ago`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
      case 'in-progress':
        return <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className={`rounded-xl border bg-white p-4 hover:shadow transition-shadow ${gradientStyle.card}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`rounded-full p-2 ${gradientStyle.iconContainer}`}>
            {task.platform === 'Telegram' ? (
              <MessageSquare className="h-4 w-4 text-blue-600" />
            ) : (
              <Bot className="h-4 w-4 text-purple-600" />
            )}
          </div>
          <div>
            <h4 className="font-medium">{task.agentName}</h4>
            <p className="text-sm text-gray-500">{task.platform || 'General'}</p>
          </div>
        </div>
        <div className={`rounded-full p-1.5 ${getStatusStyle(task.status)}`}>
          {getStatusIcon(task.status)}
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-semibold">{task.taskName}</h3>
        <p className="text-sm text-gray-500 mt-1">{task.taskType}</p>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 flex justify-between items-center pt-3 border-t">
        <div>Started {formatTimeAgo(task.startedAt)}</div>
        {task.completedAt && (
          <div>Completed {formatTimeAgo(task.completedAt)}</div>
        )}
      </div>
    </div>
  );
}

// GlobalStats component
const GlobalStats = ({ stats }: { stats: DashboardStats }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <Card className={gradientStyle.card}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-700">Active Agents</h3>
          <div className={`rounded-full p-2 ${gradientStyle.iconContainer}`}>
            <Bot className="h-5 w-5 text-purple-600" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-3xl font-bold">{stats.overview.activeAgents}</span>
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <span>Out of {stats.overview.activeAgents + (DUMMY_AGENTS.length - stats.overview.activeAgents)} total agents</span>
          </div>
        </div>
      </CardContent>
    </Card>
    
    <Card className={gradientStyle.card}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-700">Community Users</h3>
          <div className={`rounded-full p-2 ${gradientStyle.iconContainer}`}>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-3xl font-bold">{stats.community.totalUsers}</span>
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <span className="text-green-500">{stats.community.percentageChange}</span>
            <span className="ml-1">from last week</span>
          </div>
        </div>
      </CardContent>
    </Card>
    
    <Card className={gradientStyle.card}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-700">Messages Today</h3>
          <div className={`rounded-full p-2 ${gradientStyle.iconContainer}`}>
            <MessageSquare className="h-5 w-5 text-pink-600" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-3xl font-bold">{stats.messages.today}</span>
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <span className="text-green-500">{stats.messages.percentageChange}</span>
            <span className="ml-1">vs. yesterday ({stats.messages.yesterday})</span>
          </div>
        </div>
      </CardContent>
    </Card>
    
    <Card className={gradientStyle.card}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-700">Response Time</h3>
          <div className={`rounded-full p-2 ${gradientStyle.iconContainer}`}>
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-3xl font-bold">{stats.performance.responseTime}</span>
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <span>Status: </span>
            <span className="ml-1 text-green-500">{stats.performance.status}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// StatCards component
const StatCards = ({ stats }: { stats: DashboardStats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
    <Card className={gradientStyle.card}>
      <CardContent className="pt-6 pb-2">
        <div className="flex flex-col space-y-1.5">
          <h3 className="text-sm font-medium text-gray-500">Active Tasks</h3>
          <div className="text-2xl font-bold">{stats.overview.activeTasks}</div>
        </div>
      </CardContent>
    </Card>
    
    <Card className={gradientStyle.card}>
      <CardContent className="pt-6 pb-2">
        <div className="flex flex-col space-y-1.5">
          <h3 className="text-sm font-medium text-gray-500">Failed Tasks</h3>
          <div className="text-2xl font-bold">{stats.overview.failedTasks}</div>
        </div>
      </CardContent>
    </Card>
    
    <Card className={gradientStyle.card}>
      <CardContent className="pt-6 pb-2">
        <div className="flex flex-col space-y-1.5">
          <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
          <div className="text-2xl font-bold">{stats.overview.totalTasks}</div>
        </div>
      </CardContent>
    </Card>
    
    <Card className={gradientStyle.card}>
      <CardContent className="pt-6 pb-2">
        <div className="flex flex-col space-y-1.5">
          <h3 className="text-sm font-medium text-gray-500">Memories Created</h3>
          <div className="text-2xl font-bold">{stats.memories.today}</div>
          <div className="text-xs text-gray-500">
            <span className="text-green-500">{stats.memories.percentageChange}</span>
            <span className="ml-1">from yesterday</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Functions for the dashboard
const handleAssignTask = async (agentId: string, taskType: string) => {
  try {
    const response = await fetchWithAuth(`/agents/${agentId}/task`, {
      method: 'POST',
      body: JSON.stringify({ taskType })
    });
    return response;
  } catch (error) {
    console.error('Failed to assign task:', error);
    throw error;
  }
};

// Main AgentDashboard component
export default function AgentDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [tasks, setTasks] = useState<TaskGroups>({});
  const [activeTab, setActiveTab] = useState("overview");
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState("all");
  const router = useRouter();
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const searchParams = useSearchParams();
  
  // Read tab from URL query parameter
  useEffect(() => {
    const syncTabWithUrl = () => {
      const tabParam = searchParams.get('tab');
      if (tabParam && ['overview', 'agents', 'tasks', 'logs'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    };
    
    // Initial sync
    syncTabWithUrl();
    
    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', syncTabWithUrl);
    
    return () => {
      window.removeEventListener('popstate', syncTabWithUrl);
    };
  }, [searchParams]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/?dashboard=true&tab=${value}`, { scroll: false });
  };

  useEffect(() => {
    let currentIndex = 0;
    
    const addLog = () => {
      const newLog = {
        ...LIVE_LOGS[currentIndex],
        timestamp: new Date().toISOString()
      };
      
      setLogs(prev => [...prev, newLog].slice(-10)); // Limit to the last 10 logs
      currentIndex = (currentIndex + 1) % LIVE_LOGS.length;
    };

    // Add initial logs immediately
    for (let i = 0; i < Math.min(5, LIVE_LOGS.length); i++) {
      addLog();
    }

    // Don't keep adding logs indefinitely
    // const interval = setInterval(addLog, 2000);
    // return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        if (!user) {
          // Use dummy stats when not logged in
          setDashboardStats(DUMMY_DASHBOARD_STATS);
          setError(null);
          return;
        }

        // If we have a real API, use this instead
        // const response = await fetchWithAuth('/agents/dashboard/stats');
        // setDashboardStats(response);
        
        // For development, use dummy data
        setDashboardStats(DUMMY_DASHBOARD_STATS);
        setError(null);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        // Use dummy data
        setAgents(DUMMY_AGENTS);
        return;
        
        // For real API:
        /*
        if (!user) {
          setAgents(DUMMY_AGENTS);
          return;
        }
        
        const response = await fetchWithAuth('/agents');
        setAgents(response);
        if (selectedAgent) {
          const updatedSelectedAgent = response.find((a: Agent) => a._id === selectedAgent._id);
          setSelectedAgent(updatedSelectedAgent || null);
        }
        */
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      }
    };

    fetchAgents();
  }, [user]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        
        // Mock data for development
        const mockTasks: AgentTask[] = [
          {
            id: "1",
            agentName: "Customer Support Bot",
            platform: "Telegram",
            taskName: "Monitor Support Tickets",
            taskType: "monitoring",
            status: "running",
            parameters: {},
            startedAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
          },
          {
            id: "2",
            agentName: "Marketing Assistant",
            platform: "Discord",
            taskName: "Generate Weekly Report",
            taskType: "reporting",
            status: "completed",
            parameters: {},
            startedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            completedAt: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
          },
          {
            id: "3",
            agentName: "Sales Agent",
            platform: "Internal",
            taskName: "Lead Qualification",
            taskType: "processing",
            status: "failed",
            parameters: {},
            startedAt: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
          },
          {
            id: "4",
            agentName: "Customer Support Bot",
            platform: "Telegram",
            taskName: "Process Feedback",
            taskType: "processing",
            status: "pending",
            parameters: {},
            startedAt: new Date(Date.now() - 1800000).toISOString() // 30 mins ago
          }
        ];

        // Group tasks by status
        const groupedTasks = mockTasks.reduce((groups: TaskGroups, task) => {
          const status = task.status;
          if (!groups[status]) {
            groups[status] = [];
          }
          groups[status].push(task);
          return groups;
        }, {});

        setTasks(groupedTasks);

        // Real API implementation would be:
        /*
        const response = await fetchWithAuth('/agents/tasks');
        const groupedTasks = response.reduce((groups: TaskGroups, task: AgentTask) => {
          const status = task.status;
          if (!groups[status]) {
            groups[status] = [];
          }
          groups[status].push(task);
          return groups;
        }, {});
        setTasks(groupedTasks);
        */
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  const handleAgentStatusToggle = async (agentId: string) => {
    try {
      const agent = agents.find(a => a._id === agentId);
      if (!agent) return;

      /*
      if (agent.active) {
        // Stop the agent
        await fetchWithAuth(`/agents/${agentId}/stop`, {
          method: 'POST'
        });
      } else {
        // Start the agent (assuming there's a start endpoint)
        await fetchWithAuth(`/agents/${agentId}/start`, {
          method: 'POST'
        });
      }
      */

      // Update local state
      setAgents(agents.map(a => 
        a._id === agentId ? { ...a, active: !a.active } : a
      ));
    } catch (error) {
      console.error('Failed to toggle agent status:', error);
      // Optionally show an error toast/notification here
    }
  };

  const renderAgentsContent = () => {
    if (agents.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No agents found. Create your first agent to get started.
        </div>
      );
    }

    const handleDeleteAgent = async (agentId: string) => {
      if (window.confirm('Are you sure you want to delete this agent?')) {
        try {
          /*
          await fetchWithAuth(`/agents/${agentId}`, {
            method: 'DELETE'
          });
          */
          
          // Update local state to remove the deleted agent
          setAgents(prevAgents => prevAgents.filter(agent => agent._id !== agentId));
          
          // If the deleted agent was selected, clear the selection
          if (selectedAgent?._id === agentId) {
            setSelectedAgent(null);
          }
          
          console.log('Agent deleted successfully');
        } catch (error) {
          console.error('Failed to delete agent:', error);
          alert('Failed to delete agent. Please try again.');
        }
      }
    };

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <AgentCard
            key={agent._id}
            agent={agent}
            actions={[
              {
                label: agent.active ? 'Stop' : 'Start',
                icon: agent.active ? <Square className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />,
                onClick: () => handleAgentStatusToggle(agent._id)
              },
              {
                label: 'Assign Task',
                icon: <Plus className="h-4 w-4" />,
                onClick: () => {}, // We'll handle this in the card itself now
                customContent: (
                  <div className="group relative">
                    <button
                      className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-sm">Assign Task</span>
                    </button>
                    <div className="invisible group-hover:visible absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        {TASK_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex flex-col"
                            onClick={() => handleAssignTask(agent._id, option.id)}
                          >
                            <span className="font-medium text-sm">{option.title}</span>
                            <span className="text-xs text-gray-500">{option.description}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              },
              {
                label: 'Delete',
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => handleDeleteAgent(agent._id),
                variant: "danger"
              }
            ]}
          />
        ))}
      </div>
    );
  };

  const RecentActivities = () => (
    <div className="p-4">
      <ScrollArea className="h-[350px]">
        {isLoadingActivities ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-t-2 border-pink-500" />
          </div>
        ) : logs.length > 0 ? (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div 
                key={index}
                className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-100 pb-4"
              >
                <div className="rounded-full p-2 mt-1" style={{ background: 'rgba(236, 72, 153, 0.1)' }}>
                  <Bot className="h-4 w-4 text-pink-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-900">
                      {log.agentName}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className={cn(
                    "text-sm mt-1",
                    {
                      'text-green-600': log.status === 'success',
                      'text-red-600': log.status === 'error',
                      'text-blue-600': log.status === 'info'
                    }
                  )}>
                    {log.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <ActivityIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium">No recent activities</p>
            <p className="text-sm text-gray-400 mt-1">Activity logs will appear here</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );

  // The main render function
  return (
    <section className="mt-8 px-4 md:px-6 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
        <div className="flex select-none flex-col gap-1">
          <h2 className="text-3xl font-bold leading-tight bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-transparent bg-clip-text">
            Agent Dashboard
          </h2>
          <span className="leading-[24px] text-gray-600">
            Manage and monitor your AI agents
          </span>
        </div>

        <div className="flex gap-3">
          <button
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold ${gradientStyle.button} shadow-lg transition-all hover:shadow-xl`}
            onClick={() => router.push("/agents/new")}
          >
            <Plus width={18} height={18} />
            <span className="block text-nowrap text-sm">
              Create New Agent
            </span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 border-t-2" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-6 bg-red-50 rounded-lg shadow-sm">
          <p className="font-medium">{error}</p>
          <button 
            className="mt-2 text-sm text-purple-600 hover:text-purple-800"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      ) : dashboardStats ? (
        <>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <GlobalStats stats={dashboardStats} />
            <div className="my-6 h-[1px] w-full bg-gray-100" />
            <StatCards stats={dashboardStats} />
          </div>
        </>
      ) : null}

      <div className="mt-10">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full justify-start mb-6 p-1 bg-gray-50 rounded-lg">
            <TabsTrigger value="overview" className="flex-1 md:flex-none md:px-6 data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                <span>Overview</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex-1 md:flex-none md:px-6 data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span>Agents</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex-1 md:flex-none md:px-6 data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">
              <div className="flex items-center gap-2">
                <ActivityIcon className="h-4 w-4" />
                <span>Tasks</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex-1 md:flex-none md:px-6 data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                <span>Logs</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                </div>
                <RecentActivities />
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="text-lg font-semibold">Performance Overview</h3>
                </div>
                <div className="p-4">
                  <div className="h-[350px] flex items-center justify-center text-gray-500">
                    <p>Performance chart will display here</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden md:col-span-2">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="text-lg font-semibold">Active Conversations</h3>
                </div>
                <div className="p-4">
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {agents.map(agent => (
                        <div key={agent._id} className="flex items-center justify-between py-2 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${gradientStyle.iconContainer}`}>
                              <Bot className="h-4 w-4 text-purple-600" />
                            </div>
                            <span className="font-medium">{agent.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {agent.activeChats} active chats
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${agent.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {agent.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 p-6">
              {renderAgentsContent()}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-purple-500" />
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(tasks).map(([status, taskList]) => (
                  <div key={status} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
                    <h3 className="text-lg font-semibold mb-4 capitalize flex items-center gap-2">
                      {status === 'running' && <ActivityIcon className="h-5 w-5 text-blue-500" />}
                      {status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {status === 'failed' && <XCircle className="h-5 w-5 text-red-500" />}
                      {status === 'pending' && <Clock className="h-5 w-5 text-yellow-500" />}
                      {status} Tasks
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {taskList.map(task => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </div>
                  </div>
                ))}
                {Object.keys(tasks).length === 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="text-center py-12 text-gray-500">
                      <div className="mb-4">
                        <ActivityIcon className="h-12 w-12 text-gray-300 mx-auto" />
                      </div>
                      <p className="text-lg font-medium">No tasks found</p>
                      <p className="text-sm text-gray-400 mt-1">Create a new agent or assign tasks to get started</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  <span>Agent Logs</span>
                </div>
                <select 
                  className="bg-gray-800 text-white rounded px-3 py-1 text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                >
                  <option value="all">All Agents</option>
                  {agents.map(agent => (
                    <option key={agent._id} value={agent._id}>{agent.name}</option>
                  ))}
                </select>
              </div>
              <div className="h-[500px] p-4 overflow-auto">
                {logs.length > 0 ? (
                  <div className="space-y-2">
                    {logs
                      .filter(log => selectedAgentId === "all" || log.agentId === selectedAgentId)
                      .map((log, index) => (
                        <div 
                          key={index} 
                          className="font-mono text-sm mb-2 opacity-0 animate-fade-in border-b border-gray-100 pb-2"
                          style={{ 
                            animationDelay: `${index * 100}ms`,
                            animationFillMode: 'forwards'
                          }}
                        >
                          <span className="text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="text-gray-400 ml-2">[{log.agentName}]</span>
                          <span className={cn(
                            "ml-2",
                            {
                              'text-green-500': log.status === 'success',
                              'text-red-500': log.status === 'error',
                              'text-blue-500': log.status === 'info'
                            }
                          )}>
                            {log.message}
                          </span>
                        </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Terminal className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium">No logs available</p>
                    <p className="text-sm text-gray-400 mt-1">Agent activity logs will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
} 