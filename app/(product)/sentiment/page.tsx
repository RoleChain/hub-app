'use client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  LineChart as RechartsLineChart,
  Line,
  PieChart,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  Area,
  AreaChart as RechartsAreaChart,
} from 'recharts'
import { cn } from "@/lib/utils"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Bell, AlertTriangle, CheckCircle, Users } from 'lucide-react'
import { useState } from 'react'
import { TelegramDialog } from '@/components/Dialogs/TelegramDialog'

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: any
}

const CHART_COLORS = {
  primary: '#E855E0',        // Bright pink
  secondary: '#4F6FFF',      // Bright blue
  danger: '#FF4444',         // Red
  success: '#22C55E',        // Green
  background: '#FFFFFF',     // White
  text: '#1A1D1F',          // Dark text
  muted: '#6F767E',         // Muted text
  // Gradients
  primaryGradient: {
    start: '#E855E0',        // Pink
    end: '#4F6FFF'          // Blue
  },
  cardBg: '#F4F5F6',        // Light gray background
  hover: '#F9FAFB'          // Hover state
}

export function AreaChart({ data, className, ...props }: ChartProps) {
  return (
    <div className={cn("w-full h-[350px]", className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data}>
          <defs>
            <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.primaryGradient.start}/>
              <stop offset="95%" stopColor={CHART_COLORS.primaryGradient.end}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            stroke={CHART_COLORS.text}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke={CHART_COLORS.text}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#ffffff",
              border: `1px solid ${CHART_COLORS.muted}`,
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}
          />
          <Area
            type="monotone"
            dataKey="totalMessages"
            stroke="url(#gradient)"
            fill="url(#areaGradient)"
            strokeWidth={2}
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#E855E0" />
              <stop offset="100%" stopColor="#4F6FFF" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(232,85,224,0.1)" />
              <stop offset="100%" stopColor="rgba(79,111,255,0.02)" />
            </linearGradient>
          </defs>
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BarChart({ data, className, ...props }: ChartProps) {
  return (
    <div className={cn("w-full h-[350px]", className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
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
          <Bar dataKey="newMembers" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
          <Bar dataKey="leftMembers" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface Column {
  header: string
  accessorKey: string
}

interface DataTableProps {
  columns: Column[]
  data: any[]
}

function DataTable({ columns, data }: DataTableProps) {
  return (
    <div className="rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {columns.map((column) => (
              <TableHead 
                key={column.accessorKey} 
                className="font-semibold text-sm py-4"
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow 
              key={rowIndex} 
              className="bg-white hover:bg-[#F9FAFB] transition-colors"
            >
              {columns.map((column) => (
                <TableCell 
                  key={`${rowIndex}-${column.accessorKey}`}
                  className="font-medium text-[#1A1D1F]"
                >
                  {column.accessorKey === 'status' ? (
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      row[column.accessorKey] === 'Active' 
                        ? "bg-[#E855E0]/10 text-[#E855E0]" 
                        : "bg-[#F4F5F6] text-[#6F767E]"
                    )}>
                      {row[column.accessorKey]}
                    </span>
                  ) : (
                    row[column.accessorKey]
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function DonutChart({ data }: { data: any[] }) {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function NotificationCard({ title, message, type }: { 
  title: string; 
  message: string; 
  type: 'warning' | 'success' | 'info' 
}) {
  const icons = {
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    info: <Bell className="h-5 w-5 text-blue-500" />
  }

  return (
    <div className="flex items-start space-x-4 p-4 rounded-xl bg-white shadow-[0_1px_3px_rgba(16,24,40,0.1),0_1px_2px_rgba(16,24,40,0.06)]">
      {icons[type]}
      <div>
        <h4 className="font-semibold text-[#1A1D1F]">{title}</h4>
        <p className="text-sm text-[#6F767E]">{message}</p>
      </div>
    </div>
  )
}

function LiveMessagesChart({ data }: ChartProps) {
  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          <XAxis 
            dataKey="time" 
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
            dataKey="messages" 
            stroke={CHART_COLORS.primary} 
            strokeWidth={2}
            dot={false}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function CommunityDashboard() {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(true)
  
  // Enhanced mock data
  const communityStats = [
    { 
      label: "Total Members",
      value: "24,819",
      trend: "+2.1%",
      trendUp: true 
    },
    { 
      label: "Active Users",
      value: "1,432",
      trend: "+5.2%",
      trendUp: true 
    },
    { 
      label: "Messages Today",
      value: "3,287",
      trend: "-1.5%",
      trendUp: false 
    },
    { 
      label: "Engagement Rate",
      value: "64%",
      trend: "+3.8%",
      trendUp: true 
    },
  ]

  const activityData = [
    { date: "Jan", totalMessages: 15420, activeUsers: 890, newMembers: 145, leftMembers: 78 },
    { date: "Feb", totalMessages: 18750, activeUsers: 1020, newMembers: 189, leftMembers: 92 },
    { date: "Mar", totalMessages: 16800, activeUsers: 950, newMembers: 156, leftMembers: 84 },
    { date: "Apr", totalMessages: 14200, activeUsers: 840, newMembers: 134, leftMembers: 98 },
    { date: "May", totalMessages: 17300, activeUsers: 980, newMembers: 167, leftMembers: 76 },
    { date: "Jun", totalMessages: 19100, activeUsers: 1150, newMembers: 198, leftMembers: 89 },
  ]

  // Add this new mock data
  const memberData = [
    { name: "Alice Smith", joinDate: "2024-03-15", posts: 145, status: "Active" },
    { name: "Bob Johnson", joinDate: "2024-03-14", posts: 89, status: "Inactive" },
    { name: "Carol White", joinDate: "2024-03-13", posts: 234, status: "Active" },
    { name: "David Brown", joinDate: "2024-03-12", posts: 56, status: "Active" },
    { name: "Eve Wilson", joinDate: "2024-03-11", posts: 12, status: "Inactive" },
  ]

  const sentimentData = [
    { date: "Jan", positive: 65, neutral: 25, negative: 10 },
    { date: "Feb", positive: 58, neutral: 30, negative: 12 },
    { date: "Mar", positive: 70, neutral: 20, negative: 10 },
    { date: "Apr", positive: 62, neutral: 28, negative: 10 },
    { date: "May", positive: 55, neutral: 30, negative: 15 },
    { date: "Jun", positive: 68, neutral: 22, negative: 10 },
  ]

  // Add table columns configuration
  const columns = [
    { header: "Member Name", accessorKey: "name" },
    { header: "Join Date", accessorKey: "joinDate" },
    { header: "Total Posts", accessorKey: "posts" },
    { header: "Status", accessorKey: "status" },
  ]

  // Add this new mock data
  const userDistribution = [
    { name: 'Active Users', value: 65, color: '#3B82F6' },  // Light blue
    { name: 'Inactive Users', value: 25, color: '#94A3B8' }, // Soft slate
    { name: 'At Risk', value: 10, color: '#FDA4AF' }        // Soft pink
  ]

  const notifications = [
    {
      title: "High Risk User Detected",
      message: "User 'JohnDoe' has been flagged for suspicious activity",
      type: "warning" as const
    },
    {
      title: "Engagement Milestone",
      message: "Community reached 25k total members!",
      type: "success" as const
    },
    {
      title: "Moderation Required",
      message: "5 posts flagged for review in #general",
      type: "info" as const
    }
  ]

  // Add new mock data for live messages
  const liveMessagesData = [
    { time: "12:00", messages: 45 },
    { time: "12:05", messages: 52 },
    { time: "12:10", messages: 38 },
    { time: "12:15", messages: 65 },
    { time: "12:20", messages: 48 },
    { time: "12:25", messages: 55 },
    { time: "12:30", messages: 42 },
  ]

  return (
    <div className="p-8 space-y-8 bg-[#FAFBFC]">
      <TelegramDialog
        isOpen={isAuthDialogOpen}
        toggleIsOpen={() => setIsAuthDialogOpen((prev) => !prev)}
      />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {communityStats.map((stat) => (
          <Card key={stat.label} className="bg-white rounded-2xl border-0 shadow-[0_1px_3px_rgba(16,24,40,0.1),0_1px_2px_rgba(16,24,40,0.06)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#6F767E]">
                {stat.label}
              </CardTitle>
              <span className={cn(
                "text-xs font-medium",
                stat.trendUp ? "text-[#22C55E]" : "text-[#FF4444]"
              )}>
                {stat.trend}
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1A1D1F]">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* First Row: Donut Chart and Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">Breakdown of user engagement levels</p>
          </CardHeader>
          <CardContent>
            <DonutChart data={userDistribution} />
            <div className="grid grid-cols-3 gap-4 mt-4">
              {userDistribution.map((item) => (
                <div key={item.name} className="text-center">
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-2xl font-bold" style={{ color: item.color }}>
                    {item.value}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Actionable Insights
            </CardTitle>
            <p className="text-sm text-muted-foreground">Recent alerts and notifications</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((notification, index) => (
              <NotificationCard
                key={index}
                title={notification.title}
                message={notification.message}
                type={notification.type}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Three Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Community Growth</CardTitle>
            <p className="text-sm text-muted-foreground">Member activity over time</p>
          </CardHeader>
          <CardContent>
            <AreaChart data={activityData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Member Changes</CardTitle>
            <p className="text-sm text-muted-foreground">New vs departing members</p>
          </CardHeader>
          <CardContent>
            <BarChart data={activityData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Live Messages</CardTitle>
            <p className="text-sm text-muted-foreground">Real-time message activity</p>
          </CardHeader>
          <CardContent>
            <LiveMessagesChart data={liveMessagesData} />
          </CardContent>
        </Card>
      </div>

      {/* Third Row: Sentiment Analysis and Members Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sentiment Analysis</CardTitle>
            <p className="text-sm text-muted-foreground">Community sentiment distribution</p>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={sentimentData}>
                  <XAxis dataKey="date" stroke={CHART_COLORS.muted} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={CHART_COLORS.muted} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                  />
                  <Bar dataKey="positive" stackId="a" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="neutral" stackId="a" fill={CHART_COLORS.muted} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="negative" stackId="a" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Members</CardTitle>
            <p className="text-sm text-muted-foreground">Latest community activity</p>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={memberData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
