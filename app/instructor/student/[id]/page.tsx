"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { getAuthCookie } from "@/lib/auth"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, TrendingUp, AlertCircle, MessageSquare, CheckCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface StudentDetails {
  student: {
    id: number
    fullname: string
    email: string
    created_at: string
  }
  testResults: Array<{
    id: number
    score: number
    total_questions: number
    time_taken: number
    completed_at: string
  }>
  domainPerformance: Array<{
    domain: string
    total_questions: number
    correct_answers: number
    accuracy: number
  }>
  feedback: Array<{
    id: number
    feedback_text: string
    needs_reassessment: boolean
    created_at: string
    instructor_name: string
    test_score: number
  }>
}

export default function StudentDetailPage() {
  const [details, setDetails] = useState<StudentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [feedbackText, setFeedbackText] = useState("")
  const [needsReassessment, setNeedsReassessment] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [instructorId, setInstructorId] = useState<number | null>(null)
  const router = useRouter()
  const params = useParams()
  const studentId = params.id

  useEffect(() => {
    const auth = getAuthCookie()
    if (!auth) {
      router.push("/login")
      return
    }
    setInstructorId(auth.userId)
    fetchStudentDetails(auth.userId, studentId as string)
  }, [router, studentId])

  const fetchStudentDetails = async (instrId: number, studId: string) => {
    try {
      const response = await fetch(`/api/instructor/student-details?instructorId=${instrId}&studentId=${studId}`)
      const data = await response.json()

      if (response.ok) {
        setDetails(data)
      } else {
        alert(data.error || "Failed to fetch student details")
      }
    } catch (error) {
      console.error("[v0] Error fetching student details:", error)
      alert("Failed to fetch student details")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim() || !instructorId) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/instructor/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorId,
          studentId,
          feedbackText,
          needsReassessment,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Feedback submitted successfully!")
        setFeedbackText("")
        setNeedsReassessment(false)
        // Refresh details
        fetchStudentDetails(instructorId, studentId as string)
      } else {
        alert(data.error || "Failed to submit feedback")
      }
    } catch (error) {
      console.error("[v0] Error submitting feedback:", error)
      alert("Failed to submit feedback")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-12 w-48 skeleton rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 skeleton rounded-lg" />
            ))}
          </div>
          <div className="h-64 skeleton rounded-lg" />
        </div>
      </div>
    )
  }

  if (!details) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Student not found</p>
      </div>
    )
  }

  const avgScore = details.testResults.reduce((sum, test) => sum + test.score, 0) / (details.testResults.length || 1)
  const bestScore = Math.max(...details.testResults.map((t) => t.score), 0)
  const totalTests = details.testResults.length

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background -z-10" />

      <div className="max-w-7xl mx-auto space-y-6 animate-slide-in-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/instructor")} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold truncate">{details.student.fullname}</h1>
            <p className="text-muted-foreground truncate">{details.student.email}</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTests}</div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgScore.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Best Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{bestScore}%</div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Domain Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {details.domainPerformance.map((domain) => (
              <div key={domain.domain} className="space-y-2 p-3 rounded-lg hover:bg-accent/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{domain.domain}</span>
                  <span className="text-sm font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                    {domain.correct_answers}/{domain.total_questions} ({domain.accuracy}%)
                  </span>
                </div>
                <Progress value={Number(domain.accuracy)} className="h-2.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Test History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {details.testResults.map((test, index) => (
                <div
                  key={test.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-accent/30 transition-all duration-200 gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">Test #{test.id}</p>
                      <p className="text-sm text-muted-foreground">{new Date(test.completed_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${test.score >= 70 ? "text-green-500" : "text-red-500"}`}>
                        {test.score}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.floor(test.time_taken / 60)}m {test.time_taken % 60}s
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Add Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback Notes</Label>
              <Textarea
                id="feedback"
                placeholder="Enter your feedback for this student..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reassessment"
                checked={needsReassessment}
                onCheckedChange={(checked) => setNeedsReassessment(checked as boolean)}
              />
              <Label htmlFor="reassessment" className="flex items-center gap-2 cursor-pointer">
                <AlertCircle className="h-4 w-4 text-destructive" />
                Flag for reassessment
              </Label>
            </div>
            <Button onClick={handleSubmitFeedback} disabled={submitting || !feedbackText.trim()}>
              {submitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </CardContent>
        </Card>

        {/* Feedback History */}
        {details.feedback.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Feedback History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {details.feedback.map((fb) => (
                <div key={fb.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{fb.instructor_name}</p>
                      <p className="text-sm text-muted-foreground">{new Date(fb.created_at).toLocaleString()}</p>
                    </div>
                    {fb.needs_reassessment && (
                      <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs font-medium rounded flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Reassessment
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{fb.feedback_text}</p>
                  {fb.test_score && (
                    <p className="text-xs text-muted-foreground">Related to test score: {fb.test_score}%</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
