export {};

declare global {
  interface PDFFile {
    id: string;
    file: File;
    name: string;
    size: number;
    formattedSize: string;
    pageCount?: number;
  }

  interface ProcessingSettings {
    filename: string;
    pagesPerSheet: 2 | 3 | 4 | 6;
    dpi: 150 | 300;
    grayscale: boolean;
    invertColors: boolean;
    blackBackground: boolean;
    enableNotifications: boolean;
  }

  interface ProcessingState {
    status: "idle" | "processing" | "complete" | "error";
    progress: number;
    message: string;
  }

  interface Window {
    uploadedFiles: PDFFile[];
  }

  interface ValidationError {
    type: "file_size" | "file_type" | "file_count" | "filename" | "settings" | "pages";
    message: string;
    file?: string;
  }

  type WorkerMessage =
    | {
        type: "process";
        files: ArrayBuffer[];
        fileNames: string[];
        pageCounts: number[];
        settings: ProcessingSettings;
      }
    | { type: "cancel" };

  type WorkerResponse =
    | { type: "progress"; progress: number; message: string }
    | { type: "complete"; pdfBytes: ArrayBuffer }
    | { type: "error"; error: string };

  interface EnhancedProcessingState extends ProcessingState {
    isBackground?: boolean;
    backgroundStartTime?: number;
    estimatedTimeRemaining?: number;
  }

  interface AppNotificationOptions {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    requireInteraction?: boolean;
  }
}
