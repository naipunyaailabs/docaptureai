"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Copy, Check, AlertCircle, FileSpreadsheet, ExternalLink, Loader2, FileWarning } from "lucide-react"
import type { ProcessingResult } from "@/lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExcelRenderer } from "react-excel-renderer"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm" // For GitHub Flavored Markdown (includes code blocks)

interface ResultViewerProps {
  result: ProcessingResult | null
  format: string
}

export function ResultViewer({ result, format }: ResultViewerProps) {
  const [copied, setCopied] = useState(false)
  const [excelCols, setExcelCols] = useState<any[]>([])
  const [excelRows, setExcelRows] = useState<any[]>([])
  const [excelLoading, setExcelLoading] = useState(false)
  const [excelError, setExcelError] = useState<string | null>(null)

  const getExcelUrlOrBlob = (): string | Blob | null => {
    if (!result || !result.result) return null

    if (result.result.excel_files && Array.isArray(result.result.excel_files) && result.result.excel_files.length > 0) {
      const base64Data = result.result.excel_files[0]
      try {
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        return new Blob([byteArray], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      } catch (e) {
        setExcelError("Failed to decode Excel data.")
        return null
      }
    }
    // Prioritize excel_url if available, then other common keys
    return result.result.excel_url || result.result.excelUrl || result.result.excel || null
  }

  useEffect(() => {
    if (result && result.status === "completed" && (format === "excel" || format === "csv")) {
      const excelSource = getExcelUrlOrBlob()
      if (excelSource) {
        setExcelLoading(true)
        setExcelError(null)
        setExcelCols([])
        setExcelRows([])

        const processFile = (fileBlob: Blob) => {
          if (typeof ExcelRenderer === "function") {
            ExcelRenderer(fileBlob, (err: any, resp: { cols: any[]; rows: any[] }) => {
              setExcelLoading(false)
              if (err) {
                setExcelError("Failed to render file. It might be corrupted or an unsupported format.")
              } else {
                setExcelCols(resp.cols || [])
                setExcelRows(resp.rows || [])
              }
            })
          } else {
            setExcelError("File rendering library did not load correctly.")
            setExcelLoading(false)
          }
        }

        if (typeof excelSource === "string") {
          fetch(excelSource)
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
              }
              return response.blob()
            })
            .then((blob) => processFile(blob))
            .catch((error) => {
              setExcelError("Failed to fetch file from URL. Check CORS policy or URL validity.")
              setExcelLoading(false)
            })
        } else {
          processFile(excelSource)
        }
      } else if (result.result && Object.keys(result.result).length > 0 && (format === "excel" || format === "csv")) {
        // Handle JSON to CSV/Excel conversion for custom field extractor
        if (result.serviceId === "custom-field-extractor" && result.result?.json_output) {
          const match = result.result.json_output.match(/```(?:json)?\n([\s\S]*?)\n```/)
          if (match && match[1]) {
            try {
              const parsedJson = JSON.parse(match[1])
              // Create table data from JSON with proper header formatting
              const headers = Object.keys(parsedJson)
              const values = Object.values(parsedJson)
              // Format headers to be more readable
              const formattedHeaders = headers.map(header => ({
                name: header
                  .split('_')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')
              }))
              setExcelCols(formattedHeaders)
              setExcelRows([values])
              setExcelLoading(false)
            } catch (e) {
              setExcelError("Failed to convert JSON to table format.")
              setExcelLoading(false)
            }
          }
        } else {
          setExcelError(`No direct ${format.toUpperCase()} file provided for viewing. Displaying raw data if available.`)
        }
      }
    }
  }, [result, format])

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>Process documents to see extraction results</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">No results to display yet</p>
        </CardContent>
      </Card>
    )
  }

  if (result.status === "processing") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing</CardTitle>
          <CardDescription>Your documents are being processed</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-brand-accent mb-4" />
          <p className="text-muted-foreground text-center">Please wait...</p>
        </CardContent>
      </Card>
    )
  }

  if (result.status === "failed") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{result.error || "An unknown error occurred"}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const formatResultText = () => {
    if (!result.result) return ""
    return JSON.stringify(result.result, null, 2)
  }

  const getJsonToCopy = () => {
    if (
      result.serviceId === "custom-field-extractor" &&
      result.result?.json_output &&
      typeof result.result.json_output === "string"
    ) {
      const match = result.result.json_output.match(/```(?:json)?\n([\s\S]*?)\n```/)
      if (match && match[1]) {
        try {
          const parsedJson = JSON.parse(match[1])
          return JSON.stringify(parsedJson, null, 2)
        } catch (e) {
          return result.result.json_output
        }
      }
      return result.result.json_output
    }
    return formatResultText()
  }

  const renderTableView = () => {
    // For field extractor results, render the extracted fields in a clean format
    if (result.serviceId === "field-extractor" && result.result) {
      const extractedData = result.result.extracted;
      const templateInfo = {
        templateId: result.result.templateId,
        usedTemplate: result.result.usedTemplate,
        confidence: (result.result as any).confidence,
        templateMatch: (result.result as any).templateMatch
      };

      return (
        <div className="space-y-6">
          {/* Extracted Fields Section */}
          {extractedData && Object.keys(extractedData).length > 0 && (
            <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Extracted Data</h3>
              <div className="space-y-4">
                {Object.entries(extractedData).map(([key, value]) => (
                  <div key={key} className="pb-3 border-b border-gray-100 last:border-b-0 last:pb-0 last:mb-0">
                    <div className="font-medium text-gray-700">{key.split(/(?=[A-Z])/).join(' ')}</div>
                    <div className="text-gray-900 mt-1">
                      {value === null ? (
                        <span className="text-gray-400">null</span>
                      ) : typeof value === "object" ? (
                        <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        String(value)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Template Information Section */}
          {(templateInfo.templateId || templateInfo.usedTemplate || templateInfo.confidence) && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-lg font-medium text-gray-800 mb-3">Template Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {templateInfo.templateId && (
                  <div>
                    <span className="font-medium text-gray-600">Template ID:</span>
                    <span className="ml-2 text-gray-800">{templateInfo.templateId}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-600">Template Used:</span>
                  <span className="ml-2 text-gray-800">{templateInfo.usedTemplate ? 'Yes' : 'No'}</span>
                </div>
                {templateInfo.confidence !== undefined && (
                  <div>
                    <span className="font-medium text-gray-600">Confidence:</span>
                    <span className="ml-2 text-gray-800">{templateInfo.confidence}%</span>
                  </div>
                )}
                {templateInfo.templateMatch && (
                  <div>
                    <span className="font-medium text-gray-600">Template Match:</span>
                    <span className="ml-2 text-gray-800">{templateInfo.templateMatch}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    // For other services, use the existing logic
    let dataToRender: any[] = []

    if (result.result) {
      if (
        result.serviceId === "custom-field-extractor" &&
        result.result.content &&
        Array.isArray(result.result.content)
      ) {
        try {
          const jsonContent = result.result.content[0]
          if (typeof jsonContent === "string" && jsonContent.includes("```json")) {
            const jsonMatch = jsonContent.match(/```json\n([\s\S]*?)\n```/)
            if (jsonMatch && jsonMatch[1]) {
              const parsedJson = JSON.parse(jsonMatch[1])
              
              // Handle any JSON structure
              if (typeof parsedJson === "object" && parsedJson !== null) {
                // If the JSON has multiple top-level sections
                if (!Array.isArray(parsedJson) && Object.keys(parsedJson).length > 0) {
                  // Create sections for each top-level key
                  const sections = Object.entries(parsedJson).map(([key, value]) => ({
                    title: key.split(/(?=[A-Z])/).join(' '),
                    data: Array.isArray(value) ? value : [value]
                  }))

                  return (
                    <div className="space-y-6">
                      {sections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="border rounded-lg p-4">
                          <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
                          {Array.isArray(section.data) && section.data.length > 0 ? (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    {Object.keys(section.data[0]).map((header) => (
                                      <TableHead key={header} className="whitespace-nowrap">
                                        {header.split(/(?=[A-Z])/).join(' ')}
                                      </TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {section.data.map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                      {Object.keys(section.data[0]).map((header) => (
                                        <TableCell key={`${rowIndex}-${header}`} className="whitespace-nowrap">
                                          {typeof row[header] === "object" ? JSON.stringify(row[header]) : String(row[header]) || "N/A"}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <p className="text-muted-foreground">No data available for this section.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                } else if (Array.isArray(parsedJson)) {
                  dataToRender = parsedJson
                } else {
                  dataToRender = [parsedJson]
                }
              }
            }
          } else if (typeof jsonContent === "object") {
            dataToRender = Array.isArray(jsonContent) ? jsonContent : [jsonContent]
          }
        } catch (e) {
          console.error("Error parsing JSON:", e)
        }
      } else if (
        result.result.content &&
        Array.isArray(result.result.content) &&
        result.serviceId !== "custom-field-extractor"
      ) {
        dataToRender = result.result.content
      } else if (Array.isArray(result.result)) {
        dataToRender = result.result
      } else if (
        typeof result.result === "object" &&
        result.result !== null &&
        !Array.isArray(result.result) &&
        Object.keys(result.result).length > 0 &&
        !result.result.content &&
        !result.result.json_output
      ) {
        dataToRender = [result.result]
      }
    }

    // If we have a flat data structure, render it as a single table
    if (dataToRender.length > 0) {
      const headers = Object.keys(dataToRender[0])
      return (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header} className="whitespace-nowrap">
                    {header.split(/(?=[A-Z])/).join(' ')}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataToRender.map((row, index) => (
                <TableRow key={index}>
                  {headers.map((header) => (
                    <TableCell key={`${index}-${header}`} className="whitespace-nowrap">
                      {typeof row[header] === "object" ? JSON.stringify(row[header]) : String(row[header]) || "N/A"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )
    }

    return <p className="text-muted-foreground">No table data available for the current selection.</p>
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(getJsonToCopy())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const excelSourceForDownload = getExcelUrlOrBlob()

    if ((format === "excel" || format === "csv") && excelSourceForDownload) {
      // Strip any existing extension from the filename
      const baseFileName = result.fileName ? result.fileName.replace(/\.[^/.]+$/, "") : "result"
      const downloadFileName = `${baseFileName}.${format === "excel" ? "xlsx" : "csv"}`
      
      if (typeof excelSourceForDownload === "string") {
        const a = document.createElement("a")
        a.href = excelSourceForDownload
        a.download = downloadFileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } else {
        const url = URL.createObjectURL(excelSourceForDownload)
        const a = document.createElement("a")
        a.href = url
        a.download = downloadFileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } else {
      let contentToDownload = ""
      let mimeType = "text/plain"
      let fileExtension = format

      if (result.serviceId === "custom-field-extractor") {
        if (format === "markdown" && result.result?.extracted_text) {
          // Download markdown content
          contentToDownload = result.result.extracted_text
          mimeType = "text/markdown"
          fileExtension = "md"
        } else if (format === "json" && result.result?.json_output) {
          // Download JSON content
          const match = result.result.json_output.match(/```(?:json)?\n([\s\S]*?)\n```/)
          if (match && match[1]) {
            try {
              const parsedJson = JSON.parse(match[1])
              contentToDownload = JSON.stringify(parsedJson, null, 2)
            } catch (e) {
              contentToDownload = result.result.json_output
            }
          } else {
            contentToDownload = result.result.json_output
          }
          mimeType = "application/json"
          fileExtension = "json"
        } else if ((format === "excel" || format === "csv") && result.result?.json_output) {
          const match = result.result.json_output.match(/```(?:json)?\n([\s\S]*?)\n```/)
          if (match && match[1]) {
            try {
              const parsedJson = JSON.parse(match[1])
              // Format headers to be more readable
              const headers = Object.keys(parsedJson).map(header =>
                header
                  .split('_')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')
              )
              const values = Object.values(parsedJson)
              contentToDownload = [headers.join(","), values.join(",")].join("\n")
              mimeType = format === "csv" ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              fileExtension = format
            } catch (e) {
              contentToDownload = `Error converting JSON to ${format.toUpperCase()} format`
            }
          }
        }
      } else {
        contentToDownload = formatResultText()
        if (format === "json") {
          mimeType = "application/json"
          fileExtension = "json"
        } else if (format === "csv") {
          if (Array.isArray(result.result) && result.result.length > 0 && typeof result.result[0] === "object") {
            const headers = Object.keys(result.result[0])
            const csvRows = [
              headers.join(","),
              ...result.result.map((row) => headers.map((header) => JSON.stringify(row[header])).join(",")),
            ]
            contentToDownload = csvRows.join("\n")
          } else {
            contentToDownload = "CSV conversion not available for this data structure."
          }
          mimeType = "text/csv"
          fileExtension = "csv"
        } else if (format === "text") {
          fileExtension = "txt"
        }
      }

      const blob = new Blob([contentToDownload], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${result.fileName || "result"}.${fileExtension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const getProcessedFilesCount = () => {
    if (result.result?.content && Array.isArray(result.result.content)) {
      return result.result.content.length
    }
    if (Array.isArray(result.result)) {
      return result.result.length
    }
    return "multiple"
  }

  const directExcelUrl = getExcelUrlOrBlob() // Use the getter here
  const showMarkdownOutput =
    result.serviceId === "custom-field-extractor" &&
    result.result?.json_output &&
    format !== "excel" &&
    format !== "table"

  const renderMarkdownContent = () => {
    if (!result.result?.extracted_text) return null
    
    return (
      <div className="bg-muted rounded-md p-4 overflow-auto max-h-[500px] mt-4 prose dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.result.extracted_text}</ReactMarkdown>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Extraction Results</CardTitle>
          <CardDescription>
            Data from {getProcessedFilesCount()} file{getProcessedFilesCount() !== 1 ? "s" : ""} in{" "}
            {format.toUpperCase()} format
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={format === "excel" && excelRows.length > 0 && !directExcelUrl}
          >
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Copied" : "Copy JSON"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* {renderMarkdownContent()} */}

        {excelLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-brand-accent mb-4" />
            <p className="text-muted-foreground">Loading Excel preview...</p>
          </div>
        )}

        {!excelLoading && format === "excel" && excelRows.length > 0 && (
          <div className="overflow-auto max-h-[600px] border rounded-md">
            <Table className="min-w-full">
              {excelCols.length > 0 && excelRows[0] && (
                <TableHeader>
                  <TableRow>
                    {excelRows[0].map((headerCell: any, headerIndex: number) => (
                      <TableHead key={`h-${headerIndex}`} className="whitespace-nowrap bg-muted/50 p-2 border">
                        {headerCell}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
              )}
              <TableBody>
                {excelRows.slice(excelCols.length > 0 && excelRows[0] ? 1 : 0).map((row: any, rowIndex: number) => (
                  <TableRow key={`r-${rowIndex}`}>
                    {row.map((cell: any, cellIndex: number) => (
                      <TableCell key={`c-${rowIndex}-${cellIndex}`} className="whitespace-nowrap p-2 border text-sm">
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Show "Open Excel Externally" if directExcelUrl exists and no preview is rendered */}
        {directExcelUrl && typeof directExcelUrl === "string" && excelRows.length === 0 && !excelLoading && (
          <div className="py-4">
            {excelError &&
              format === "excel" && ( // Only show excelError if format is excel and preview failed
                <Alert variant="default" className="mb-4">
                  <FileWarning className="h-4 w-4" />
                  <AlertDescription>{excelError}</AlertDescription>
                </Alert>
              )}
            <div className="bg-muted rounded-md p-4 text-center">
              <FileSpreadsheet className="h-12 w-12 text-green-500 dark:text-green-400 mx-auto mb-4" />
              <p className="text-foreground font-medium mb-2">Excel file available.</p>
              <p className="text-muted-foreground text-sm mb-4">
                {format === "excel" ? "Preview could not be generated. " : ""}
                Click the Download button or open externally.
              </p>
              <Button
                onClick={() => window.open(directExcelUrl, "_blank")}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Excel File Externally
              </Button>
            </div>
          </div>
        )}

        {/* Fallback for no Excel preview and no direct URL when format is Excel */}
        {!excelLoading && format === "excel" && excelRows.length === 0 && !directExcelUrl && (
          <div className="py-4">
            {excelError && (
              <Alert variant="default" className="mb-4">
                <FileWarning className="h-4 w-4" />
                <AlertDescription>{excelError}</AlertDescription>
              </Alert>
            )}
            <p className="text-muted-foreground text-center">
              No Excel preview available. Raw data might be shown below if applicable.
            </p>
          </div>
        )}

        {format === "table" &&
        (result.result.content || Array.isArray(result.result) || typeof result.result === "object") ? (
          renderTableView()
        ) : showMarkdownOutput ? (
          <div className="bg-muted rounded-md p-4 overflow-auto max-h-[500px] mt-4 prose dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.result!.json_output!}</ReactMarkdown>
          </div>
        ) : (
          // Condition to show raw JSON:
          // - Not Excel format OR (Excel format AND no preview AND no direct URL)
          // - AND not showing markdown output
          // - AND not showing table output
          (format !== "excel" || (format === "excel" && excelRows.length === 0 && !directExcelUrl)) &&
          !showMarkdownOutput &&
          format !== "table" && (
            <div className="bg-muted rounded-md p-4 overflow-auto max-h-[500px] mt-4">
              <pre className="text-foreground text-sm whitespace-pre-wrap">{formatResultText()}</pre>
            </div>
          )
        )}

        

        <Alert className="mt-4 bg-green-500/10 border-green-500/20">
          <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
          <AlertDescription className="text-green-500 dark:text-green-400">
            Documents processed successfully on {new Date(result.processedAt).toLocaleString()}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
