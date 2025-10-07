"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAuthCookie, clearAuthCookie } from "@/lib/auth"
import { useRouter } from "next/navigation"
import {
  Search,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Users,
  Award,
  Clock,
  LogOut,
  Plus,
  ClipboardList,
  Filter,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Student {
  id: number
  fullname: string
  email: string
  created_at: string
  total_tests: number
  avg_score: number
  best_score: number
  lowest_score: number
  last_test_date: string
  needs_reassessment: boolean
}

export default function InstructorDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [instructorId, setInstructorId] = useState<number | null>(null)
  const [lastActivity, setLastActivity] = useState(Date.now())

  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [examName, setExamName] = useState("")
  const [examDescription, setExamDescription] = useState("")
  const [totalQuestions, setTotalQuestions] = useState("100")
  const [passingScore, setPassingScore] = useState("70")
  const [dueDate, setDueDate] = useState("")
  const [assigning, setAssigning] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await getAuthCookie()
      if (!auth || auth.role !== "instructor") {
        router.push("/login")
        return
      }
      setInstructorId(auth.userId)
      fetchStudents(auth.userId)
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    const handleActivity = () => setLastActivity(Date.now())

    // Track user activity
    window.addEventListener("mousemove", handleActivity)
    window.addEventListener("keydown", handleActivity)
    window.addEventListener("click", handleActivity)
    window.addEventListener("scroll", handleActivity)

    // Check inactivity every minute
    const inactivityCheck = setInterval(() => {
      const inactiveTime = Date.now() - lastActivity
      const thirtyMinutes = 30 * 60 * 1000

      if (inactiveTime > thirtyMinutes) {
        handleLogout()
      }
    }, 60000) // Check every minute

    return () => {
      window.removeEventListener("mousemove", handleActivity)
      window.removeEventListener("keydown", handleActivity)
      window.removeEventListener("click", handleActivity)
      window.removeEventListener("scroll", handleActivity)
      clearInterval(inactivityCheck)
    }
  }, [lastActivity])

  const fetchStudents = async (id: number) => {
    try {
      const response = await fetch(`/api/instructor/students?instructorId=${id}`)
      const data = await response.json()

      if (response.ok) {
        setStudents(data.students)
        setFilteredStudents(data.students)
      } else {
        alert(data.error || "Failed to fetch students")
      }
    } catch (error) {
      console.error("[v0] Error fetching students:", error)
      alert("Failed to fetch students")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    clearAuthCookie()
    router.push("/")
  }

  useEffect(() => {
    let filtered = students.filter(
      (student) =>
        student.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    if (filterStatus === "needs_reassessment") {
      filtered = filtered.filter((s) => s.needs_reassessment)
    } else if (filterStatus === "high_performers") {
      filtered = filtered.filter((s) => s.avg_score >= 80)
    } else if (filterStatus === "needs_improvement") {
      filtered = filtered.filter((s) => s.avg_score < 70 && s.total_tests > 0)
    } else if (filterStatus === "no_tests") {
      filtered = filtered.filter((s) => s.total_tests === 0)
    }

    setFilteredStudents(filtered)
  }, [searchQuery, students, filterStatus])

  const handleAssignExam = async () => {
    if (!examName.trim() || selectedStudents.length === 0 || !instructorId) {
      alert("Please fill in exam name and select at least one student")
      return
    }

    setAssigning(true)
    try {
      const response = await fetch("/api/instructor/assign-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorId,
          studentIds: selectedStudents,
          examName,
          description: examDescription,
          totalQuestions: Number.parseInt(totalQuestions),
          passingScore: Number.parseInt(passingScore),
          dueDate: dueDate || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Exam assigned to ${selectedStudents.length} student(s) successfully!`)
        setAssignDialogOpen(false)
        setSelectedStudents([])
        setExamName("")
        setExamDescription("")
        setTotalQuestions("100")
        setPassingScore("70")
        setDueDate("")
      } else {
        alert(data.error || "Failed to assign exam")
      }
    } catch (error) {
      console.error("[v0] Error assigning exam:", error)
      alert("Failed to assign exam")
    } finally {
      setAssigning(false)
    }
  }

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )
  }

  const selectAllFiltered = () => {
    const allIds = filteredStudents.map((s) => s.id)
    setSelectedStudents(allIds)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-3 sm:p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-12 w-48 skeleton rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 skeleton rounded-lg" />
            ))}
          </div>
          <div className="h-64 skeleton rounded-lg" />
        </div>
      </div>
    )
  }

  const totalStudents = students.length
  const studentsWithTests = students.filter((s) => s.total_tests > 0).length
  const avgClassScore = students.reduce((sum, s) => sum + (Number(s.avg_score) || 0), 0) / (studentsWithTests || 1)
  const needsReassessment = students.filter((s) => s.needs_reassessment).length

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-8 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background -z-10" />

      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-slide-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Instructor Dashboard</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Monitor student performance and provide feedback</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex-1 sm:flex-none">
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Assign Exam</span>
                  <span className="sm:hidden">Assign</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Assign Exam to Students</DialogTitle>
                  <DialogDescription>Create and assign a new exam to selected students</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="exam-name">Exam Name *</Label>
                    <Input
                      id="exam-name"
                      placeholder="e.g., ISC2 CC Practice Test #1"
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exam-description">Description</Label>
                    <Textarea
                      id="exam-description"
                      placeholder="Optional description or instructions for students"
                      value={examDescription}
                      onChange={(e) => setExamDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="total-questions">Total Questions</Label>
                      <Input
                        id="total-questions"
                        type="number"
                        value={totalQuestions}
                        onChange={(e) => setTotalQuestions(e.target.value)}
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passing-score">Passing Score (%)</Label>
                      <Input
                        id="passing-score"
                        type="number"
                        value={passingScore}
                        onChange={(e) => setPassingScore(e.target.value)}
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due-date">Due Date (Optional)</Label>
                    <Input
                      id="due-date"
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Select Students *</Label>
                      <Button variant="outline" size="sm" onClick={selectAllFiltered} type="button">
                        Select All ({filteredStudents.length})
                      </Button>
                    </div>
                    <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                      {filteredStudents.map((student) => (
                        <div key={student.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`student-${student.id}`}
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={() => toggleStudentSelection(student.id)}
                          />
                          <Label htmlFor={`student-${student.id}`} className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <span>{student.fullname}</span>
                              <span className="text-xs text-muted-foreground">{student.email}</span>
                            </div>
                          </Label>
                        </div>
                      ))}
                      {filteredStudents.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No students available</p>
                      )}
                    </div>
                    {selectedStudents.length > 0 && (
                      <p className="text-sm text-muted-foreground">{selectedStudents.length} student(s) selected</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAssignDialogOpen(false)} disabled={assigning}>
                    Cancel
                  </Button>
                  <Button onClick={handleAssignExam} disabled={assigning}>
                    {assigning ? "Assigning..." : "Assign Exam"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/instructor/assignments")}
              className="flex-1 sm:flex-none"
            >
              <ClipboardList className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Assignments</span>
            </Button>
            <Button variant="outline" onClick={() => router.push("/")} size="sm" className="flex-1 sm:flex-none">
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </Button>
            <Button variant="outline" onClick={handleLogout} size="sm" className="flex-1 sm:flex-none bg-transparent">
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Students</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">{studentsWithTests} have taken tests</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Class Average</CardTitle>
              <Award className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{avgClassScore.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Across all tests</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Needs Reassessment</CardTitle>
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-destructive">{needsReassessment}</div>
              <p className="text-xs text-muted-foreground">Students flagged</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Active This Week</CardTitle>
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {
                  students.filter((s) => {
                    if (!s.last_test_date) return false
                    const lastTest = new Date(s.last_test_date)
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return lastTest > weekAgo
                  }).length
                }
              </div>
              <p className="text-xs text-muted-foreground">Tests taken</p>
            </CardContent>
          </Card>
        </div>

        <Card className="card-hover border-primary/20">
          <CardContent className="pt-4 sm:pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
                <Input
                  placeholder="Search students by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm border-primary/20 focus:border-primary"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="needs_reassessment">Needs Reassessment</SelectItem>
                  <SelectItem value="high_performers">High Performers (≥80%)</SelectItem>
                  <SelectItem value="needs_improvement">Needs Improvement (&lt;70%)</SelectItem>
                  <SelectItem value="no_tests">No Tests Taken</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {filterStatus !== "all" && (
              <p className="text-sm text-muted-foreground">
                Showing {filteredStudents.length} of {students.length} students
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3 sm:space-y-4">
          {filteredStudents.map((student) => (
            <Card
              key={student.id}
              className={`card-hover cursor-pointer transition-all duration-200 ${student.needs_reassessment ? "border-destructive/50 bg-destructive/5" : "hover:border-primary/50"}`}
              onClick={() => router.push(`/instructor/student/${student.id}`)}
            >
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex flex-col gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3 className="font-semibold text-base sm:text-lg">{student.fullname}</h3>
                      {student.needs_reassessment && (
                        <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs font-medium rounded self-start flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Needs Reassessment
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{student.email}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 text-center">
                    <div className="p-2 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors">
                      <p className="text-xl sm:text-2xl font-bold">{student.total_tests}</p>
                      <p className="text-xs text-muted-foreground">Tests</p>
                    </div>
                    <div className="p-2 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors">
                      <p className="text-xl sm:text-2xl font-bold">
                        {student.avg_score ? `${student.avg_score}%` : "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">Average</p>
                    </div>
                    <div className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors">
                      <div className="flex items-center justify-center gap-1">
                        <p className="text-xl sm:text-2xl font-bold text-green-600">
                          {student.best_score ? `${student.best_score}%` : "N/A"}
                        </p>
                        {student.best_score && <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />}
                      </div>
                      <p className="text-xs text-muted-foreground">Best</p>
                    </div>
                    <div className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors">
                      <div className="flex items-center justify-center gap-1">
                        <p className="text-xl sm:text-2xl font-bold text-red-600">
                          {student.lowest_score ? `${student.lowest_score}%` : "N/A"}
                        </p>
                        {student.lowest_score && <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />}
                      </div>
                      <p className="text-xs text-muted-foreground">Lowest</p>
                    </div>
                  </div>
                </div>

                {student.last_test_date && (
                  <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last test: {new Date(student.last_test_date).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredStudents.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center text-sm text-muted-foreground">
                <p>No students found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
