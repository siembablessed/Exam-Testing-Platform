"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAuthCookie } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, CheckCircle, Clock, AlertCircle, Trash2, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Assignment {
  id: number
  student_id: number
  student_name: string
  student_email: string
  exam_name: string
  description: string
  total_questions: number
  passing_score: number
  due_date: string
  status: string
  created_at: string
  completed_at: string
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [instructorId, setInstructorId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await getAuthCookie()
      if (!auth || auth.role !== "instructor") {
        router.push("/login")
        return
      }
      setInstructorId(auth.userId)
      fetchAssignments(auth.userId)
    }
    checkAuth()
  }, [router])

  const fetchAssignments = async (id: number) => {
    try {
      const response = await fetch(`/api/instructor/assign-exam?instructorId=${id}`)
      const data = await response.json()

      if (response.ok) {
        setAssignments(data.assignments)
      } else {
        alert(data.error || "Failed to fetch assignments")
      }
    } catch (error) {
      console.error("[v0] Error fetching assignments:", error)
      alert("Failed to fetch assignments")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAssignment = async (assignmentId: number) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return

    try {
      const response = await fetch(`/api/instructor/update-assignment?assignmentId=${assignmentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setAssignments((prev) => prev.filter((a) => a.id !== assignmentId))
        alert("Assignment deleted successfully")
      } else {
        alert("Failed to delete assignment")
      }
    } catch (error) {
      console.error("[v0] Error deleting assignment:", error)
      alert("Failed to delete assignment")
    }
  }

  const getStatusBadge = (status: string, dueDate: string) => {
    const now = new Date()
    const due = dueDate ? new Date(dueDate) : null

    if (status === "completed") {
      return (
        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      )
    }

    if (due && now > due && status !== "completed") {
      return (
        <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">
          <AlertCircle className="w-3 h-3 mr-1" />
          Overdue
        </Badge>
      )
    }

    if (status === "in_progress") {
      return (
        <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
          <Clock className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      )
    }

    return (
      <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-12 w-48 skeleton rounded-lg" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 skeleton rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const groupedAssignments = assignments.reduce(
    (acc, assignment) => {
      if (!acc[assignment.exam_name]) {
        acc[assignment.exam_name] = []
      }
      acc[assignment.exam_name].push(assignment)
      return acc
    },
    {} as Record<string, Assignment[]>,
  )

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background -z-10" />

      <div className="max-w-7xl mx-auto space-y-6 animate-slide-in-up">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/instructor")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Exam Assignments</h1>
            <p className="text-muted-foreground">Manage and track student exam assignments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {assignments.filter((a) => a.status === "completed").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">
                {assignments.filter((a) => a.status === "pending").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {Object.keys(groupedAssignments).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No exam assignments yet</p>
              <Button onClick={() => router.push("/instructor")}>Create Assignment</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedAssignments).map(([examName, examAssignments]) => (
              <Card key={examName} className="card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{examName}</CardTitle>
                      {examAssignments[0].description && (
                        <p className="text-sm text-muted-foreground mt-1">{examAssignments[0].description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {examAssignments.length} student(s)
                        </span>
                        <span>{examAssignments[0].total_questions} questions</span>
                        <span>Passing: {examAssignments[0].passing_score}%</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {examAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/30 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{assignment.student_name}</p>
                            {getStatusBadge(assignment.status, assignment.due_date)}
                          </div>
                          <p className="text-sm text-muted-foreground">{assignment.student_email}</p>
                          {assignment.due_date && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due: {new Date(assignment.due_date).toLocaleString()}
                            </p>
                          )}
                          {assignment.completed_at && (
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Completed: {new Date(assignment.completed_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
