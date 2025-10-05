"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { getAuthCookie } from "@/lib/auth"
import { AlertCircle, Clock, FileText, CheckCircle } from "lucide-react"

export default function RulesPage() {
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [auth, setAuth] = useState<{ userId: number; email: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const authData = getAuthCookie()
    if (!authData) {
      router.push("/login")
      return
    }
    setAuth(authData)
  }, [router])

  const handleStartTest = async () => {
    if (!agreed || !auth) return

    setLoading(true)

    try {
      const response = await fetch("/api/start-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: auth.userId }),
      })

      const data = await response.json()

      if (response.ok) {
        sessionStorage.setItem("testData", JSON.stringify(data))
        router.push("/test")
      } else {
        alert(data.error || "Failed to start test")
      }
    } catch (error) {
      console.error("[v0] Error:", error)
      alert("Failed to start test")
    } finally {
      setLoading(false)
    }
  }

  if (!auth) {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Exam Rules & Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Time Limits */}
            <div className="space-y-3">
              <div className="flex items-start gap-2 sm:gap-3">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Time Limits</h3>
                  <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 mt-2">
                    <li>• Total exam time: 150 minutes (2.5 hours)</li>
                    <li>• Time per question: 90 seconds</li>
                    <li>• When question time expires, you must move to the next question</li>
                    <li>• When total time expires, the exam will auto-submit</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Exam Format */}
            <div className="space-y-3">
              <div className="flex items-start gap-2 sm:gap-3">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Exam Format</h3>
                  <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 mt-2">
                    <li>• 100 multiple choice questions</li>
                    <li>• Questions are randomly selected from a pool of 300+</li>
                    <li>• All questions have 4 answer options (A, B, C, D)</li>
                    <li>• Questions must be answered sequentially - no skipping</li>
                    <li>• You cannot go back to previous questions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Scoring */}
            <div className="space-y-3">
              <div className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Scoring</h3>
                  <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 mt-2">
                    <li>• Passing score: 70% (70 out of 100 questions)</li>
                    <li>• Each question is worth 1 point</li>
                    <li>• Unanswered questions are marked as incorrect</li>
                    <li>• Results are shown immediately after submission</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="space-y-3">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Important Notes</h3>
                  <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 mt-2">
                    <li>• Ensure stable internet connection throughout the exam</li>
                    <li>• Do not refresh or close the browser during the exam</li>
                    <li>• Your progress is automatically saved</li>
                    <li>• After completion, you can review all questions and answers</li>
                    <li>• Your instructor may provide feedback on your performance</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Domains Covered */}
            <div className="p-3 sm:p-4 bg-muted rounded-lg">
              <h3 className="font-semibold text-sm sm:text-base mb-2">ISC2 CC Domains Covered</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-muted-foreground">
                <div>• Security Principles</div>
                <div>• Business Continuity</div>
                <div>• Access Control</div>
                <div>• Network Security</div>
                <div>• Incident Response</div>
                <div>• Security Operations</div>
                <div>• Risk Management</div>
                <div>• Cryptography</div>
              </div>
            </div>

            {/* Agreement */}
            <div className="border-t pt-4 sm:pt-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <Checkbox
                  id="agree"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked === true)}
                  className="mt-0.5"
                />
                <label htmlFor="agree" className="text-xs sm:text-sm cursor-pointer">
                  I have read and understood the exam rules and instructions. I agree to follow all guidelines and
                  understand that the exam will be timed and questions must be answered sequentially.
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={() => router.push("/")} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleStartTest} disabled={!agreed || loading} className="flex-1">
                {loading ? "Starting..." : "Start Exam"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
