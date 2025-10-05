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
  const router = useRouter()

  useEffect(() => {
    const authData = getAuthCookie()
    if (!authData) {
      router.push("/login")
      return
    }
    setAuth(authData)
    fetchPerformance(authData.userId)
    fetchAssignments(authData.userId)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Performance Dashboard</h1>
            <p className="text-sm text-muted-foreground truncate">{auth.email}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/")} size="sm" className="flex-1 sm:flex-none">
              Take Test
            </Button>
            <Button variant="outline" onClick={handleLogout} size="sm" className="flex-1 sm:flex-none bg-transparent">
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Loading your performance data...
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Instructor Feedback */}
            {data && data.feedback && data.feedback.length > 0 && (
              <Card className="border-2 border-primary shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Instructor Feedback
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Important messages from your instructor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.feedback.map((fb) => (
                      <div
                        key={fb.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          fb.needs_reassessment
                            ? "bg-destructive/10 border-destructive shadow-md"
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
                        <p className="text-sm sm:text-base leading-relaxed mb-3">{fb.feedback_text}</p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t text-xs text-muted-foreground">
                          <span className="font-medium">From: {fb.instructor_email}</span>
                          <span>{formatDate(fb.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {assignments.length > 0 && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
                    Assigned Exams
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Exams assigned to you by your instructor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assignments.map((assignment) => (
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
                            <p className="text-xs text-muted-foreground mt-2">From: {assignment.instructor_name}</p>
                          </div>
                        </div>
                        {assignment.status !== "completed" && (
                          <Button size="sm" onClick={() => router.push("/")} className="mt-2">
                            Start Exam
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Tests</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{data.totalTests}</div>
                  <p className="text-xs text-muted-foreground">Practice tests completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Average Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{data.avgScore}%</div>
                  <p className="text-xs text-muted-foreground">
                    {Number.parseFloat(data.avgScore) >= 70 ? "Passing average" : "Keep practicing"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Best Score</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {data.results.length > 0
                      ? Math.max(...data.results.map((r) => Number.parseFloat(r.percentage))).toFixed(1)
                      : "0"}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">Highest test score</p>
                </CardContent>
              </Card>
            </div>

            {/* Domain Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Performance by Domain</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Your strengths and areas for improvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {data.domainPerformance.map((domain) => {
                    const percentage = Number.parseFloat(domain.percentage)
                    return (
                      <div key={domain.domain} className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
                          <span className="font-medium">{domain.domain}</span>
                          <span className="text-muted-foreground">
                            {domain.correct_answers}/{domain.total_questions} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
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

            {/* Test History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Test History</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Your recent practice test results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.results.map((result, idx) => {
                    const percentage = Number.parseFloat(result.percentage)
                    const passed = percentage >= 70

                    return (
                      <div
                        key={result.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="text-center flex-shrink-0">
                            <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                              Test {data.results.length - idx}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm sm:text-base font-medium">
                              {result.score}/{result.total_questions} correct
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              {formatDate(result.completed_at)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                          {result.time_taken && (
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                              {formatTime(result.time_taken)}
                            </div>
                          )}
                          <div
                            className={`text-base sm:text-lg font-bold ${passed ? "text-green-600" : "text-red-600"}`}
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
          </>
        )}
      </div>
    </div>
  )
}
