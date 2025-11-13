"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Download,
  Eye,
  FileText,
  Calendar,
  Clock,
  Loader2,
  FileSpreadsheet,
  FileJson,
  AlertCircle,
  X,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { apiService, type ProcessingResult } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { ResultViewer } from "@/components/dashboard/result-viewer" // This ResultViewer is now fixed

export default function ProcessingHistoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [results, setResults] = useState<ProcessingResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [isExcelPreviewModalOpen, setIsExcelPreviewModalOpen] = useState(false)
  const [selectedResultForPreview, setSelectedResultForPreview] = useState<ProcessingResult | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    const fetchResults = async () => {
      if (!isAuthenticated) return;
      setIsLoading(true);
      try {
        const response = await apiService.getProcessingResults(50, 0);
        
        if (response.success && response.data) {
          setResults(response.data);
        } else {
          setError(response.error || "Failed to load processing history");
        }
      } catch (err) {
        setError("An error occurred while fetching processing history");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchResults();
    }
  }, [isAuthenticated]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20"
      case "processing":
        return "bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20"
      case "failed":
        return "bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20"
      default:
        return "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20"
    }
  }

  const getExcelUrlFromResult = (resultData: any): string | null => {
    if (!resultData) return null
    return resultData.excel_url || resultData.excelUrl || resultData.excel || null
  }

  const isResultExcelDownloadable = (result: ProcessingResult): boolean => {
    const excelUrl = getExcelUrlFromResult(result.result)
    const hasExcelData =
      result.result?.excel_files && Array.isArray(result.result.excel_files) && result.result.excel_files.length > 0
    // Consider it Excel-like if format is excel OR if specific excel data fields are present
    return result.format === "excel" || !!excelUrl || hasExcelData
  }

  const handleDownload = (result: ProcessingResult) => {
    if (isResultExcelDownloadable(result)) {
      const excelSource =
        result.result?.excel_files && Array.isArray(result.result.excel_files) && result.result.excel_files.length > 0
          ? result.result.excel_files[0]
          : getExcelUrlFromResult(result.result)

      if (typeof excelSource === "string" && excelSource.startsWith("http")) {
        const a = document.createElement("a")
        a.href = excelSource
        a.download = `${result.fileName || "result"}.xlsx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } else if (typeof excelSource === "string") {
        // Base64 data
        try {
          const byteCharacters = atob(excelSource)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `${result.fileName || "result"}.xlsx`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        } catch (e) {
          alert("Failed to download Excel file due to a decoding error. Downloading raw JSON data instead.")
          downloadJsonFallback(result)
        }
      } else {
        alert("Excel format specified, but no downloadable file found. Downloading raw JSON data instead.")
        downloadJsonFallback(result)
      }
    } else {
      downloadJsonFallback(result)
    }
  }

  const downloadJsonFallback = (result: ProcessingResult) => {
    let dataToFormat = result.result
    if (result.result?.error && result.result?.originalData) {
      dataToFormat = { error: result.result.error, originalData: result.result.originalData }
    }
    const formattedResult = JSON.stringify(dataToFormat, null, 2)
    const blob = new Blob([formattedResult], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${result.fileName || "result"}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleView = (result: ProcessingResult) => {
    if (result.status !== "completed") return

    if (isResultExcelDownloadable(result)) {
      setSelectedResultForPreview(result)
      setIsExcelPreviewModalOpen(true)
    } else {
      router.push(`/dashboard/results/${result.id}`)
    }
  }

  if (authLoading || (!isAuthenticated && !isLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 md:gap-8 md:p-4">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Processing History</h1>
        <p className="text-sm sm:text-base text-muted-foreground">View and manage your document processing results</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : results.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Processing History</CardTitle>
            <CardDescription>You haven't processed any documents yet</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              Start by processing your first document using one of our extraction services
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-brand-primary hover:bg-brand-primary/90 text-primary-foreground"
            >
              Browse Services
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Recent Processing Results</CardTitle>
            <CardDescription>Your document processing history and results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">File Name</TableHead>
                      <TableHead className="min-w-[100px]">Service</TableHead>
                      <TableHead className="min-w-[100px]">Format</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[180px]">Processed</TableHead>
                      <TableHead className="min-w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium truncate max-w-[150px]">{result.fileName}</TableCell>
                        <TableCell className="capitalize">{result.serviceId}</TableCell>
                        <TableCell className="uppercase">
                          <div className="flex items-center">
                            {isResultExcelDownloadable(result) ? (
                              <FileSpreadsheet className="h-4 w-4 mr-1 text-green-500" />
                            ) : result.format === "json" ? (
                              <FileJson className="h-4 w-4 mr-1 text-brand-accent" />
                            ) : (
                              <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                            )}
                            <span className="hidden sm:inline">{result.format}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(result.status)}>{result.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center text-sm text-muted-foreground">
                            <div className="flex items-center mb-1 sm:mb-0">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">{new Date(result.processedAt).toLocaleDateString()}</span>
                              <span className="sm:hidden">{new Date(result.processedAt).toLocaleDateString().split('/').slice(0, 2).join('/')}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 ml-0 sm:ml-2 mr-1" />
                              <span className="hidden sm:inline">{new Date(result.processedAt).toLocaleTimeString()}</span>
                              <span className="sm:hidden">{new Date(result.processedAt).toLocaleTimeString().split(':').slice(0, 2).join(':')}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(result)}
                              disabled={result.status !== "completed"}
                              aria-label="View result"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(result)}
                              disabled={result.status !== "completed"}
                              aria-label="Download result"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedResultForPreview && (
        <Dialog open={isExcelPreviewModalOpen} onOpenChange={setIsExcelPreviewModalOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl w-full h-[90vh] flex flex-col p-0">
            <DialogHeader className="p-4 sm:p-6 pb-0">
              <DialogTitle className="text-lg sm:text-xl">Excel Preview: {selectedResultForPreview.fileName}</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Viewing content of {selectedResultForPreview.fileName} (Service: {selectedResultForPreview.serviceId})
              </DialogDescription>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="absolute top-2 sm:top-4 right-2 sm:right-4">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </DialogClose>
            </DialogHeader>
            <div className="flex-grow overflow-auto p-4 sm:p-6 pt-0">
              <ResultViewer result={selectedResultForPreview} format="excel" />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
