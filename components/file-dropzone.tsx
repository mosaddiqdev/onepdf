"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
}

export function FileDropzone({ onFilesAdded, disabled = false }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const openFilePicker = useCallback(() => {
    if (disabled) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf";
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) onFilesAdded(files);
    };
    input.click();
  }, [disabled, onFilesAdded]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type === "application/pdf");
      if (files.length > 0) onFilesAdded(files);
    },
    [disabled, onFilesAdded]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled && !isDragging) setIsDragging(true);
    },
    [disabled, isDragging]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  return (
    <button
      type="button"
      onClick={openFilePicker}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDragEnter={(e) => e.preventDefault()}
      disabled={disabled}
      className={cn(
        "group relative w-full min-h-90 sm:min-h-85 md:min-h-90 lg:min-h-95 rounded-2xl sm:rounded-3xl transition-all duration-200 cursor-pointer",
        "focus-visible:outline-none",
        "backdrop-blur-sm bg-background/60 border border-border/30",
        isDragging
          ? "bg-primary/8 border-primary/30"
          : "hover:bg-background/80 hover:border-border/50",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <div
        className={cn(
          "absolute inset-3 sm:inset-4 md:inset-6 rounded-xl sm:rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-200",
          isDragging
            ? "border-primary/50 bg-primary/3"
            : "border-border/50 group-hover:border-primary/30"
        )}
      >
        <div
          className={cn(
            "mb-6 sm:mb-8 transition-colors duration-200",
            isDragging ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )}
        >
          <svg
            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v12" />
            <path d="m17 8-5-5-5 5" />
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          </svg>
        </div>

        <div className="text-center space-y-2 sm:space-y-3 px-4 sm:px-6 max-w-xs sm:max-w-sm">
          <h3
            className={cn(
              "text-lg sm:text-xl font-semibold tracking-tight transition-colors duration-200",
              isDragging ? "text-primary" : "text-foreground"
            )}
          >
            {isDragging ? "Drop to upload" : "Drop your PDFs here"}
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            or <span className="font-medium text-primary">browse files</span> from your device
          </p>
        </div>

        <div className="mt-6 sm:mt-8 flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-muted/40 rounded-full border border-border/30">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground">
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4z" />
            </svg>
            <span className="font-medium">PDF files</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-border"></div>
          <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-muted-foreground">
            <span>Up to 50MB each</span>
          </div>
        </div>
      </div>
    </button>
  );
}
