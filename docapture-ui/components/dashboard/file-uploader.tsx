"use client"

import type React from "react"
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  X,
  FileIcon as FileIconLucide,
  AlertCircle,
  FileText,
  FileImage,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { config } from "@/lib/config"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"

interface FileWithMeta extends File {
  id: string // Unique ID for each file instance
  preview?: string
  uploadStatus?: "uploading" | "completed" | "error"
  uploadProgress?: number
}

interface FileUploaderProps {
  onFilesChange: (files: File[]) => void
  onValidationChange?: (isValid: boolean) => void
  acceptedFileTypes?: string[]
  maxFiles?: number
  maxSizeMB?: number
}

export interface FileUploaderRef {
  reset: () => void
}

export const FileUploader = forwardRef<FileUploaderRef, FileUploaderProps>(
  (
    {
      onFilesChange,
      onValidationChange,
      acceptedFileTypes = config.supportedFileTypes,
      maxFiles = 10,
      maxSizeMB = config.maxUploadSize,
    },
    ref,
  ) => {
    const [filesWithMeta, setFilesWithMeta] = useState<FileWithMeta[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      reset: () => {
        setFilesWithMeta([])
        setError(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = "" // Clear the file input
        }
        // Notify parent that files are cleared and validation might change
        onFilesChange([])
        onValidationChange?.(false)
      },
    }))

    useEffect(() => {
      const allFilesValid = filesWithMeta.length > 0 && filesWithMeta.every((file) => file.uploadStatus === "completed")
      onValidationChange?.(allFilesValid)
    }, [filesWithMeta, onValidationChange])

    const handleFileChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target || !e.target.files) {
        console.warn('No files selected');
        return;
      }
      const selectedFiles = Array.from(e.target.files);
      processAndAddFiles(selectedFiles);
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      
      if (!e.dataTransfer || !e.dataTransfer.files) {
        console.warn('No files dropped');
        return;
      }
      
      const droppedFiles = Array.from(e.dataTransfer.files);
      processAndAddFiles(droppedFiles);
    }

    const generatePreview = async (file: File): Promise<string | undefined> => {
      if (!file || !(file instanceof File)) {
        console.warn('Invalid file object in generatePreview');
        return undefined;
      }
      
      try {
        const fileType = file.type || '';
        const fileName = typeof file.name === 'string' ? file.name : '';
        const fileExtension = fileName && fileName.includes(".") 
          ? `.${fileName.split(".").pop()?.toLowerCase()}` 
          : "";

        if (fileType.startsWith("image/") || [".jpg", ".jpeg", ".png", ".tiff"].includes(fileExtension)) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => {
              console.error('Error reading file');
              resolve(undefined);
            };
            reader.readAsDataURL(file);
          });
        }
        if (fileType === "application/pdf" || fileExtension === ".pdf") {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              // Create a data URL for the PDF file
              const pdfDataUrl = reader.result as string;
              // Return an object containing both the data URL and file name
              resolve(pdfDataUrl);
            };
            reader.onerror = () => {
              console.error('Error reading PDF file');
              resolve(undefined);
            };
            reader.readAsDataURL(file);
          });
        }
        if (
          fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          fileType === "application/msword" ||
          [".doc", ".docx"].includes(fileExtension)
        ) {
          return "/word-document-example.png";
        }
        if (fileType === "text/plain" || fileExtension === ".txt") {
          return "/text-file.png";
        }
        return "/generic-file.png";
      } catch (error) {
        console.error("Error generating preview:", error);
        return "/generic-file.png";
      }
    };

    const processAndAddFiles = async (newFiles: File[]) => {
      if (!newFiles || !Array.isArray(newFiles) || newFiles.length === 0) {
        console.warn('No valid files provided');
        return;
      }
      
      setError(null);

      if (filesWithMeta.length + newFiles.length > maxFiles) {
        setError(`You can only upload up to ${maxFiles} files.`);
        return;
      }

      const validNewFilesProcessed: FileWithMeta[] = [];
      
      for (const file of newFiles) {
        // Add strict validation for file object
        if (!file || !(file instanceof File)) {
          console.warn('Invalid file object encountered');
          continue;
        }

        try {
          // Ensure file.name exists and is a string
          const fileName = typeof file.name === 'string' ? file.name : '';
          if (!fileName) {
            console.warn('File name is missing');
            continue;
          }

          const fileExtension = fileName && fileName.includes(".") 
            ? `.${fileName.split(".").pop()?.toLowerCase()}` 
            : "";

          if (!acceptedFileTypes.includes(fileExtension) && !acceptedFileTypes.includes(file.type)) {
            setError(
              `File "${fileName}" has an unsupported format. Supported: ${acceptedFileTypes.join(", ")}`
            );
            continue;
          }

          if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`File "${fileName}" exceeds the maximum size of ${maxSizeMB}MB.`);
            continue;
          }

          const fileWithId: FileWithMeta = Object.assign(file, {
            id: crypto.randomUUID(),
            uploadStatus: "uploading" as const,
            uploadProgress: 0,
            preview: undefined,
          });

          fileWithId.preview = await generatePreview(file);
          validNewFilesProcessed.push(fileWithId);
        } catch (error) {
          console.error("Error processing file:", error);
          setError(`Error processing file: ${file.name || 'Unknown file'}`);
          continue;
        }
      }

      if (validNewFilesProcessed.length > 0) {
        const updatedFullList = [...filesWithMeta, ...validNewFilesProcessed];
        setFilesWithMeta(updatedFullList);
        onFilesChange(updatedFullList.map((fwm) => fwm as File));
        validNewFilesProcessed.forEach(simulateUploadProgress);
      }
    };

    const simulateUploadProgress = (fileToSimulate: FileWithMeta) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFilesWithMeta((prev) =>
            prev.map((f) =>
              f.id === fileToSimulate.id ? { ...f, uploadProgress: 100, uploadStatus: "completed" as const } : f,
            ),
          );
        } else {
          setFilesWithMeta((prev) =>
            prev.map((f) => (f.id === fileToSimulate.id ? { ...f, uploadProgress: progress } : f)),
          );
        }
      }, 200);
    };

    const removeFile = (fileIdToRemove: string) => {
      const updatedList = filesWithMeta.filter((file) => file.id !== fileIdToRemove);
      setFilesWithMeta(updatedList);
      onFilesChange(updatedList.map((fwm) => fwm as File));
    };

    const getFileIconForPreview = (fileName: string) => {
      if (!fileName || typeof fileName !== 'string') {
        return <FileIconLucide className="h-10 w-10 text-muted-foreground" />;
      }
      
      try {
        const extension = fileName && fileName.includes(".") 
          ? fileName.split(".").pop()?.toLowerCase() 
          : undefined;

        switch (extension) {
          case "pdf":
            return <FileText className="h-10 w-10 text-red-500 dark:text-red-400" />;
          case "jpg":
          case "jpeg":
          case "png":
          case "tiff":
            return <FileImage className="h-10 w-10 text-blue-500 dark:text-blue-400" />;
          case "docx":
          case "doc":
            return <FileText className="h-10 w-10 text-cyan-500 dark:text-cyan-400" />;
          default:
            return <FileIconLucide className="h-10 w-10 text-muted-foreground" />;
        }
      } catch (error) {
        console.error("Error getting file icon:", error);
        return <FileIconLucide className="h-10 w-10 text-muted-foreground" />;
      }
    };

    const formatFileSize = (bytes: number) => {
      if (!bytes || bytes <= 0) return "0 B"
      const k = 1024
      const sizes = ["B", "KB", "MB", "GB", "TB"]
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      const size = bytes / Math.pow(k, i)
      return `${size.toFixed(1)} ${sizes[i]}`
    }

    return (
      <div className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging ? "border-brand-accent bg-brand-accent/10" : "border-border hover:border-muted-foreground"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click()
          }}
          aria-label="File upload area"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChangeInput}
            multiple
            accept={acceptedFileTypes.join(",")}
            className="hidden"
            aria-hidden="true"
          />
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground font-medium mb-1">Drag and drop files here</h3>
          <p className="text-muted-foreground text-sm mb-2">or click to browse</p>
          <p className="text-muted-foreground/60 text-xs">
            Supports: {acceptedFileTypes.join(", ")} (Max: {maxSizeMB}MB per file, {maxFiles} files)
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {filesWithMeta.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-foreground font-medium">
                Uploaded Files ({filesWithMeta.length}/{maxFiles})
              </h4>
              {filesWithMeta.length > 0 && filesWithMeta.every((f) => f.uploadStatus === "completed") && (
                <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  All files ready
                </div>
              )}
            </div>

            <ScrollArea className="w-full whitespace-nowrap rounded-md border">
              <div className="flex w-max space-x-4 p-4">
                {filesWithMeta.map((file) => (
                  <Card key={file.id} className="relative w-[140px] flex-shrink-0">
                    <div className="relative">
                      <div className="h-[120px] w-full bg-muted rounded-t-md overflow-hidden flex items-center justify-center">
                        {file.preview && file.preview.startsWith("data:image") ? (
                          <div className="relative w-full h-full">
                            <img
                              src={file.preview}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
                              <p className="text-xs text-white truncate">{file.name}</p>
                            </div>
                          </div>
                        ) : file.preview && file.preview.startsWith("data:application/pdf") ? (
                          <div className="relative w-full h-full flex flex-col items-center justify-center p-2 text-center">
                            <FileText className="h-10 w-10 text-brand-accent" />
                            <span className="text-xs mt-1">PDF Preview</span>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
                              <p className="text-xs text-white truncate">{file.name}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center p-2 text-center">
                            {getFileIconForPreview(file.name)}
                            <p className="text-xs text-muted-foreground mt-1 truncate">{file.name}</p>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 z-10"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(file.id)
                        }}
                        aria-label={`Remove file ${file.name}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>

                      {file.uploadStatus === "uploading" && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-t-md">
                          <div className="text-center">
                            <Loader2 className="h-6 w-6 animate-spin text-brand-accent mx-auto mb-1" />
                            <span className="text-xs text-foreground">{file.uploadProgress}%</span>
                          </div>
                        </div>
                      )}
                      {file.uploadStatus === "completed" && (
                        <div className="absolute top-1 left-1 bg-green-500 rounded-full p-0.5 z-10">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-2 space-y-1">
                      <p className="text-xs font-medium text-foreground truncate" title={file.name}>
                        {file.name}
                      </p>
                      {file.uploadStatus === "uploading" && (
                        <Progress
                          value={file.uploadProgress}
                          className="h-1"
                          aria-label={`Upload progress for ${file.name}`}
                        />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}
      </div>
    )
  },
)

FileUploader.displayName = "FileUploader"
