"use client";

import { useState, useCallback, useEffect } from "react";
import {
  getPDFPageCount,
  formatFileSize,
  generateId,
} from "@/lib/pdf-processor";
import {
  validateFiles,
  formatValidationErrors,
  VALIDATION_LIMITS,
} from "@/lib/validation";

export function useFileManager() {
  const [files, setFiles] = useState<PDFFile[]>(() => {
    if (
      typeof window !== "undefined" &&
      window.uploadedFiles &&
      Array.isArray(window.uploadedFiles)
    ) {
      const initialFiles = window.uploadedFiles;
      window.uploadedFiles = [];
      return initialFiles;
    }
    return [];
  });
  const [validationError, setValidationError] = useState<string>("");

  const totalPages = files.reduce((sum, f) => sum + (f.pageCount || 0), 0);

  const handleFilesAdded = useCallback(
    async (newFiles: File[]) => {
      setValidationError("");

      try {
        const validationErrors = await validateFiles(newFiles);
        if (validationErrors.length > 0) {
          setValidationError(formatValidationErrors(validationErrors));
          return;
        }

        const currentTotalSize = files.reduce((sum, f) => sum + f.size, 0);
        const newTotalSize = newFiles.reduce((sum, f) => sum + f.size, 0);

        if (
          currentTotalSize + newTotalSize >
          VALIDATION_LIMITS.MAX_TOTAL_SIZE
        ) {
          const totalMB = Math.round(
            (currentTotalSize + newTotalSize) / (1024 * 1024)
          );
          const maxMB = Math.round(
            VALIDATION_LIMITS.MAX_TOTAL_SIZE / (1024 * 1024)
          );
          setValidationError(
            `Adding these files would exceed the ${maxMB}MB limit (total would be ${totalMB}MB).`
          );
          return;
        }

        if (files.length + newFiles.length > VALIDATION_LIMITS.MAX_FILES) {
          setValidationError(
            `Cannot add ${newFiles.length} files. Maximum ${VALIDATION_LIMITS.MAX_FILES} files allowed (currently have ${files.length}).`
          );
          return;
        }

        const pdfFiles: PDFFile[] = await Promise.all(
          newFiles.map(async (file) => {
            let pageCount: number | undefined;
            try {
              pageCount = await getPDFPageCount(file);

              if (
                pageCount &&
                pageCount > VALIDATION_LIMITS.MAX_PAGES_PER_FILE
              ) {
                throw new Error(
                  `File "${file.name}" has ${pageCount} pages. Maximum ${VALIDATION_LIMITS.MAX_PAGES_PER_FILE} pages per file allowed.`
                );
              }
            } catch (error) {
              console.warn(`Failed to get page count for ${file.name}:`, error);
              if (error instanceof Error && error.message.includes("Maximum")) {
                throw error;
              }
            }

            return {
              id: generateId(),
              file,
              name: file.name,
              size: file.size,
              formattedSize: formatFileSize(file.size),
              pageCount,
            };
          })
        );

        const newTotalPages =
          totalPages + pdfFiles.reduce((sum, f) => sum + (f.pageCount || 0), 0);
        if (newTotalPages > VALIDATION_LIMITS.MAX_TOTAL_PAGES) {
          setValidationError(
            `Adding these files would exceed the ${VALIDATION_LIMITS.MAX_TOTAL_PAGES} page limit (total would be ${newTotalPages} pages).`
          );
          return;
        }

        setFiles((prev) => [...prev, ...pdfFiles]);
      } catch (error) {
        console.error("Error processing files:", error);
        setValidationError(
          error instanceof Error
            ? error.message
            : "Failed to process files. Please try again."
        );
      }
    },
    [files, totalPages]
  );

  const addMoreFiles = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".pdf";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        handleFilesAdded(Array.from(target.files));
      }
    };
    input.click();
  }, [handleFilesAdded]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setValidationError("");
  }, []);

  const reorderFiles = useCallback((oldIndex: number, newIndex: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const [removed] = newFiles.splice(oldIndex, 1);
      newFiles.splice(newIndex, 0, removed);
      return newFiles;
    });
  }, []);

  const resetFiles = useCallback(() => {
    setFiles([]);
    setValidationError("");
  }, []);

  const clearValidationError = useCallback(() => {
    setValidationError("");
  }, []);

  const setFilesDirectly = useCallback((newFiles: PDFFile[]) => {
    setFiles(newFiles);
  }, []);

  return {
    files,
    totalPages,
    validationError,
    handleFilesAdded,
    addMoreFiles,
    removeFile,
    reorderFiles,
    resetFiles,
    setFilesDirectly,
    clearValidationError,
  };
}
