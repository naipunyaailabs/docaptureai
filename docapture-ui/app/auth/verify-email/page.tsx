"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

function VerificationContent() {
  const searchParams = useSearchParams()
  const userId = searchParams.get("userId")
  const secret = searchParams.get("secret")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId || !secret) {
      setStatus("error")
      setError("Missing verification details. Please use the link from your email.")
      return
    }

    const verify = async () => {
      const response = await apiService.confirmVerification(userId, secret)
      if (response.success) {
        setStatus("success")
      } else {
        setStatus("error")
        setError(response.error || "Verification failed. The link may be expired or invalid.")
      }
    }

    verify()
  }, [userId, secret])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            {status === "loading" && "Verifying your account, please wait..."}
            {status === "success" && "Your account has been successfully verified."}
            {status === "error" && "An error occurred during verification."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {status === "loading" && <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />}
          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <p className="mb-6">You can now log in to access your dashboard.</p>
              <Button asChild className="w-full">
                <Link href="/auth/login">Proceed to Login</Link>
              </Button>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-red-500 mb-4" />
              <p className="mb-6 text-red-600 dark:text-red-500">{error}</p>
              <Button asChild className="w-full">
                <Link href="/auth/login">Back to Login</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerificationContent />
    </Suspense>
  )
}
