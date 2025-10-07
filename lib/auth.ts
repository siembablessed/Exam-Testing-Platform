export async function hashPassword(password: string): Promise<string> {
  // Simple hash using Web Crypto API
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

export function calculatePasswordStrength(password: string): {
  strength: "weak" | "medium" | "strong"
  score: number
  feedback: string[]
} {
  let score = 0
  const feedback: string[] = []

  // Length check
  if (password.length >= 8) score += 25
  else feedback.push("Use at least 8 characters")

  if (password.length >= 12) score += 15

  // Complexity checks
  if (/[a-z]/.test(password)) score += 15
  else feedback.push("Add lowercase letters")

  if (/[A-Z]/.test(password)) score += 15
  else feedback.push("Add uppercase letters")

  if (/[0-9]/.test(password)) score += 15
  else feedback.push("Add numbers")

  if (/[^a-zA-Z0-9]/.test(password)) score += 15
  else feedback.push("Add special characters")

  let strength: "weak" | "medium" | "strong" = "weak"
  if (score >= 70) strength = "strong"
  else if (score >= 50) strength = "medium"

  return { strength, score, feedback }
}

import { getElectronAppMode } from "./isElectron"

export async function setAuthCookie(userId: number, email: string, role = "student") {
  // Override role if running in Electron instructor mode
  const electronMode = await getElectronAppMode()
  const finalRole = electronMode === 'instructor' ? 'instructor' : role
  
  const authData = JSON.stringify({ userId, email, role: finalRole })
  document.cookie = `auth=${btoa(authData)}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
}

export async function getAuthCookie(): Promise<{ userId: number; email: string; role: string } | null> {
  if (typeof document === "undefined") return null

  const cookies = document.cookie.split("; ")
  const authCookie = cookies.find((c) => c.startsWith("auth="))

  if (!authCookie) return null

  try {
    const authData = JSON.parse(atob(authCookie.split("=")[1]))
    
    // Override role if running in Electron instructor mode
    const electronMode = await getElectronAppMode()
    if (electronMode === 'instructor') {
      authData.role = 'instructor'
    }
    
    return authData
  } catch {
    return null
  }
}

// Synchronous version for backward compatibility
export function getAuthCookieSync(): { userId: number; email: string; role: string } | null {
  if (typeof document === "undefined") return null

  const cookies = document.cookie.split("; ")
  const authCookie = cookies.find((c) => c.startsWith("auth="))

  if (!authCookie) return null

  try {
    const authData = JSON.parse(atob(authCookie.split("=")[1]))
    return authData
  } catch {
    return null
  }
}

export function clearAuthCookie() {
  document.cookie = "auth=; path=/; max-age=0"
}
