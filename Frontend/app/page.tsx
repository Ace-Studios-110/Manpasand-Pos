"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function Home() {
  
  const [token, setToken] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    setToken(localStorage.getItem("token"))
    setChecking(false)
  }, [])

  const handleLogin = (jwt: string) => {
    localStorage.setItem("token", jwt)
    setToken(jwt)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setToken(null)
  }
    if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner  className="w-12 h-12"  />
      </div>
    )
  }
  if (!token) {
    return <LoginForm onLogin={handleLogin} />
  }

  return <Dashboard onLogout={handleLogout} />
}
