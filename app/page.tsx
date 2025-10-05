"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { getAuthCookie, clearAuthCookie } from "@/lib/auth"
import { LogOut, BookOpen, TrendingUp, Clock, Target, Award } from "lucide-react"

export default function HomePage() {
  const [auth, setAuth] = useState<{ userId: number; email: string; role: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const authData = getAuthCookie()
    setAuth(authData)
  }, [])

  const handleStartTest = () => {
    router.push("/rules")
  }

  const handleLogout = () => {
    clearAuthCookie()
    router.push("/")
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
        <div className="relative">
          <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
            <div className="max-w-4xl mx-auto">
              {auth && (
                <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-4 bg-card/50 backdrop-blur-sm border border-border rounded-lg animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">{auth.email.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Welcome back!</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-none">{auth.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              )}

              <div className="text-center mb-8 sm:mb-12 space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                  ISC2 Certified in Cybersecurity
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight px-2">
                  Master your exam with <span className="text-primary">confidence</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                  Practice with real exam-style questions. Track your progress. Achieve certification success.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
                <div className="p-3 sm:p-4 rounded-lg bg-card border border-border text-center">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-primary" />
                  <div className="text-xl sm:text-2xl font-bold">100</div>
                  <div className="text-xs text-muted-foreground">Questions</div>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-card border border-border text-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-accent" />
                  <div className="text-xl sm:text-2xl font-bold">150</div>
                  <div className="text-xs text-muted-foreground">Minutes</div>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-card border border-border text-center">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-primary" />
                  <div className="text-xl sm:text-2xl font-bold">5</div>
                  <div className="text-xs text-muted-foreground">Domains</div>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-card border border-border text-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-accent" />
                  <div className="text-xl sm:text-2xl font-bold">90s</div>
                  <div className="text-xs text-muted-foreground">Per Question</div>
                </div>
              </div>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl">Ready to practice?</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Take a full-length practice test covering all ISC2 CC domains
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {auth?.role !== "instructor" && (
                    <>
                      <div className="space-y-3 p-3 sm:p-4 bg-muted/50 rounded-lg mb-4 sm:mb-6">
                        <h3 className="font-semibold text-xs sm:text-sm">What's included:</h3>
                        <ul className="text-xs sm:text-sm space-y-2 text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
                            <span>100 randomly selected questions from all domains</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
                            <span>Timed test with 90 seconds per question</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
                            <span>Detailed explanations for every answer</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
                            <span>Performance analytics and progress tracking</span>
                          </li>
                        </ul>
                      </div>

                      {auth ? (
                        <div className="space-y-3">
                          <Button onClick={handleStartTest} className="w-full" size="lg" disabled={loading}>
                            {loading ? "Starting..." : "Start Practice Test"}
                          </Button>
                          <Button variant="outline" onClick={() => router.push("/dashboard")} className="w-full">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            View Your Progress
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-xs sm:text-sm text-center text-muted-foreground">
                            Create an account to start practicing and track your progress
                          </p>
                          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
                            <Button onClick={() => router.push("/login")} variant="default" size="lg">
                              Login
                            </Button>
                            <Button onClick={() => router.push("/register")} variant="outline" size="lg">
                              Register
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {auth?.role === "instructor" && (
                    <div className="space-y-4">
                      <div className="p-3 sm:p-4 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex items-start gap-3">
                          <BookOpen className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-xs sm:text-sm">Instructor Dashboard</p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                              Monitor student performance, provide feedback, and track progress across all learners.
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => router.push("/instructor")} className="w-full" size="lg">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Open Instructor Dashboard
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Why practice with us?</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <Target className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-base sm:text-lg">Exam-Ready Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Practice with questions that mirror the actual ISC2 CC exam format and difficulty level.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-accent mb-2" />
                <CardTitle className="text-base sm:text-lg">Track Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Monitor your performance over time with detailed analytics and domain-specific insights.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <BookOpen className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-base sm:text-lg">Learn from Mistakes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Review detailed explanations for every question to understand concepts thoroughly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
