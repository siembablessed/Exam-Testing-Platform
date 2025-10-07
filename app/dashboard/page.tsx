"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import {
  TrendingUp,
  Award,
  Clock,
  Target,
  LogOut,
  MessageSquare,
  ClipboardList,
  Calendar,
  AlertCircle,
  User,
  ChevronDown,
  BarChart3,
  History,
  BookOpen,
} from "lucide-react"
import { getAuthCookie, clearAuthCookie } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"

interface TestResult {
  id: number
  score: number
  total_questions: number
  percentage: string
  time_taken: number
  completed_at: string
}

interface DomainPerformance {
  domain: string
  total_questions: number
  correct_answers: number
  percentage: string
}

interface Feedback {
  id: number
  feedback_text: string
  needs_reassessment: boolean
  created_at: string
  instructor_email: string
}

interface Assignment {
  id: number
  exam_name: string
  description: string
  total_questions: number
  passing_score: number
  due_date: string
  status: string
  created_at: string
  instructor_name: string
  instructor_email: string
}

interface PerformanceData {
  fullname: string
  totalTests: number
  avgScore: string
  results: TestResult[]
  domainPerformance: DomainPerformance[]
  feedback: Feedback[]
}

export default function DashboardPage() {
  const [auth, setAuth] = useState<{ userId: number; email: string } | null>(null)
  const [fullname, setFullname] = useState("")
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PerformanceData | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'history'>('overview')
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const authData = await getAuthCookie()
      if (!authData) {
        router.push("/login")
        return
      }
      setAuth(authData)
      fetchPerformance(authData.userId)
      fetchAssignments(authData.userId)
    }
    checkAuth()
  }, [router])

  const fetchPerformance = async (userId: number) => {
    setLoading(true)

    try {
      const response = await fetch("/api/user-performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      const result = await response.json()

      if (response.ok) {
        setData(result)
      }
    } catch (error) {
      console.error("[v0] Error fetching performance:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAssignments = async (userId: number) => {
    try {
      const response = await fetch(`/api/instructor/assign-exam?studentId=${userId}`)
      const data = await response.json()

      if (response.ok) {
        setAssignments(data.assignments)
      }
    } catch (error) {
      console.error("[v0] Error fetching assignments:", error)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullname.trim()) return

    setLoading(true)

    try {
      const response = await fetch("/api/user-performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname }),
      })

      const result = await response.json()

      if (response.ok) {
        setData(result)
      } else {
        alert(result.error || "User not found")
        setData(null)
      }
    } catch (error) {
      console.error("[v0] Error fetching performance:", error)
      alert("Failed to fetch performance data")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    clearAuthCookie()
    router.push("/")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  // Improved date formatting function with better error handling and performance
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date"
      }

      // Use more efficient formatting with better locale support
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric", 
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // Added 12-hour format for better readability
      }).format(date)
    } catch (error) {
      console.error("Date formatting error:", error)
      return "Invalid date"
    }
  }

  const getStatusBadge = (status: string, dueDate: string) => {
    const now = new Date()
    const due = dueDate ? new Date(dueDate) : null

    if (status === "completed") {
      return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Completed</Badge>
    }

    if (due && now > due && status !== "completed") {
      return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Overdue</Badge>
    }

    return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">Pending</Badge>
  }

  if (!auth) {
    return null
  }

  const urgentFeedback = data?.feedback?.filter(fb => fb.needs_reassessment) || []
  const pendingAssignments = assignments.filter(a => a.status !== "completed")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-8 h-8 text-primary" />
                <h1 className="text-xl font-bold">Dashboard</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button onClick={() => router.push("/")} size="sm" className="hidden sm:flex">
                Take Test
              </Button>
              
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium truncate max-w-32">{auth.email}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-background border rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b">
                      <p className="text-sm font-medium">{auth.email}</p>
                      <p className="text-xs text-muted-foreground">Student Account</p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => router.push("/")}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors sm:hidden"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Take Test</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Section */}
        {(urgentFeedback.length > 0 || pendingAssignments.length > 0) && (
          <div className="mb-8 space-y-4">
            {urgentFeedback.length > 0 && (
              <Card className="border-red-200 bg-red-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-red-800">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Attention Required</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    You have {urgentFeedback.length} feedback(s) requiring reassessment
                  </p>
                </CardContent>
              </Card>
            )}
            
            {pendingAssignments.length > 0 && (
              <Card className="border-amber-200 bg-amber-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-amber-800">
                    <ClipboardList className="w-5 h-5" />
                    <span className="font-semibold">Pending Assignments</span>
                  </div>
                  <p className="text-sm text-amber-700 mt-1">
                    You have {pendingAssignments.length} assignment(s) to complete
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your performance data...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="mb-8">
              <nav className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'overview' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Overview</span>
                </button>
                <button
                  onClick={() => setActiveTab('performance')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'performance' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>Performance</span>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'history' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>History</span>
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{data?.totalTests || 0}</div>
                      <p className="text-xs text-muted-foreground">Practice tests completed</p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{data?.avgScore || "0"}%</div>
                      <p className="text-xs text-muted-foreground">
                        {data && Number.parseFloat(data.avgScore) >= 70 ? "Passing average" : "Keep practicing"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Best Score</CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {data && data.results.length > 0
                          ? Math.max(...data.results.map((r) => Number.parseFloat(r.percentage))).toFixed(1)
                          : "0"}
                        %
                      </div>
                      <p className="text-xs text-muted-foreground">Highest test score</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Assignments */}
                {assignments.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="w-5 h-5" />
                        Assigned Exams
                      </CardTitle>
                      <CardDescription>
                        Exams assigned to you by your instructor
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {assignments.slice(0, 3).map((assignment) => (
                          <div key={assignment.id} className="p-4 rounded-lg border hover:bg-accent/30 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">{assignment.exam_name}</h3>
                                  {getStatusBadge(assignment.status, assignment.due_date)}
                                </div>
                                {assignment.description && (
                                  <p className="text-sm text-muted-foreground mb-2">{assignment.description}</p>
                                )}
                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                  <span>{assignment.total_questions} questions</span>
                                  <span>Passing: {assignment.passing_score}%</span>
                                  {assignment.due_date && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {assignment.status !== "completed" && (
                              <Button size="sm" onClick={() => router.push("/")} className="mt-2">
                                Start Exam
                              </Button>
                            )}
                          </div>
                        ))}
                        {assignments.length > 3 && (
                          <p className="text-sm text-muted-foreground text-center">
                            And {assignments.length - 3} more assignments...
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-8">
                {/* Instructor Feedback */}
                {data && data.feedback && data.feedback.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        Instructor Feedback
                      </CardTitle>
                      <CardDescription>
                        Important messages from your instructor
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {data.feedback.map((fb) => (
                          <div
                            key={fb.id}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              fb.needs_reassessment
                                ? "bg-destructive/10 border-destructive"
                                : "bg-card border-border hover:border-primary/50"
                            }`}
                          >
                            {fb.needs_reassessment && (
                              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-destructive/20">
                                <AlertCircle className="w-5 h-5 text-destructive" />
                                <span className="px-3 py-1 bg-destructive text-destructive-foreground text-sm font-semibold rounded-md">
                                  ⚠️ Reassessment Required
                                </span>
                              </div>
                            )}
                            <p className="text-sm leading-relaxed mb-3">{fb.feedback_text}</p>
                            <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
                              <span className="font-medium">From: {fb.instructor_email}</span>
                              <span>{formatDate(fb.created_at)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Domain Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance by Domain</CardTitle>
                    <CardDescription>
                      Your strengths and areas for improvement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {data?.domainPerformance.map((domain) => {
                        const percentage = Number.parseFloat(domain.percentage)
                        return (
                          <div key={domain.domain} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{domain.domain}</span>
                              <span className="text-sm text-muted-foreground">
                                {domain.correct_answers}/{domain.total_questions} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  percentage >= 70 ? "bg-green-600" : percentage >= 50 ? "bg-amber-600" : "bg-red-600"
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'history' && (
              <Card>
                <CardHeader>
                  <CardTitle>Test History</CardTitle>
                  <CardDescription>Your recent practice test results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.results.map((result, idx) => {
                      const percentage = Number.parseFloat(result.percentage)
                      const passed = percentage >= 70

                      return (
                        <div
                          key={result.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-center flex-shrink-0">
                              <div className="text-sm font-medium text-muted-foreground">
                                Test {(data?.results.length || 0) - idx}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">
                                {result.score}/{result.total_questions} correct
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(result.completed_at)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {result.time_taken && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                {formatTime(result.time_taken)}
                              </div>
                            )}
                            <div
                              className={`text-lg font-bold ${passed ? "text-green-600" : "text-red-600"}`}
                            >
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Click outside to close profile menu */}
      {showProfileMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </div>
  )
}
