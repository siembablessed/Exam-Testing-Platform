"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { CheckCircle2, XCircle, Clock, Award } from "lucide-react"

interface TestResult {
  testResultId: number
  score: number
  totalQuestions: number
  percentage: string
}

interface QuestionDetail {
  question_id: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  user_answer: string
  is_correct: boolean
  explanation: string
  domain: string
}

export default function ResultsPage() {
  const [result, setResult] = useState<TestResult | null>(null)
  const [showReview, setShowReview] = useState(false)
  const [answers, setAnswers] = useState<QuestionDetail[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const resultData = sessionStorage.getItem("testResult")
    if (!resultData) {
      router.push("/")
      return
    }
    setResult(JSON.parse(resultData))
  }, [router])

  const loadReview = async () => {
    if (!result) return

    setLoading(true)
    try {
      const response = await fetch(`/api/test-result/${result.testResultId}`)
      const data = await response.json()

      if (response.ok) {
        setAnswers(data.answers)
        setShowReview(true)
      } else {
        alert(data.error || "Failed to load review")
      }
    } catch (error) {
      console.error("[v0] Error loading review:", error)
      alert("Failed to load review")
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading results...</p>
      </div>
    )
  }

  const percentage = Number.parseFloat(result.percentage)
  const passed = percentage >= 70

  if (!showReview) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center space-y-3 sm:space-y-4">
            <div className="mx-auto">
              {passed ? (
                <Award className="w-16 h-16 sm:w-20 sm:h-20 text-green-600" />
              ) : (
                <Clock className="w-16 h-16 sm:w-20 sm:h-20 text-amber-600" />
              )}
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold">
              {passed ? "Congratulations!" : "Keep Practicing!"}
            </CardTitle>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              {passed ? "You passed the practice test!" : "You need 70% to pass. Review your answers and try again."}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Score Display */}
            <div className="text-center p-6 sm:p-8 bg-muted rounded-lg">
              <div className="text-5xl sm:text-6xl font-bold mb-2">{percentage.toFixed(0)}%</div>
              <p className="text-base sm:text-lg text-muted-foreground">
                {result.score} out of {result.totalQuestions} correct
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-muted rounded-lg text-center">
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-green-600" />
                <p className="text-xl sm:text-2xl font-bold">{result.score}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="p-3 sm:p-4 bg-muted rounded-lg text-center">
                <XCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-red-600" />
                <p className="text-xl sm:text-2xl font-bold">{result.totalQuestions - result.score}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Incorrect</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button onClick={loadReview} disabled={loading} className="w-full" size="lg">
                {loading ? "Loading..." : "Review Answers"}
              </Button>
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => router.push("/")}>
                  Take Another Test
                </Button>
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  View Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 print:hidden">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Answer Review</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Score: {result.score}/{result.totalQuestions} ({percentage.toFixed(1)}%)
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} size="sm" className="flex-1 sm:flex-none bg-transparent">
              <span className="hidden sm:inline">Print Review</span>
              <span className="sm:hidden">Print</span>
            </Button>
            <Button onClick={() => router.push("/")} size="sm" className="flex-1 sm:flex-none">
              New Test
            </Button>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block mb-8">
          <h1 className="text-3xl font-bold mb-2">ISC2 CC Practice Test Review</h1>
          <p className="text-lg">
            Score: {result.score}/{result.totalQuestions} ({percentage.toFixed(1)}%)
          </p>
        </div>

        {/* Questions Review */}
        <div className="space-y-4 sm:space-y-6">
          {answers.map((answer, idx) => (
            <Card
              key={answer.question_id}
              className={`${answer.is_correct ? "border-green-600/50" : "border-red-600/50"}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs sm:text-sm font-semibold">Question {idx + 1}</span>
                      <span className="text-xs px-2 py-1 bg-muted rounded">{answer.domain}</span>
                      {answer.is_correct ? (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                      )}
                    </div>
                    <CardTitle className="text-sm sm:text-base leading-relaxed">{answer.question_text}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {/* Options */}
                <div className="space-y-2">
                  {["A", "B", "C", "D"].map((option) => {
                    const isCorrect = option === answer.correct_answer
                    const isUserAnswer = option === answer.user_answer
                    const optionText = answer[`option_${option.toLowerCase()}` as keyof QuestionDetail]

                    return (
                      <div
                        key={option}
                        className={`p-2 sm:p-3 rounded-lg border text-sm ${
                          isCorrect
                            ? "bg-green-50 dark:bg-green-950/20 border-green-600"
                            : isUserAnswer
                              ? "bg-red-50 dark:bg-red-950/20 border-red-600"
                              : "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-semibold flex-shrink-0">{option}.</span>
                          <span className="flex-1">{optionText}</span>
                          {isCorrect && (
                            <span className="text-xs font-medium text-green-600 flex-shrink-0">Correct</span>
                          )}
                          {isUserAnswer && !isCorrect && (
                            <span className="text-xs font-medium text-red-600 flex-shrink-0">Your Answer</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Explanation */}
                {answer.explanation && (
                  <div className="p-3 sm:p-4 bg-muted rounded-lg">
                    <p className="text-xs sm:text-sm font-semibold mb-1">Explanation:</p>
                    <p className="text-xs sm:text-sm leading-relaxed">{answer.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 print:hidden pb-6 sm:pb-8">
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="w-full sm:w-auto">
            View Dashboard
          </Button>
          <Button onClick={() => router.push("/")} className="w-full sm:w-auto">
            Take Another Test
          </Button>
        </div>
      </div>
    </div>
  )
}
