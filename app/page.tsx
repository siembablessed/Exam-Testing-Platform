"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { getAuthCookie, clearAuthCookie } from "@/lib/auth"
import { 
  LogOut, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  ArrowRight,
  CheckCircle
} from "lucide-react"

interface AuthData {
  userId: number
  email: string
  role: string
}

interface AuthState {
  data: AuthData | null
  loading: boolean
  error: string | null
}

export default function HomePage() {
  const [authState, setAuthState] = useState<AuthState>({
    data: null,
    loading: true,
    error: null
  })
  const [testLoading, setTestLoading] = useState(false)
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      const authData = await getAuthCookie()
      setAuthState({
        data: authData,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Authentication check failed:', error)
      setAuthState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check authentication'
      })
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleStartTest = useCallback(async () => {
    try {
      setTestLoading(true)
      router.push("/rules")
    } catch (error) {
      console.error('Failed to start test:', error)
    } finally {
      setTestLoading(false)
    }
  }, [router])

  const handleLogout = useCallback(async () => {
    try {
      clearAuthCookie()
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
      window.location.reload()
    }
  }, [router])

  const userInitial = useMemo(() => 
    authState.data?.email?.charAt(0).toUpperCase() || '?', 
    [authState.data?.email]
  )

  const isInstructor = useMemo(() => 
    authState.data?.role === "instructor", 
    [authState.data?.role]
  )

  if (authState.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Auth Header */}
          {authState.data && (
            <div className="mb-8">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">{userInitial}</span>
                    </div>
                    <div>
                      <p className="font-semibold">Welcome back!</p>
                      <p className="text-sm text-muted-foreground">{authState.data.email}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Hero Section */}
          <div className="text-center mb-12 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Award className="w-4 h-4" />
              ISC2 Certified in Cybersecurity
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold">
              Master your exam with <span className="text-primary">confidence</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Practice with real exam-style questions and track your progress toward certification success.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Target className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">100</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Clock className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">150</div>
              <div className="text-sm text-muted-foreground">Minutes</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">5</div>
              <div className="text-sm text-muted-foreground">Domains</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">90s</div>
              <div className="text-sm text-muted-foreground">Per Question</div>
            </div>
          </div>

          {/* Main Action Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to practice?</CardTitle>
              <CardDescription className="text-base">
                Take a full-length practice test covering all ISC2 CC domains
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {!isInstructor && (
                <>
                  {/* Simple Features List */}
                  <div className="space-y-3 mb-6">
                    {[
                      "100 randomly selected questions",
                      "Detailed explanations for every answer",
                      "Performance analytics and progress tracking"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {authState.data ? (
                    <div className="space-y-3">
                      <Button 
                        onClick={handleStartTest} 
                        className="w-full h-12 text-lg" 
                        disabled={testLoading}
                      >
                        {testLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Preparing...
                          </>
                        ) : (
                          <>
                            Start Practice Test
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => router.push("/dashboard")} 
                        className="w-full h-10"
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        View Progress
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-center text-muted-foreground">
                        Create an account to start practicing
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Button onClick={() => router.push("/login")}>
                          Login
                        </Button>
                        <Button onClick={() => router.push("/register")} variant="outline">
                          Register
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {isInstructor && (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-6 h-6 text-primary" />
                      <div>
                        <p className="font-bold">Instructor Dashboard</p>
                        <p className="text-sm text-muted-foreground">
                          Monitor student performance and provide feedback
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => router.push("/instructor")} 
                    className="w-full h-12"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Open Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Display */}
      {authState.error && (
        <div className="fixed bottom-4 right-4 p-3 bg-red-50 border border-red-200 rounded-lg shadow-lg">
          <p className="text-red-600 text-sm">{authState.error}</p>
          <Button variant="ghost" size="sm" onClick={checkAuth} className="mt-1 text-red-600">
            Retry
          </Button>
        </div>
      )}
    </div>
  )
}
