"use client";
// import PapersIcon from "@/components/icons/papers";
// import MissionCard from "@/components/Missions/MissionCard";
import { BarChart, Users, Bot, Trash2, MessageSquare, Settings, Plus, PlayIcon, Square, ActivityIcon, Terminal, Clock, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { AuthDialog } from "@/components/Dialogs";
import { cn } from "@/lib/utils";
import axios from "axios";
// import { Mission } from "@/types";
// import { Skeleton } from "@/components/ui/skeleton";
// import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart as RechartsLineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import {
  Dialog,
  DialogContent,
  // DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import * as React from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

const CHART_COLORS = {
  primary: '#EC4899',    // Pink-500
  secondary: '#3B82F6',  // Blue-500
  muted: '#64748b',      // Keep original slate for labels
  background: '#ffffff'  // Keep white background
}

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

const BASE_URL = 'https://api.rolechaing.org';

// Update fetchWithAuth utility function
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };
  
  const response = await fetch(`${BASE_URL}${url}`, { ...options, headers });

  console.log(response);
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  return response.json();
};

function LineChart({ data }: { data: any }) {
  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          <XAxis 
            dataKey="date" 
            stroke={CHART_COLORS.muted}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke={CHART_COLORS.muted}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: CHART_COLORS.background,
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
          />
          <Line 
            type="monotone" 
            dataKey="performance" 
            stroke={`url(#colorGradient)`} // Using gradient
            strokeWidth={2}
            dot={false}
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={CHART_COLORS.primary} />
              <stop offset="100%" stopColor={CHART_COLORS.secondary} />
            </linearGradient>
          </defs>
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

interface AgentAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'danger' | 'default';
  customContent?: React.ReactNode;
}

interface Task {
  _id: string;
  taskName: string;
  taskType: string;
  status: string;
  createdAt: string;
  parameters: Record<string, any>;
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
    activeTasks: Task[];  // Updated to match your data structure
  };
  actions: AgentAction[];
}

// Add a reusable gradient style with shadow
const gradientStyle = {
  button: "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white hover:opacity-90 shadow-lg shadow-purple-200",
  card: "hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300",
  iconContainer: "bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10"
};

interface TaskOption {
  id: string;
  title: string;
  description: string;
}

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

const handleAssignTask = async (agentId: string, taskType: string) => {
  try {
    const response = await fetchWithAuth(`/agents/${agentId}/task`, {
      method: 'POST',
      body: JSON.stringify({
        taskName: TASK_OPTIONS.find(t => t.id === taskType)?.title || taskType,
        taskType: 'sentiment',
        parameters: {}
      })
    });
    
    const newTask = response.task;
  } catch (error) {
    console.error('Failed to assign task:', error);
    alert('Failed to assign task. Please ensure the agent is running and try again.');
  }
};

function AgentCard({ agent, actions }: AgentCardProps) {
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [showTaskTooltip, setShowTaskTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside the tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowTaskTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get status color for tasks
  const getTaskStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in-progress':
        return 'text-blue-600 bg-blue-50';
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get platform icon

  // Helper function to format the date/time
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // Helper function to get status color and text
  const getStatusInfo = (status: boolean) => {
    switch (status) {
      case true:
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          pulseColor: 'bg-green-400',
          showPulse: true
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          pulseColor: 'bg-gray-400',
          showPulse: false
        };
    }
  };

  const statusInfo = getStatusInfo(agent.active!);

  return (
    <Card className={gradientStyle.card}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{agent.name || 'Unnamed Agent'}</h3>
            <p className="text-sm text-muted-foreground">{agent.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2",
              statusInfo.bgColor,
              statusInfo.textColor
            )}>
              {statusInfo.showPulse && (
                <span className="relative flex h-2 w-2">
                  <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", statusInfo.pulseColor)}></span>
                  <span className={cn("relative inline-flex rounded-full h-2 w-2", statusInfo.pulseColor)}></span>
                </span>
              )}
              {agent.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        
        {/* Active Tasks Section */}
        {agent.activeTasks && agent.activeTasks.length > 0 && (
          <div className="mb-4 relative">
            <div 
              className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
              onClick={() => setShowTaskTooltip(!showTaskTooltip)}
              role="button"
            >
              <Terminal className="h-4 w-4 text-purple-500" />
              <span className="font-medium">
                {agent.activeTasks.length} Active Task{agent.activeTasks.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Task Details Tooltip */}
            {showTaskTooltip && (
              <div 
                ref={tooltipRef}
                className="absolute z-50 bg-white rounded-lg shadow-lg border p-3 left-0 mt-2 w-72"
              >
                <div className="space-y-3">
                  <div className="font-medium text-sm border-b pb-2">Active Tasks Details</div>
                  {agent.activeTasks.map((task) => (
                    <div key={task._id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{task.taskName}</span>
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          getTaskStatusColor(task.status)
                        )}>
                          {task.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Type: {task.taskType}
                      </div>
                      <div className="text-xs text-gray-500">
                        Started: {formatDate(task.createdAt)}
                      </div>
                      {task.parameters && Object.keys(task.parameters).length > 0 && (
                        <div className="text-xs text-gray-500">
                          Parameters: {JSON.stringify(task.parameters)}
                        </div>
                      )}
                      <div className="border-t border-dashed my-2"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {actions.map((action, index) => (
            action.customContent ? (
              <div key={index} className="task-dropdown relative">
                <button
                  className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
                  onClick={() => setShowTaskDropdown(!showTaskDropdown)}
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Assign Task</span>
                </button>
                {showTaskDropdown && (
                  <div className="absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      {TASK_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex flex-col"
                          onClick={() => {
                            handleAssignTask(agent._id, option.id);
                            setShowTaskDropdown(false);
                          }}
                        >
                          <span className="font-medium text-sm">{option.title}</span>
                          <span className="text-xs text-gray-500">{option.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                key={index}
                onClick={action.onClick}
                className={cn(
                  "flex items-center gap-2 rounded-md p-2",
                  action.variant === "danger" 
                    ? "hover:bg-red-50 text-red-600" 
                    : "hover:bg-accent"
                )}
              >
                {action.icon}
                <span className="text-sm">{action.label}</span>
              </button>
            )
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface CreateAgentDialogProps {
  isOpen: boolean;
  toggleIsOpen: () => void;
  onCreateAgent: (agentData: Omit<Agent, 'id' | 'logs'>) => void;
}

function CreateAgentDialog({ isOpen, toggleIsOpen, onCreateAgent }: CreateAgentDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    role: '',
    telegramGroupId: '',
    configuration: {}
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toggleIsOpen();
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggleIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
              />
            </div>
            {/* Add more configuration fields as needed */}
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit">Create Agent</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
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

function TaskCard({ task }: { task: AgentTask }) {
  // Get status styling
  const getStatusStyle = (status: string) => {
    const styles = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="h-4 w-4" /> },
      'in-progress': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <ActivityIcon className="h-4 w-4 animate-pulse" /> },
      'completed': { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
      'failed': { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="h-4 w-4" /> }
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const statusStyle = getStatusStyle(task.status);

  return (
    <Card className={cn(gradientStyle.card, "relative overflow-hidden")}>
      {/* Status indicator strip */}
      <div className={cn("absolute top-0 left-0 w-1 h-full", statusStyle.bg)} />
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            {task.agentAvatar ? (
              <>
                <img 
                  src={task.agentAvatar} 
                  alt={task.agentName} 
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className={cn(
                  "hidden w-8 h-8 rounded-full flex items-center justify-center", 
                  gradientStyle.iconContainer
                )}>
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              </>
            ) : (
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", gradientStyle.iconContainer)}>
                <Bot className="w-5 h-5 text-primary" />
              </div>
            )}
            <div>
              <h4 className="font-medium">{task.taskName}</h4>
              <p className="text-sm text-muted-foreground">{task.agentName}</p>
            </div>
          </div>
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
            statusStyle.bg,
            statusStyle.text
          )}>
            {statusStyle.icon}
            {task.status}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Started {new Date(task.startedAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

const SAMPLE_LOGS = [
  {
    timestamp: '2024-01-15 14:23:45',
    message: 'Successfully processed 150 customer inquiries',
    status: 'success'
  },
  {
    timestamp: '2024-01-15 14:20:12',
    message: 'Warning: High latency detected in responses',
    status: 'error'
  },
  {
    timestamp: '2024-01-15 14:15:00',
    message: 'Agent Customer Support Bot activated',
    status: 'info'
  }
];

const performanceData = [
  { date: '2024-01-01', performance: 85 },
  { date: '2024-01-02', performance: 82 },
  { date: '2024-01-03', performance: 88 },
  { date: '2024-01-04', performance: 85 },
  { date: '2024-01-05', performance: 90 },
  { date: '2024-01-06', performance: 92 },
  { date: '2024-01-07', performance: 89 },
  { date: '2024-01-08', performance: 91 }
];

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

const GlobalStats = ({ stats }: { stats: DashboardStats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    {[
      { 
        label: "Active Agents", 
        value: stats.overview.activeAgents.toString(), 
        icon: <Bot className="h-4 w-4 text-purple-500" /> 
      },
      { 
        label: "Active Tasks", 
        value: stats.overview.activeTasks.toString(), 
        icon: <Terminal className="h-4 w-4 text-purple-500" />,
      },
      { 
        label: "Total Users",
        value: stats.community.totalUsers.toString(), 
        icon: <Users className="h-4 w-4 text-purple-500" />,
      },
      { 
        label: "System Health", 
        value: '98%', 
        icon: <ActivityIcon className="h-4 w-4 text-purple-500" /> 
      },
    ].map((stat, i) => (
      <Card key={i} className={gradientStyle.card}>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
          </div>
          <div className={`rounded-full p-3 ${gradientStyle.iconContainer}`}>
            {stat.icon}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const StatCards = ({ stats }: { stats: DashboardStats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {/* Task Status Card */}
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-lg font-semibold">Task Status</h3>
          <div className="rounded-full p-2" style={{ background: 'rgba(236, 72, 153, 0.1)' }}>
            <Terminal className="h-5 w-5 text-pink-500" />
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stats.overview.activeTasks}</span>
              <span className="text-sm text-gray-500">tasks</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Active Tasks</p>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div 
              className="h-full"
              style={{ 
                width: stats.overview.totalTasks === 0 ? '0%' : 
                  `${((stats.overview.totalTasks - stats.overview.failedTasks) / stats.overview.totalTasks) * 100}%`,
                background: 'linear-gradient(to right, #EC4899, #3B82F6)'
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* System Performance Card */}
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-lg font-semibold">System Performance</h3>
          <div className="rounded-full p-2" style={{ background: 'rgba(236, 72, 153, 0.1)' }}>
            <ActivityIcon className="h-5 w-5 text-pink-500" />
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stats.performance.responseTime}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Response Time</p>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div 
              className="h-full"
              style={{ 
                width: '92%',
                background: 'linear-gradient(to right, #EC4899, #3B82F6)'
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Message Stats Card */}
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-lg font-semibold">Message Statistics</h3>
          <div className="rounded-full p-2" style={{ background: 'rgba(236, 72, 153, 0.1)' }}>
            <MessageSquare className="h-5 w-5 text-pink-500" />
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stats.messages.today.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Messages Today</p>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div 
              className="h-full"
              style={{ 
                width: '78%',
                background: 'linear-gradient(to right, #EC4899, #3B82F6)'
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

interface AnimatedLog {
  timestamp: string;
  message: string;
  status: 'success' | 'error' | 'info';
  agentId: string;
  agentName: string;
}

const LIVE_LOGS: AnimatedLog[] = [
  {
    timestamp: new Date().toISOString(),
    message: "Processing user request #1234",
    status: "info",
    agentId: "1",
    agentName: "Customer Support Bot"
  },
  {
    timestamp: new Date().toISOString(),
    message: "Successfully generated response using GPT-4",
    status: "success",
    agentId: "1",
    agentName: "Customer Support Bot"
  },
  {
    timestamp: new Date().toISOString(),
    message: "Failed to connect to external API",
    status: "error",
    agentId: "2",
    agentName: "Sales Assistant"
  },
  {
    timestamp: new Date().toISOString(),
    message: "New conversation started",
    status: "info",
    agentId: "3",
    agentName: "Data Analyzer"
  },
];

interface Activity {
  type: 'User Interaction' | 'Agent Response';
  agentName: string;
  agentId?: string;
  channelId?: string;
  description: string;
  details: {
    message?: string;
    sentiment?: string;
    positiveScore?: string;
    negativeScore?: string;
    userMessage?: string;
    agentReply?: string;
  };
  timeAgo: string;
}

interface ActivityResponse {
  totalActivities: number;
  activities: Activity[];
}

export default function Page() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isCreateAgent, setIsCreateAgent] = useState(false);
  const [isViewLogs, setIsViewLogs] = useState(false);
  const [tasks, setTasks] = useState<TaskGroups>({});
  const [activeTab, setActiveTab] = useState("overview");
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState("all");
  const router = useRouter();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAuthDialogOpen(true);
    }
  }, [user]);


  const handleAgentStatusToggle = async (agentId: string) => {
    try {
      const agent = agents.find(a => a._id === agentId);
      if (!agent) return;

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

      // Update local state
      setAgents(agents.map(a => 
        a._id === agentId ? { ...a, active: !a.active } : a
      ));
    } catch (error) {
      console.error('Failed to toggle agent status:', error);
      // Optionally show an error toast/notification here
    }
  };

   
 

  useEffect(() => {
    let currentIndex = 0;
    
    const addLog = () => {
      const newLog = {
        ...LIVE_LOGS[currentIndex],
        timestamp: new Date().toISOString()
      };
      
      setLogs(prev => [...prev, newLog].slice(-100));
      currentIndex = (currentIndex + 1) % LIVE_LOGS.length;
    };

    // Add initial log immediately
    addLog();

    const interval = setInterval(addLog, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetchWithAuth('/agents/dashboard/stats');

        setDashboardStats(response);
        setError(null);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      if (activeTab === 'overview') {
        try {
          setIsLoadingActivities(true);
          const response = await fetchWithAuth('/agents/activity/recent');
          setRecentActivities(response.activities);
        } catch (error) {
          console.error('Failed to fetch recent activities:', error);
        } finally {
          setIsLoadingActivities(false);
        }
      }
    };

    fetchRecentActivities();
    // Refresh every 30 seconds
    const interval = setInterval(fetchRecentActivities, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetchWithAuth('/agents');
        setAgents(response);
        // If we had a selected agent, update it with the new data
        if (selectedAgent) {
          const updatedSelectedAgent = response.find((a: Agent) => a._id === selectedAgent._id);
          setSelectedAgent(updatedSelectedAgent || null);
        }
      } catch (error) {
        console.error('Failed to fetch agents:', error);
        // Optionally set an error state here
      }
    };

    if (user) {  // Only fetch if user is authenticated
      fetchAgents();
    }
  }, [user]); // Depend on user to refetch when auth state changes

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
          await fetchWithAuth(`/agents/${agentId}`, {
            method: 'DELETE'
          });
          
          // Update local state to remove the deleted agent
          setAgents(prevAgents => prevAgents.filter(agent => agent._id !== agentId));
          
          // If the deleted agent was selected, clear the selection
          if (selectedAgent?._id === agentId) {
            setSelectedAgent(null);
          }
          
          // Optional: Show success message
          // You might want to add a toast notification system for this
          console.log('Agent deleted successfully');
        } catch (error) {
          // Handle error appropriately
          console.error('Failed to delete agent:', error);
          // Optional: Show error message to user
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
                            onClick={() => handleAssignTask(agent._id, 'sentiment')}
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
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <ScrollArea className="h-[400px]">
          {isLoadingActivities ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="rounded-full p-2 mt-1" style={{ background: 'rgba(236, 72, 153, 0.1)' }}>
                    {activity.type === 'User Interaction' ? (
                      <MessageSquare className="h-4 w-4 text-pink-500" />
                    ) : (
                      <Bot className="h-4 w-4 text-pink-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.agentName}
                      </p>
                      <span className="text-xs text-gray-500">{activity.timeAgo}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    {activity.details.message && (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <p className="line-clamp-2">{activity.details.message}</p>
                        {activity.details.sentiment && (
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full",
                              {
                                "bg-green-100 text-green-800": activity.details.sentiment === 'Positive',
                                "bg-red-100 text-red-800": activity.details.sentiment === 'Negative',
                                "bg-gray-100 text-gray-800": activity.details.sentiment === 'Neutral',
                              }
                            )}>
                              {activity.details.sentiment}
                            </span>
                            {activity.details.positiveScore && (
                              <span className="text-green-600">+{activity.details.positiveScore}</span>
                            )}
                            {activity.details.negativeScore && (
                              <span className="text-red-600">-{activity.details.negativeScore}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {activity.details.userMessage && (
                      <div className="mt-2 text-sm">
                        <div className="bg-gray-50 p-2 rounded mb-2">
                          <p className="text-gray-600 line-clamp-2">{activity.details.userMessage}</p>
                        </div>
                        <div className="bg-pink-50 p-2 rounded">
                          <p className="text-gray-800 line-clamp-2">{activity.details.agentReply}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No recent activities
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );

  useEffect(() => {
    const fetchTasks = async () => {
      if (activeTab === 'tasks') {
        try {
          setIsLoading(true);
          const response = await fetchWithAuth('/agents/tasks/all');
          setTasks(response.tasks);
        } catch (error) {
          console.error('Failed to fetch tasks:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTasks();
    // Refresh every 30 seconds
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex select-none flex-col gap-1">
          <h2 className="text-3xl font-semibold leading-[38px] text-black">
            Agent Dashboard
          </h2>
          <span className="leading-[24px] text-[#475467]">
            Manage and monitor your AI agents
          </span>
        </div>

        <div className="flex gap-3">
          <button
            className={`flex items-center gap-2 rounded-[8px] px-4 py-2.5 font-semibold ${gradientStyle.button}`}
            onClick={() => router.push("/agents/new")}
          >
            <Plus width={12} height={12} />
            <span className="block text-nowrap text-sm">
              Create New Agent
            </span>
          </button>

        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-4">
          {error}
        </div>
      ) : dashboardStats ? (
        <>
          <GlobalStats stats={dashboardStats} />
          <div className="my-6 h-[1px] w-full bg-border" />
          <StatCards stats={dashboardStats} />
        </>
      ) : null}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecentActivities />
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
                <LineChart data={performanceData} />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Active Conversations</h3>
                <ScrollArea className="h-[350px]">
                  {agents.map(agent => (
                    <div key={agent._id} className="flex items-center justify-between py-2">
                      <span>{agent.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {agent.activeChats} active chats
                      </span>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="mt-6">
          {renderAgentsContent()}
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(tasks).map(([status, taskList]) => (
                <div key={status}>
                  <h3 className="text-lg font-semibold mb-4 capitalize">{status} Tasks</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {taskList.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(tasks).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No tasks found
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="bg-black text-white p-4 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  <span>Agent Logs</span>
                </div>
                <select 
                  className="bg-gray-800 text-white rounded px-3 py-1 text-sm"
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                >
                  <option value="all">All Agents</option>
                  <option value="1">Customer Support Bot</option>
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
                          className="font-mono text-sm mb-2 opacity-0 animate-fade-in"
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
                  <div className="text-center text-gray-500 py-8">
                    No logs available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AuthDialog
        isOpen={isAuthDialogOpen}
        toggleIsOpen={() => setIsAuthDialogOpen((prev) => !prev)}
      />
    </section>
  );
}
