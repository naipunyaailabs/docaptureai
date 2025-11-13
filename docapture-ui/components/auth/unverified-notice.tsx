"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { MailCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function UnverifiedNotice() {
  const { user, sendVerificationEmail, logout } = useAuth()
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const handleResend = async () => {
    setIsSending(true)
    const success = await sendVerificationEmail()
    if (success) {
      toast({
        title: "Email Sent",
        description: "A new verification link has been sent to your email address.",
      })
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send verification email. Please try again.",
      })
    }
    setIsSending(false)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-background p-4 text-center">
      <div className="max-w-md">
        <MailCheck className="mx-auto h-16 w-16 text-cyan-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Verify Your Email Address</h1>
        <p className="text-muted-foreground mb-4">
          To complete your registration and access your dashboard, please check your inbox and follow the verification
          link we've sent to <span className="font-medium text-foreground">{user?.email}</span>.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={handleResend} disabled={isSending} className="w-full sm:w-auto">
            {isSending ? "Sending..." : "Resend Verification Email"}
          </Button>
          <Button variant="outline" onClick={logout} className="w-full sm:w-auto">
            Log Out
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          Can't find the email? Be sure to check your spam or junk folder.
        </p>
      </div>
    </div>
  )
}
