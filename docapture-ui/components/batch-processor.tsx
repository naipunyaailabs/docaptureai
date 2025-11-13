"use client";

import React, { useState, useRef } from "react";
import { useBatchProcessing } from "@/hooks/useBatchProcessing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Download,
  Trash2,
  Clock,
  FileSpreadsheet
} from "lucide-react";
import type { ServiceInfo } from "@/lib/api";

interface BatchProcessorProps {
  service: ServiceInfo;
}

export function BatchProcessor({ service }: BatchProcessorProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processingOptions, setProcessingOptions] = useState<Record<string, any>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isProcessing,
    results,
    progress,
    error,
    processFiles,
    exportResults,
    reset,
    hasResults,
    successCount,
    errorCount
  } = useBatchProcessing({
    onComplete: (results) => {
      console.log('Batch processing completed:', results);
    },
    onProgress: (progress) => {
      console.log(`Processing: ${progress.current}/${progress.total} - ${progress.currentFile}`);
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartProcessing = async () => {
    if (selectedFiles.length === 0) return;
    await processFiles(selectedFiles, service.id, processingOptions);
  };

  const handleReset = () => {
    setSelectedFiles([]);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* File Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Batch Document Processing
          </CardTitle>
          <CardDescription>
            Upload multiple documents to process them in batch and export results to Excel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Input */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={service.supportedFileTypes.join(",")}
              onChange={handleFileSelect}
              disabled={isProcessing}
              className="hidden"
              id="batch-file-input"
            />
            <label htmlFor="batch-file-input">
              <Button 
                type="button"
                variant="outline" 
                className="w-full"
                disabled={isProcessing}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Select Files for Batch Processing
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-2">
              Supported formats: {service.supportedFileTypes.join(", ")}
            </p>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">
                  Selected Files ({selectedFiles.length})
                </h4>
                {!isProcessing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
              
              <ScrollArea className="h-[200px] rounded-md border p-3">
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded bg-muted/50"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      {!isProcessing && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleStartProcessing}
              disabled={selectedFiles.length === 0 || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Start Batch Processing
                </>
              )}
            </Button>

            {hasResults && !isProcessing && (
              <Button
                variant="outline"
                onClick={() => exportResults()}
              >
                <Download className="mr-2 h-4 w-4" />
                Export to Excel
              </Button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Progress Card */}
      {isProcessing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Processing Progress</CardTitle>
            <CardDescription>
              Processing {progress.current} of {progress.total} files
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Current: {progress.currentFile}
                </span>
                <span className="font-medium">{progress.percentage}%</span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Card */}
      {hasResults && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Processing Results</CardTitle>
            <CardDescription>
              <div className="flex gap-3 mt-2">
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Success: {successCount}
                </Badge>
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Failed: {errorCount}
                </Badge>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] rounded-md border">
              <div className="p-4 space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-md border ${
                      result.status === 'success' 
                        ? 'bg-green-50 border-green-200' 
                        : result.status === 'error'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        {result.status === 'success' && (
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        )}
                        {result.status === 'error' && (
                          <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        {result.status === 'processing' && (
                          <Loader2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0 animate-spin" />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{result.fileName}</p>
                          {result.status === 'error' && result.error && (
                            <p className="text-xs text-red-600 mt-1">{result.error}</p>
                          )}
                          {result.processingTime && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {result.processingTime}ms
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <Badge 
                        variant={
                          result.status === 'success' ? 'default' : 
                          result.status === 'error' ? 'destructive' : 
                          'secondary'
                        }
                        className="flex-shrink-0"
                      >
                        {result.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
