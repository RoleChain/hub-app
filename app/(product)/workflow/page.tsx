"use client";

import { useState, useRef, useCallback, useContext } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  addEdge,
  NodeTypes as ReactFlowNodeTypes,
  Position,
  Handle,
  NodeResizeControl,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Play, Save, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import React from 'react';

// Create the ResizeIcon component with smaller dimensions
function ResizeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="#ff0071"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ position: 'absolute', right: 3, bottom: 3 }}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <polyline points="16 20 20 20 20 16" />
      <line x1="14" y1="14" x2="20" y2="20" />
      <polyline points="8 4 4 4 4 8" />
      <line x1="4" y1="4" x2="10" y2="10" />
    </svg>
  );
}

// Custom node data interface
interface NodeData {
  label: string;
  schedule?: string;
  method?: string;
  url?: string;
  model?: string;
  systemPrompt?: string;
  maxPages?: number;
  selector?: string;
  recipient?: string;
  subject?: string;
  message?: string;
  width?: number;
  [key: string]: any;
}

// Create a context for workflow functions
const WorkflowContext = React.createContext<{
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  openNodeSettings: (id: string) => void;
}>({
  updateNodeData: () => {},
  openNodeSettings: () => {},
});

// Define the style for resize control with improved configuration
const controlStyle = {
  background: 'transparent',
  border: 'none',
  zIndex: 10
};

// Define smaller default sizes for nodes
const nodeSizes = {
  small: { width: 180, height: 'auto' },
  medium: { width: 220, height: 'auto' },
  large: { width: 280, height: 'auto' },
  custom: { width: 200, height: 'auto' }, 
};

// Node components with explicit height settings
const TriggerNode = ({ data, id, selected }: { data: NodeData, id: string, selected?: boolean }) => {
  const { openNodeSettings, updateNodeData } = useContext(WorkflowContext);
  
  // Use the default width from nodeSizes
  const width = data.width || nodeSizes.small.width;

  return (
    <div 
      className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm relative"
      style={{ minHeight: '60px', width }}
    >
      <NodeResizeControl 
        style={controlStyle} 
        minWidth={120} 
        minHeight={40}
      >
        <ResizeIcon />
      </NodeResizeControl>
      
      <Handle type="source" position={Position.Right} style={{ background: '#4299e1' }} />
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
          <div className="text-blue-600 text-xs">⏱️</div>
        </div>
        <div>
          <p className="font-medium text-xs">{data.label}</p>
          <p className="text-xs text-gray-500">Schedule</p>
        </div>
      </div>
      
      <div 
        className="text-xs px-1 py-1 bg-gray-100 rounded text-gray-600  cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          openNodeSettings(id);
        }}
      >
        {data.schedule || "Every 1 Minute"}
      </div>
    </div>
  );
};

const HttpNode = ({ data, id, selected }: { data: NodeData, id: string, selected?: boolean }) => {
  const { openNodeSettings, updateNodeData } = useContext(WorkflowContext);
  
  // Use the default width from nodeSizes
  const width = data.width || nodeSizes.small.width;

  return (
    <div 
      className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm relative"
      style={{ minHeight: '60px', width }}
    >
      <NodeResizeControl 
        style={controlStyle} 
        minWidth={120} 
        minHeight={40}
      >
        <ResizeIcon />
      </NodeResizeControl>
      
      <Handle type="target" position={Position.Left} style={{ background: '#4299e1' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#4299e1' }} />
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
          <div className="text-blue-600 text-xs">🌐</div>
        </div>
        <div>
          <p className="font-medium text-xs">{data.label}</p>
          <p className="text-xs text-gray-500">HTTP</p>
        </div>
      </div>
      
      <div 
        className="text-xs px-2 py-2 bg-gray-100 rounded text-gray-600 mt-1 cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          openNodeSettings(id);
        }}
      >
        {data.method || "GET"} {data.url || "/api"}
      </div>
    </div>
  );
};

const OpenAINode = ({ data, id, selected }: { data: NodeData, id: string, selected?: boolean }) => {
  const { openNodeSettings, updateNodeData } = useContext(WorkflowContext);
  
  // Use the default width from nodeSizes
  const width = data.width || nodeSizes.small.width;

  return (
    <div 
      className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm relative"
      style={{ minHeight: '60px', width }}
    >
      <NodeResizeControl 
        style={controlStyle} 
        minWidth={120} 
        minHeight={40}
      >
        <ResizeIcon />
      </NodeResizeControl>
      
      <Handle type="target" position={Position.Left} style={{ background: '#4299e1' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#4299e1' }} />
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
          <div className="text-green-600 text-xs">🤖</div>
        </div>
        <div>
          <p className="font-medium text-xs">{data.label}</p>
          <p className="text-xs text-gray-500">OpenAI Chat</p>
        </div>
      </div>
      
      <div 
        className="text-xs px-2 py-2 bg-gray-100 rounded text-gray-600 mt-1 cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          openNodeSettings(id);
        }}
      >
        {data.model || "gpt-4o"}
      </div>
    </div>
  );
};

const CrawlerNode = ({ data, id, selected }: { data: NodeData, id: string, selected?: boolean }) => {
  const { openNodeSettings, updateNodeData } = useContext(WorkflowContext);
  
  // Use the default width from nodeSizes
  const width = data.width || nodeSizes.small.width;

  return (
    <div 
      className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm relative"
      style={{ minHeight: '60px', width }}
    >
      <NodeResizeControl 
        style={controlStyle} 
        minWidth={120} 
        minHeight={40}
      >
        <ResizeIcon />
      </NodeResizeControl>
      
      <Handle type="target" position={Position.Left} style={{ background: '#4299e1' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#4299e1' }} />
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
          <div className="text-purple-600 text-xs">🕸️</div>
        </div>
        <div>
          <p className="font-medium text-xs">{data.label}</p>
          <p className="text-xs text-gray-500">Crawler</p>
        </div>
      </div>
      
      <div 
        className="text-xs px-2 py-2 bg-gray-100 rounded text-gray-600 mt-1 cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          openNodeSettings(id);
        }}
      >
        {data.url || "https://example.com"}
      </div>
    </div>
  );
};

const EmailNode = ({ data, id, selected }: { data: NodeData, id: string, selected?: boolean }) => {
  const { openNodeSettings, updateNodeData } = useContext(WorkflowContext);
  
  // Use the default width from nodeSizes
  const width = data.width || nodeSizes.small.width;

  return (
    <div 
      className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm relative"
      style={{ minHeight: '60px', width }}
    >
      <NodeResizeControl 
        style={controlStyle} 
        minWidth={120} 
        minHeight={40}
      >
        <ResizeIcon />
      </NodeResizeControl>
      
      <Handle type="target" position={Position.Left} style={{ background: '#4299e1' }} />
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
          <div className="text-red-600 text-xs">📧</div>
        </div>
        <div>
          <p className="font-medium text-xs">{data.label}</p>
          <p className="text-xs text-gray-500">Email</p>
        </div>
      </div>
      
      <div 
        className="text-xs px-2 py-2 bg-gray-100 rounded text-gray-600 mt-1 cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          openNodeSettings(id);
        }}
      >
        {data.recipient || "example@mail.com"}
      </div>
    </div>
  );
};

const TelegramNode = ({ data, id, selected }: { data: NodeData, id: string, selected?: boolean }) => {
  const { openNodeSettings, updateNodeData } = useContext(WorkflowContext);
  
  // Use the default width from nodeSizes
  const width = data.width || nodeSizes.small.width;

  return (
    <div 
      className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm relative"
      style={{ minHeight: '60px', width }}
    >
      <NodeResizeControl 
        style={controlStyle} 
        minWidth={120} 
        minHeight={40}
      >
        <ResizeIcon />
      </NodeResizeControl>
      
      <Handle type="target" position={Position.Left} style={{ background: '#4299e1' }} />
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
          <div className="text-blue-600 text-xs">📱</div>
        </div>
        <div>
          <p className="font-medium text-xs">{data.label}</p>
          <p className="text-xs text-gray-500">Telegram</p>
        </div>
      </div>
      
      <div 
        className="text-xs px-2 py-2 bg-gray-100 rounded text-gray-600 mt-1 cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          openNodeSettings(id);
        }}
      >
        {data.chatId || "Chat ID"} {data.botToken ? "✓" : ""}
      </div>
    </div>
  );
};

const DiscordNode = ({ data, id, selected }: { data: NodeData, id: string, selected?: boolean }) => {
  const { openNodeSettings, updateNodeData } = useContext(WorkflowContext);
  
  // Use the default width from nodeSizes
  const width = data.width || nodeSizes.small.width;

  return (
    <div 
      className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm relative"
      style={{ minHeight: '60px', width }}
    >
      <NodeResizeControl 
        style={controlStyle} 
        minWidth={120} 
        minHeight={40}
      >
        <ResizeIcon />
      </NodeResizeControl>
      
      <Handle type="target" position={Position.Left} style={{ background: '#4299e1' }} />
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
          <div className="text-indigo-600 text-xs">🎮</div>
        </div>
        <div>
          <p className="font-medium text-xs">{data.label}</p>
          <p className="text-xs text-gray-500">Discord</p>
        </div>
      </div>
      
      <div 
        className="text-xs px-2 py-2 bg-gray-100 rounded text-gray-600 mt-1 cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          openNodeSettings(id);
        }}
      >
        {data.webhookUrl || "Webhook URL"}
      </div>
    </div>
  );
};

const XNode = ({ data, id, selected }: { data: NodeData, id: string, selected?: boolean }) => {
  const { openNodeSettings, updateNodeData } = useContext(WorkflowContext);
  
  // Use the default width from nodeSizes
  const width = data.width || nodeSizes.small.width;

  return (
    <div 
      className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm relative"
      style={{ minHeight: '60px', width }}
    >
      <NodeResizeControl 
        style={controlStyle} 
        minWidth={120} 
        minHeight={40}
      >
        <ResizeIcon />
      </NodeResizeControl>
      
      <Handle type="target" position={Position.Left} style={{ background: '#4299e1' }} />
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
          <div className="text-white text-xs">✖️</div>
        </div>
        <div>
          <p className="font-medium text-xs">{data.label}</p>
          <p className="text-xs text-gray-500">X (Twitter)</p>
        </div>
      </div>
      
      <div 
        className="text-xs px-2 py-2 bg-gray-100 rounded text-gray-600 mt-1 cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          openNodeSettings(id);
        }}
      >
        {data.apiKey ? "API Key Set" : "API Key Required"}
      </div>
    </div>
  );
};

// Node type mapping
const nodeTypes: ReactFlowNodeTypes = {
  trigger: TriggerNode,
  http: HttpNode,
  openai: OpenAINode,
  crawler: CrawlerNode,
  email: EmailNode,
  telegram: TelegramNode,
  discord: DiscordNode,
  x: XNode,
};

// Available node templates
const nodeTemplates = [
  { type: 'trigger', label: 'Schedule Trigger', category: 'Triggers' },
  { type: 'http', label: 'HTTP Request', category: 'Actions' },
  { type: 'openai', label: 'OpenAI Chat', category: 'AI' },
  { type: 'crawler', label: 'Web Crawler', category: 'Data' },
  { type: 'email', label: 'Send Email', category: 'Actions' },
  { type: 'telegram', label: 'Telegram Message', category: 'Actions' },
  { type: 'discord', label: 'Discord Message', category: 'Actions' },
  { type: 'x', label: 'X Post', category: 'Actions' },
];

export default function WorkflowPage() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [isNodeSettingsOpen, setIsNodeSettingsOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [isTestMode, setIsTestMode] = useState(false);
  const [animatedEdges, setAnimatedEdges] = useState<string[]>([]);

  // Categories of node templates - ensure this is properly calculating all categories
  const nodeCategories = Array.from(new Set(nodeTemplates.map(template => template.category)));

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow/type');
      const name = event.dataTransfer.getData('application/reactflow/name');

      if (!type || !reactFlowBounds || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: name, 
          id: `${type}-${Date.now()}`,
          width: nodeSizes.small.width // Set default width from nodeSizes
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeSettingsClose = useCallback(() => {
    setIsNodeSettingsOpen(false);
    setSelectedNode(null);
  }, []);

  const updateNodeData = useCallback((id: string, data: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string, nodeName: string) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/name', nodeName);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleTestClick = useCallback(() => {
    setIsTestMode(true);
    // Start animation on all edges sequentially
    const edgeIds = edges.map(edge => edge.id);
    
    // Clear any existing animation
    setAnimatedEdges([]);
    
    // Animate each edge with a slight delay
    edgeIds.forEach((id, index) => {
      setTimeout(() => {
        setAnimatedEdges(prev => [...prev, id]);
      }, index * 700); // 700ms delay between each edge animation
    });
    
    // Reset animation after all edges are animated
    setTimeout(() => {
      setIsTestMode(false);
      setAnimatedEdges([]);
    }, (edgeIds.length + 1) * 700);
  }, [edges]);

  const renderNodeSettings = () => {
    if (!selectedNode) return null;

    const nodeType = selectedNode.type;
    let settingsContent;

    switch (nodeType) {
      case 'trigger':
        settingsContent = (
          <div className="space-y-4">
            <div>
              <Label>Trigger Name</Label>
              <Input 
                value={selectedNode.data.label || ''} 
                onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
              />
            </div>
            <div>
              <Label>Schedule</Label>
              <Input 
                value={selectedNode.data.schedule || 'Every 1 Minute'} 
                onChange={(e) => updateNodeData(selectedNode.id, { schedule: e.target.value })}
                placeholder="e.g., Every 1 Minute, Daily at 9 AM"
              />
            </div>
          </div>
        );
        break;
      case 'http':
        settingsContent = (
          <div className="space-y-4">
            <div>
              <Label>HTTP Node Name</Label>
              <Input 
                value={selectedNode.data.label || ''} 
                onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
              />
            </div>
            <div>
              <Label>Method</Label>
              <select 
                className="w-full rounded-md border border-gray-300 p-2"
                value={selectedNode.data.method || 'GET'} 
                onChange={(e) => updateNodeData(selectedNode.id, { method: e.target.value })}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <Label>URL</Label>
              <Input 
                value={selectedNode.data.url || ''} 
                onChange={(e) => updateNodeData(selectedNode.id, { url: e.target.value })}
                placeholder="https://api.example.com/data"
              />
            </div>
          </div>
        );
        break;
      case 'openai':
        settingsContent = (
          <div className="space-y-4">
            <div>
              <Label>OpenAI Node Name</Label>
              <Input 
                value={selectedNode.data.label || ''} 
                onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
              />
            </div>
            <div>
              <Label>Model</Label>
              <select 
                className="w-full rounded-md border border-gray-300 p-2"
                value={selectedNode.data.model || 'gpt-4o'} 
                onChange={(e) => updateNodeData(selectedNode.id, { model: e.target.value })}
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>
            <div>
              <Label>System Prompt</Label>
              <textarea 
                className="w-full rounded-md border border-gray-300 p-2 min-h-[100px]"
                value={selectedNode.data.systemPrompt || ''} 
                onChange={(e) => updateNodeData(selectedNode.id, { systemPrompt: e.target.value })}
                placeholder="Enter a system prompt for the AI"
              />
            </div>
          </div>
        );
        break;
      case 'crawler':
        settingsContent = (
          <div className="space-y-4">
            <div>
              <Label>Crawler Name</Label>
              <Input 
                value={selectedNode.data.label || ''} 
                onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
              />
            </div>
            <div>
              <Label>Website URL</Label>
              <Input 
                value={selectedNode.data.url || ''} 
                onChange={(e) => updateNodeData(selectedNode.id, { url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label>Max Pages</Label>
              <Input 
                type="number"
                value={selectedNode.data.maxPages || 50} 
                onChange={(e) => updateNodeData(selectedNode.id, { maxPages: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>CSS Selector</Label>
              <Input 
                value={selectedNode.data.selector || ''} 
                onChange={(e) => updateNodeData(selectedNode.id, { selector: e.target.value })}
                placeholder="article, .content, #main"
              />
            </div>
          </div>
        );
        break;
      case 'email':
        settingsContent = (
          <div className="space-y-4">
            <div>
              <Label>Email Node Name</Label>
              <Input 
                value={selectedNode.data.label || ''} 
                onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
              />
            </div>
            <div>
              <Label>Recipient</Label>
              <Input 
                value={selectedNode.data.recipient || ''} 
                onChange={(e) => updateNodeData(selectedNode.id, { recipient: e.target.value })}
                placeholder="recipient@example.com"
              />
            </div>
            <div>
              <Label>Subject</Label>
              <Input 
                value={selectedNode.data.subject || ''} 
                onChange={(e) => updateNodeData(selectedNode.id, { subject: e.target.value })}
                placeholder="Email Subject"
              />
            </div>
            <div>
              <Label>Message</Label>
              <textarea 
                className="w-full rounded-md border border-gray-300 p-2 min-h-[100px]"
                value={selectedNode.data.message || ''} 
                onChange={(e) => updateNodeData(selectedNode.id, { message: e.target.value })}
                placeholder="Email message content"
              />
            </div>
          </div>
        );
        break;
      case 'telegram':
        settingsContent = (
          <div className="space-y-4">
            <div>
              <Label>Telegram Node Name</Label>
              <Input 
                value={selectedNode.data.label || ''} 
                onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
              />
            </div>
            <div>
              <Label>Chat ID</Label>
              <Input 
                value={selectedNode.data.chatId || ''} 
                onChange={(e) => updateNodeData(selectedNode.id, { chatId: e.target.value })}
                placeholder="Enter the chat ID"
              />
            </div>
            <div>
              <Label>Bot Token</Label>
              <Input 
                type="password"
                value={selectedNode.data.botToken || ''} 
                onChange={(e) => updateNodeData(selectedNode.id, { botToken: e.target.value })}
                placeholder="Enter your Telegram bot token"
              />
              <p className="text-xs text-gray-500 mt-1">Get your bot token from BotFather</p>
            </div>
          </div>
        );
        break;
      case 'discord':
        settingsContent = (
          <div className="space-y-4">
            <div>
              <Label>Discord Node Name</Label>
              <Input 
                value={selectedNode.data.label || ''} 
                onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
              />
            </div>
            <div>
              <Label>Webhook URL</Label>
              <Input 
                value={selectedNode.data.webhookUrl || ''} 
                onChange={(e) => updateNodeData(selectedNode.id, { webhookUrl: e.target.value })}
                placeholder="Enter the webhook URL"
              />
            </div>
          </div>
        );
        break;
      case 'x':
        settingsContent = (
          <div className="space-y-4">
            <div>
              <Label>X Node Name</Label>
              <Input 
                value={selectedNode.data.label || ''} 
                onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
              />
            </div>
            <div>
              <Label>API Key</Label>
              <Input 
                value={selectedNode.data.apiKey ? 'API Key Set' : 'API Key Required'} 
                onChange={(e) => updateNodeData(selectedNode.id, { apiKey: e.target.value === 'API Key Set' })}
              />
            </div>
          </div>
        );
        break;
      default:
        settingsContent = <p>No settings available for this node type</p>;
        break;
    }

    return (
      <Dialog open={isNodeSettingsOpen} onOpenChange={setIsNodeSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Node: {selectedNode.data.label}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {settingsContent}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onNodeSettingsClose}>Cancel</Button>
            <Button onClick={onNodeSettingsClose}>Apply</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Update the edges to include animation state
  const getEdges = useCallback(() => {
    return edges.map(edge => ({
      ...edge,
      animated: isTestMode && animatedEdges.includes(edge.id),
      style: isTestMode && animatedEdges.includes(edge.id) ? { stroke: '#10b981', strokeWidth: 3 } : {}
    }));
  }, [edges, isTestMode, animatedEdges]);

  // Update for opening settings by id
  const openNodeSettings = useCallback((id: string) => {
    const node = nodes.find(node => node.id === id);
    if (node) {
      setSelectedNode(node);
      setIsNodeSettingsOpen(true);
    }
  }, [nodes]);

  // Update the context value
  const workflowContextValue = {
    updateNodeData,
    openNodeSettings,
  };

  const onInit = useCallback((reactFlowInstance: any) => {
    setReactFlowInstance(reactFlowInstance);
    reactFlowInstance.fitView({ padding: 0.2 });

    // Set up a MutationObserver to track node resizing
    setTimeout(() => {
      const nodeElements = document.querySelectorAll('.react-flow__node');
      nodeElements.forEach((node) => {
        const nodeId = node.getAttribute('data-id');
        const resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const width = entry.contentRect.width;
            if (nodeId && width > 0) {
              updateNodeData(nodeId, { width });
            }
          }
        });
        resizeObserver.observe(node);
      });
    }, 1000);
  }, [updateNodeData]);

  return (
    <WorkflowContext.Provider value={workflowContextValue}>
      <div className="p-4 h-screen flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Input 
              value={workflowName} 
              onChange={(e) => setWorkflowName(e.target.value)} 
              className="font-semibold text-lg border-none focus-visible:ring-0 px-0"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleTestClick}
              disabled={isTestMode}
            >
              <Play className="h-4 w-4 mr-1" />
              Test
            </Button>
            <Button size="sm">
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>

        <div className="flex flex-1 gap-4 h-[calc(100vh-130px)]">
          {/* Node Panel */}
          <Card className="w-60 p-3 overflow-y-auto">
            <h3 className="font-medium mb-2 px-1">Nodes</h3>
            <Tabs defaultValue={nodeCategories[0]}>
              <TabsList className="grid grid-cols-3 mb-2">
                {nodeCategories.map(category => (
                  <TabsTrigger key={category} value={category} className="text-xs">{category}</TabsTrigger>
                ))}
              </TabsList>
              {nodeCategories.map(category => (
                <TabsContent key={category} value={category} className="mt-0">
                  <div className="space-y-2">
                    {nodeTemplates
                      .filter(template => template.category === category)
                      .map(({ type, label }) => (
                        <div
                          key={type}
                          draggable
                          onDragStart={(e) => onDragStart(e, type, label)}
                          className="bg-white p-2 rounded-md border border-gray-200 cursor-move hover:border-blue-400 hover:shadow-sm transition-all"
                        >
                          <p className="text-sm font-medium text-left">{label}</p>
                        </div>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </Card>

          {/* Flow Builder */}
          <Card className="flex-1 relative">
            <div className="h-full" ref={reactFlowWrapper}>
              <ReactFlow
                nodes={nodes}
                edges={getEdges()}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={onInit}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 2, minZoom: 0.5, maxZoom: 1.2 }}
                defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                minZoom={0.5}
                maxZoom={2}
                attributionPosition="bottom-right"
                className={isTestMode ? 'test-mode' : ''}
              >
                <Controls />
                <MiniMap />
                <Background gap={12} size={1} color="#f1f1f1" />
              </ReactFlow>
            </div>
          </Card>
        </div>

        {renderNodeSettings()}
      </div>
    </WorkflowContext.Provider>
  );
}
