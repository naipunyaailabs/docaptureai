"use client"

import { useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Terminal } from "lucide-react"

interface ProcessingLogsProps {
  logs: string[]
  className?: string
}

export function ProcessingLogs({ logs, className = "" }: ProcessingLogsProps) {
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll logs to bottom when new logs are added
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs])

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <Terminal className="h-4 w-4 mr-2 text-brand-accent dark:text-brand-accent" />
          Processing Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">Logs will appear here during processing</div>
        ) : (
          <div className="bg-muted/50 rounded-md p-3 h-[300px] overflow-y-auto text-xs font-mono">
            {logs.map((log, index) => (
              <div key={index} className="mb-1 text-muted-foreground">
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
