"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { AlertCircle, Clock, Timer } from "lucide-react"

interface Question {
  id: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  domain: string
}

interface TestData {
  userId: number
  fullname: string
  questions: Question[]
}

const TIME_PER_QUESTION = 90
const TOTAL_EXAM_TIME = 150 * 60 // 150 minutes in seconds

export default function TestPage() {
  const [testData, setTestData] = useState<TestData | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [startTime] = useState(Date.now())
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION)
  const [isFrozen, setIsFrozen] = useState(false)
  const [examTimeLeft, setExamTimeLeft] = useState(TOTAL_EXAM_TIME)
  const router = useRouter()

  useEffect(() => {
    const data = sessionStorage.getItem("testData")
    if (!data) {
      router.push("/")
      return
    }
    setTestData(JSON.parse(data))
  }, [router])

  useEffect(() => {
    if (!testData) return

    const examTimer = setInterval(() => {
      setExamTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(examTimer)
  }, [testData])

  useEffect(() => {
    if (!testData || isFrozen) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsFrozen(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [testData, currentQuestion, isFrozen])

  if (!testData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading test...</p>
      </div>
    )
  }

  const question = testData.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / testData.questions.length) * 100
  const answeredCount = Object.keys(answers).length
  const timerProgress = (timeLeft / TIME_PER_QUESTION) * 100
  const examTimeProgress = (examTimeLeft / TOTAL_EXAM_TIME) * 100

  const handleAnswerChange = (value: string) => {
    if (isFrozen) return
    setAnswers({ ...answers, [question.id]: value })
  }

  const handleNext = () => {
    if (currentQuestion < testData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setTimeLeft(TIME_PER_QUESTION)
      setIsFrozen(false)
    }
  }

  const handleSubmit = async () => {
    if (answeredCount < testData.questions.length) {
      const confirm = window.confirm(
        `You have only answered ${answeredCount} out of ${testData.questions.length} questions. Submit anyway?`,
      )
      if (!confirm) return
    }

    setSubmitting(true)

    const timeTaken = Math.floor((Date.now() - startTime) / 1000)
    const formattedAnswers = Object.entries(answers).map(([questionId, userAnswer]) => ({
      questionId: Number.parseInt(questionId),
      userAnswer,
    }))

    try {
      const response = await fetch("/api/submit-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: testData.userId,
          answers: formattedAnswers,
          timeTaken,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        sessionStorage.setItem("testResult", JSON.stringify(result))
        sessionStorage.setItem("testAnswers", JSON.stringify(answers))
        router.push("/results")
      } else {
        alert(result.error || "Failed to submit test")
      }
    } catch (error) {
      console.error("[v0] Error submitting test:", error)
      alert("Failed to submit test")
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-8">
      <div className="fixed top-3 sm:top-4 right-3 sm:right-4 md:right-48 z-50">
        <div
          className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border bg-background/95 backdrop-blur-sm shadow-lg ${
            examTimeLeft <= 300 ? "border-destructive" : examTimeLeft <= 600 ? "border-yellow-500" : ""
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Timer
              className={`h-3 w-3 sm:h-4 sm:w-4 ${examTimeLeft <= 300 ? "text-destructive" : examTimeLeft <= 600 ? "text-yellow-500" : "text-muted-foreground"}`}
            />
            <span
              className={`text-xs sm:text-sm font-mono font-semibold ${examTimeLeft <= 300 ? "text-destructive" : examTimeLeft <= 600 ? "text-yellow-500" : ""}`}
            >
              {formatTime(examTimeLeft)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">ISC2 CC Practice Test</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Student: {testData.fullname}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs sm:text-sm font-medium">
              Question {currentQuestion + 1} of {testData.questions.length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Answered: {answeredCount}/{testData.questions.length}
            </p>
          </div>
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-2" />

        <Card className={isFrozen ? "border-destructive" : timeLeft <= 10 ? "border-yellow-500" : ""}>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-2">
              <div className="flex items-center gap-2">
                <Clock
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${isFrozen ? "text-destructive" : timeLeft <= 10 ? "text-yellow-500" : ""}`}
                />
                <span
                  className={`text-xl sm:text-2xl font-bold ${isFrozen ? "text-destructive" : timeLeft <= 10 ? "text-yellow-500" : ""}`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
              {isFrozen && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">Time's up! Click Next to continue</span>
                </div>
              )}
            </div>
            <Progress
              value={timerProgress}
              className={`h-1 ${isFrozen ? "bg-destructive/20" : timeLeft <= 10 ? "bg-yellow-500/20" : ""}`}
            />
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className={isFrozen ? "opacity-60" : ""}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
              <CardTitle className="text-base sm:text-lg leading-relaxed text-balance">
                {question.question_text}
              </CardTitle>
              <span className="text-xs font-medium px-2 py-1 bg-muted rounded-md whitespace-nowrap self-start">
                {question.domain}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[question.id] || ""}
              onValueChange={handleAnswerChange}
              className="space-y-3 sm:space-y-4"
              disabled={isFrozen}
            >
              {["A", "B", "C", "D"].map((option) => (
                <div
                  key={option}
                  className={`flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border transition-colors ${
                    isFrozen ? "cursor-not-allowed" : "hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem
                    value={option}
                    id={`option-${option}`}
                    className="mt-0.5 flex-shrink-0"
                    disabled={isFrozen}
                  />
                  <Label
                    htmlFor={`option-${option}`}
                    className={`flex-1 text-sm sm:text-base leading-relaxed ${isFrozen ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span className="font-semibold mr-2">{option}.</span>
                    {question[`option_${option.toLowerCase()}` as keyof Question]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 sm:gap-4 pb-4">
          {currentQuestion === testData.questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={submitting} size="lg" className="w-full sm:w-auto">
              {submitting ? "Submitting..." : "Submit Test"}
            </Button>
          ) : (
            <Button onClick={handleNext} size="lg" className="w-full sm:w-auto">
              Next Question
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
