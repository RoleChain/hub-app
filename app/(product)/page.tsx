"use client";
import PapersIcon from "@/components/icons/papers";
import MissionCard from "@/components/Missions/MissionCard";
import { EyeIcon, PlusIcon, BarChart, Users, Bot, Trash2, MessageSquare, Settings, Plus, PlayIcon, Square, ActivityIcon, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import { VerifyPaperDialog, AuthDialog } from "@/components/Dialogs";
import { cn } from "@/lib/utils";
import axios from "axios";
import { Mission } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/card";
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
  DialogDescription,
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

// const MissionCardColors = [
//   { from: "#C1D27D", to: "#D5E1A6" },
//   { from: "#86B2FF", to: "#BBD5FF" },
//   { from: "#FFCB86", to: "rgba(255,_203,_134,_0.40)" },
//   { from: "#D586FF", to: "#E6B7FF" },
//   { from: "#FF8686", to: "rgba(255,_134,_134,_0.40)" },
//   { from: "#86D9FF", to: "rgba(134,_217,_255,_0.40)" },
// ];

const CHART_COLORS = {
  primary: '#3B82F6',    // Lighter blue
  secondary: '#94A3B8',  // Soft slate
  muted: '#CBD5E1',      // Slate-300
}

export function LineChart({ data }: { data: any }) {
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
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
          />
          <Line 
            type="monotone" 
            dataKey="performance" 
            stroke={CHART_COLORS.primary} 
            strokeWidth={2}
            dot={false}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

interface AgentAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

interface AgentCardProps {
  agent: {
    id: string;
    name?: string;
    description?: string;
    status?: string;
  };
  actions: AgentAction[];
}

export function AgentCard({ agent, actions }: AgentCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold">{agent.name || 'Unnamed Agent'}</h3>
        <p className="text-sm text-muted-foreground">{agent.description}</p>
        <div className="mt-4 flex gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
            >
              {action.icon}
              <span className="text-sm">{action.label}</span>
            </button>
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

export function CreateAgentDialog({ isOpen, toggleIsOpen, onCreateAgent }: CreateAgentDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    role: '',
    telegramGroupId: '',
    configuration: {}
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateAgent({
      ...formData,
      status: 'inactive',
      activeChats: 0,
      messageCount: 0
    });
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
  agentId: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  lastActive?: string;
  logs: AgentLog[];
  configuration?: Record<string, any>;
  telegramGroupId?: string;
  role: string;
  activeChats: number;
  messageCount: number;
  lastMessage?: string;
  performance?: {
    responsiveness: number;
    accuracy: number;
    userRating: number;
  };
}

function TaskCard({ task }: { task: AgentTask }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">{task.title}</h4>
          <span className={cn(
            "px-2 py-1 rounded-full text-xs",
            {
              "bg-yellow-100 text-yellow-800": task.status === 'pending',
              "bg-blue-100 text-blue-800": task.status === 'running',
              "bg-green-100 text-green-800": task.status === 'completed',
              "bg-red-100 text-red-800": task.status === 'failed',
            }
          )}>
            {task.status}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{task.description}</p>
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

const SAMPLE_AGENTS: Agent[] = [
  {
    id: '1',
    name: 'Customer Support Bot',
    description: 'Handles customer support inquiries',
    status: 'active',
    lastActive: '2 mins ago',
    lastMessage: 'Helped user resolve payment issue #1234',
    activeChats: 3,
    messageCount: 156,
    logs: [],
    role: 'support'
  },
  {
    id: '2',
    name: 'Sales Assistant',
    description: 'Handles sales inquiries and recommendations',
    status: 'active',
    lastActive: '5 mins ago',
    lastMessage: 'Generated product recommendation for client',
    activeChats: 2,
    messageCount: 89,
    logs: [],
    role: 'sales'
  },
  {
    id: '3',
    name: 'Data Analyzer',
    description: 'Analyzes market data and generates reports',
    status: 'inactive',
    lastActive: '1 hour ago',
    lastMessage: 'Completed market analysis report',
    activeChats: 0,
    messageCount: 45,
    logs: [],
    role: 'analytics'
  }
];

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

const GlobalStats = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    {[
      { label: "Active Agents", value: "3", icon: <Bot className="h-4 w-4" /> },
      { label: "Active Tasks", value: "5", icon: <ActivityIcon className="h-4 w-4" /> },
      { label: "Credits Used", value: "1,234", icon: <BarChart className="h-4 w-4" /> },
      { label: "System Health", value: "98%", icon: <ActivityIcon className="h-4 w-4" /> },
    ].map((stat, i) => (
      <Card key={i}>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
          </div>
          <div className="rounded-full p-3 bg-muted">{stat.icon}</div>
        </CardContent>
      </Card>
    ))}
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

export default function Page() {
  const [agents, setAgents] = useState<Agent[]>(SAMPLE_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(SAMPLE_AGENTS[0]);
  const [isCreateAgent, setIsCreateAgent] = useState(false);
  const [isViewLogs, setIsViewLogs] = useState(false);
  const [tasks, setTasks] = useState<AgentTask[]>([
    {
      id: '1',
      agentId: '1',
      title: 'Process Customer Feedback',
      description: 'Analyze and categorize customer feedback from last week',
      status: 'running',
      createdAt: '2024-01-15 10:00:00'
    },
    {
      id: '2',
      agentId: '2',
      title: 'Generate Sales Report',
      description: 'Create weekly sales performance analysis',
      status: 'pending',
      createdAt: '2024-01-15 09:00:00'
    }
  ]);
  const [activeTab, setActiveTab] = useState("overview");
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState("all");
  const router = useRouter();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setIsAuthDialogOpen(true);
    }
  }, [user]);

  const handleConfigureAgent = (agentId: string) => {
    // Add your configuration logic here
    console.log('Configuring agent:', agentId);
  };

  const handleAgentStatusToggle = async (agentId: string) => {
    try {
      const agent = agents.find(a => a.id === agentId);
      const newStatus = agent?.status === 'active' ? 'inactive' : 'active';
      await fetch(`/api/agents/${agentId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      setAgents(agents.map(a => 
        a.id === agentId ? { ...a, status: newStatus } : a
      ));
    } catch (error) {
      console.error('Failed to toggle agent status:', error);
    }
  };

  const handleCreateAgent = async (agentData: Omit<Agent, 'id' | 'logs'>) => {
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
      });
      const newAgent = await response.json();
      setAgents(prev => [...prev, newAgent]);
    } catch (error) {
      console.error('Failed to create agent:', error);
    }
  };

  // Fetch agents data
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents');
        const data = await response.json();
        setAgents(data);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      }
    };
    fetchAgents();
  }, []);

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
            className="flex items-center gap-2 rounded-[8px] border border-accent bg-accent px-4 py-2.5 font-semibold text-accent-foreground hover:bg-[#93B019]"
            onClick={() => router.push("/agents/new")}
          >
            <Plus width={12} height={12} />
            <span className="block text-nowrap text-sm">
              Create New Agent
            </span>
          </button>
          <CreateAgentDialog
            isOpen={isCreateAgent}
            toggleIsOpen={() => setIsCreateAgent((prev) => !prev)}
            onCreateAgent={handleCreateAgent}
          />
        </div>
      </div>

      <GlobalStats />

      <div className="my-6 h-[1px] w-full bg-border" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Community Stats Card */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Community Activity</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Total Users</p>
                  <p className="text-2xl font-bold">12.5k</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <Progress value={85} className="h-2" />
              <p className="text-sm text-muted-foreground">+15% from last month</p>
            </div>
          </CardContent>
        </Card>

        {/* System Performance Card */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">System Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Response Time</p>
                  <p className="text-2xl font-bold">238ms</p>
                </div>
                <ActivityIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <Progress value={92} className="h-2" />
              <p className="text-sm text-muted-foreground">Excellent performance</p>
            </div>
          </CardContent>
        </Card>

        {/* Message Stats Card */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Message Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Messages Today</p>
                  <p className="text-2xl font-bold">45.2k</p>
                </div>
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <Progress value={78} className="h-2" />
              <p className="text-sm text-muted-foreground">+8% from yesterday</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {[...agents, ...agents].map((agent, index) => (
                      <div key={index} 
                        className="flex items-center justify-between py-2 border-b animate-in fade-in-50 duration-300" 
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-sm text-muted-foreground">{agent.lastMessage}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {agent.lastActive}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
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
                    <div key={agent.id} className="flex items-center justify-between py-2">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                actions={[
                  {
                    label: 'View Logs',
                    icon: <ActivityIcon className="h-4 w-4" />,
                    onClick: () => {
                      setSelectedAgent(agent);
                      setIsViewLogs(true);
                    }
                  },
                  {
                    label: agent.status === 'active' ? 'Stop' : 'Start',
                    icon: agent.status === 'active' ? 
                      <Square className="h-4 w-4" /> : 
                      <PlayIcon className="h-4 w-4" />,
                    onClick: () => handleAgentStatusToggle(agent.id)
                  },
                  {
                    label: 'Configure',
                    icon: <Settings className="h-4 w-4" />,
                    onClick: () => handleConfigureAgent(agent.id)
                  }
                ]}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
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
