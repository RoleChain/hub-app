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

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: any
}

const CHART_COLORS = {
  primary: '#3B82F6',    // Lighter blue
  secondary: '#94A3B8',  // Soft slate
  danger: '#EF4444',     // Soft red
  success: '#10B981',    // Soft green
  background: '#F8FAFC', // Very light blue-gray
  text: '#334155',       // Slate-700
  muted: '#CBD5E1',      // Slate-300
  // Gradients
  primaryGradient: {
    start: 'rgba(59, 130, 246, 0.08)', // Very light blue
    end: 'rgba(59, 130, 246, 0)'
  }
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
            stroke={CHART_COLORS.primary}
            fill="url(#colorMessages)"
            strokeWidth={1.5}
          />
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
              className="hover:bg-muted/50 transition-colors"
            >
              {columns.map((column) => (
                <TableCell 
                  key={`${rowIndex}-${column.accessorKey}`}
                  className="font-medium"
                >
                  {column.accessorKey === 'status' ? (
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      row[column.accessorKey] === 'Active' 
                        ? "bg-blue-50 text-blue-600" 
                        : "bg-slate-50 text-slate-600"
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
    <div className="flex items-start space-x-4 p-4 rounded-lg bg-white border border-slate-200">
      {icons[type]}
      <div>
        <h4 className="font-medium text-slate-900">{title}</h4>
        <p className="text-sm text-slate-600">{message}</p>
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
    <div className="p-8 space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {communityStats.map((stat) => (
          <Card key={stat.label} className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.label}
              </CardTitle>
              <span className={cn(
                "text-xs font-medium",
                stat.trendUp ? "text-emerald-600" : "text-rose-500"
              )}>
                {stat.trend}
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-900">
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
