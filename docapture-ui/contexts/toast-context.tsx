"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

interface ToastContextType {
  showSuccess: (message: string, description?: string) => void
  showError: (message: string, description?: string) => void
  showWarning: (message: string, description?: string) => void
  showInfo: (message: string, description?: string) => void
}

const ToastContext = createContext<ToastContextType>({
  showSuccess: () => {},
  showError: () => {},
  showWarning: () => {},
  showInfo: () => {},
})

export const useToastContext = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()

  const showSuccess = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      variant: "default",
    });
  }

  const showError = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      variant: "destructive",
    });
  }

  const showWarning = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      variant: "default",
    });
  }

  const showInfo = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      variant: "default",
    });
  }

  return (
    <ToastContext.Provider
      value={{
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
    </ToastContext.Provider>
  )
} 