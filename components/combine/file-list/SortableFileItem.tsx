"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableFileItemProps {
  file: PDFFile;
  isProcessing: boolean;
  onRemove: (id: string) => void;
  isDragOverlay?: boolean;
  totalFiles: number;
}

export function SortableFileItem({
  file,
  isProcessing,
  onRemove,
  isDragOverlay = false,
  totalFiles,
}: SortableFileItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: file.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const canDrag = totalFiles > 1 && !isProcessing;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0 ${
        isDragging ? "opacity-50" : ""
      } ${isDragOverlay ? "shadow-lg rounded-lg bg-card border" : ""}`}
    >
      <div
        {...(canDrag ? attributes : {})}
        {...(canDrag ? listeners : {})}
        className={`hidden sm:flex shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors ${
          canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-default"
        } ${totalFiles === 1 ? "opacity-50" : ""}`}
        style={{ touchAction: canDrag ? "none" : "auto" }}
      >
        <svg
          className="w-3 h-3 sm:w-4 sm:h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9h8M8 15h8" />
        </svg>
      </div>

      <div
        {...(canDrag ? attributes : {})}
        {...(canDrag ? listeners : {})}
        className={`sm:hidden flex-1 min-w-0 flex items-center gap-2 ${
          canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-default"
        }`}
        style={{ touchAction: canDrag ? "none" : "auto" }}
      >
        <FileIcon size="sm" />
        <FileInfo file={file} size="sm" />
      </div>

      <div className="hidden sm:flex items-center gap-3 flex-1 min-w-0">
        <FileIcon size="md" />
        <FileInfo file={file} size="md" />
      </div>

      <button
        onClick={() => onRemove(file.id)}
        disabled={isProcessing}
        className="shrink-0 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:bg-destructive/20 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 opacity-0 group-hover:opacity-100 pointer-coarse:opacity-100"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function FileIcon({ size }: { size: "sm" | "md" }) {
  const sizeClasses = size === "sm" ? "w-6 h-6 rounded-md" : "w-8 h-8 rounded-md";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <div
      className={`shrink-0 ${sizeClasses} bg-primary/10 flex items-center justify-center text-primary`}
    >
      <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4z" />
      </svg>
    </div>
  );
}

function FileInfo({ file, size }: { file: PDFFile; size: "sm" | "md" }) {
  const nameClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="flex-1 min-w-0">
      <p className={`${nameClass} font-medium truncate`}>{file.name}</p>
      <p className="text-xs text-muted-foreground">
        {file.formattedSize} • {file.pageCount || "?"} pages
      </p>
    </div>
  );
}
