"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { calculatePasswordStrength, setAuthCookie } from "@/lib/auth"
import Link from "next/link"
import { CheckCircle2, XCircle } from "lucide-react"

export default function RegisterPage() {
  const [fullname, setFullname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const passwordStrength = password ? calculatePasswordStrength(password) : null

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordStrength && passwordStrength.strength === "weak") {
      alert("Please use a stronger password")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setAuthCookie(data.user.id, data.user.email, data.user.role)
        router.push("/dashboard")
      } else {
        alert(data.error || "Registration failed")
      }
    } catch (error) {
      console.error("[v0] Registration error:", error)
      alert("Failed to register")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background -z-10" />

      <Card className="w-full max-w-md relative">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Register</CardTitle>
          <CardDescription>Create an account to track your progress</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullname" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="fullname"
                type="text"
                placeholder="John Doe"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* Password Strength Indicator */}
              {password && passwordStrength && (
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          passwordStrength.strength === "strong"
                            ? "bg-green-600"
                            : passwordStrength.strength === "medium"
                              ? "bg-amber-600"
                              : "bg-red-600"
                        }`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        passwordStrength.strength === "strong"
                          ? "text-green-600"
                          : passwordStrength.strength === "medium"
                            ? "text-amber-600"
                            : "text-red-600"
                      }`}
                    >
                      {passwordStrength.strength.toUpperCase()}
                    </span>
                  </div>

                  {passwordStrength.feedback.length > 0 && (
                    <div className="space-y-1">
                      {passwordStrength.feedback.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <XCircle className="w-3 h-3" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {passwordStrength.strength !== "weak" && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Password meets requirements</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
