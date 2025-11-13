// hooks/useBatchProcessing.ts
// React hook for batch document processing

import { useState, useCallback } from 'react';
import { aguiClient } from '@/lib/agui-client';
import { createBatchProcessingExcel, downloadExcelWorkbook } from '@/lib/advanced-excel-utils';

export interface BatchResult {
  fileName: string;
  fileSize: number;
  result: any;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  processingTime?: number;
}

export interface BatchProgress {
  current: number;
  total: number;
  percentage: number;
  currentFile: string;
}

export interface UseBatchProcessingOptions {
  onComplete?: (results: BatchResult[]) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: BatchProgress) => void;
}

export function useBatchProcessing(options: UseBatchProcessingOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [progress, setProgress] = useState<BatchProgress>({
    current: 0,
    total: 0,
    percentage: 0,
    currentFile: ''
  });
  const [error, setError] = useState<string | null>(null);

  const processFiles = useCallback(async (
    files: File[],
    serviceId: string,
    processingOptions?: Record<string, any>
  ) => {
    if (files.length === 0) {
      setError('No files selected for processing');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    // Initialize results
    const initialResults: BatchResult[] = files.map(file => ({
      fileName: file.name,
      fileSize: file.size,
      result: null,
      status: 'pending'
    }));
    setResults(initialResults);

    const totalFiles = files.length;
    const processedResults: BatchResult[] = [];

    // Process files sequentially
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const startTime = Date.now();

      // Update progress
      setProgress({
        current: i + 1,
        total: totalFiles,
        percentage: Math.round(((i + 1) / totalFiles) * 100),
        currentFile: file.name
      });

      options.onProgress?.({
        current: i + 1,
        total: totalFiles,
        percentage: Math.round(((i + 1) / totalFiles) * 100),
        currentFile: file.name
      });

      // Update status to processing
      setResults(prev => prev.map((r, idx) => 
        idx === i ? { ...r, status: 'processing' } : r
      ));

      try {
        // Process the file
        const response = await aguiClient.executeAgent(serviceId, {
          document: file,
          ...processingOptions
        });

        const processingTime = Date.now() - startTime;

        if (response.success) {
          const result: BatchResult = {
            fileName: file.name,
            fileSize: file.size,
            result: response.data?.result,
            status: 'success',
            processingTime
          };
          processedResults.push(result);

          // Update results
          setResults(prev => prev.map((r, idx) => 
            idx === i ? result : r
          ));
        } else {
          const result: BatchResult = {
            fileName: file.name,
            fileSize: file.size,
            result: null,
            status: 'error',
            error: response.error || 'Unknown error',
            processingTime
          };
          processedResults.push(result);

          // Update results
          setResults(prev => prev.map((r, idx) => 
            idx === i ? result : r
          ));
        }
      } catch (err) {
        const processingTime = Date.now() - startTime;
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        
        const result: BatchResult = {
          fileName: file.name,
          fileSize: file.size,
          result: null,
          status: 'error',
          error: errorMessage,
          processingTime
        };
        processedResults.push(result);

        // Update results
        setResults(prev => prev.map((r, idx) => 
          idx === i ? result : r
        ));
      }
    }

    setIsProcessing(false);
    options.onComplete?.(processedResults);
  }, [options]);

  const exportResults = useCallback(async (filename?: string) => {
    if (results.length === 0) {
      setError('No results to export');
      return;
    }

    try {
      const workbook = await createBatchProcessingExcel(
        results.map(r => ({
          fileName: r.fileName,
          result: r.result,
          status: r.status as 'success' | 'error',
          error: r.error
        }))
      );

      const exportFilename = filename || `batch-results-${new Date().getTime()}.xlsx`;
      await downloadExcelWorkbook(workbook, exportFilename);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export results';
      setError(errorMessage);
      options.onError?.(errorMessage);
    }
  }, [results, options]);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setResults([]);
    setProgress({
      current: 0,
      total: 0,
      percentage: 0,
      currentFile: ''
    });
    setError(null);
  }, []);

  return {
    isProcessing,
    results,
    progress,
    error,
    processFiles,
    exportResults,
    reset,
    hasResults: results.length > 0,
    successCount: results.filter(r => r.status === 'success').length,
    errorCount: results.filter(r => r.status === 'error').length
  };
}
