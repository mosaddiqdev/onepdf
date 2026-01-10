import { PDFDocument } from "pdf-lib";

let activeWorker: Worker | null = null;

export async function loadPDFFile(file: File): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}

export async function getPDFPageCount(file: File): Promise<number> {
  const arrayBuffer = await loadPDFFile(file);
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  return pdfDoc.getPageCount();
}

export function cancelProcessing(): void {
  if (activeWorker) {
    activeWorker.postMessage({ type: "cancel" });
    activeWorker.terminate();
    activeWorker = null;
  }
}

export async function processPDFs(
  files: PDFFile[],
  settings: ProcessingSettings,
  onProgress: (progress: number, message: string) => void,
  signal?: AbortSignal
): Promise<Uint8Array> {
  return new Promise(async (resolve, reject) => {
    if (activeWorker) {
      activeWorker.terminate();
      activeWorker = null;
    }

    if (signal?.aborted) {
      reject(new Error("Cancelled"));
      return;
    }

    onProgress(0, "Preparing files...");

    try {
      const fileBuffers: ArrayBuffer[] = [];
      const fileNames: string[] = [];
      const pageCounts: number[] = [];

      for (const file of files) {
        const buffer = await loadPDFFile(file.file);
        fileBuffers.push(buffer);
        fileNames.push(file.file.name);
        pageCounts.push(file.pageCount || 0);
      }

      const worker = new Worker(new URL("./pdf-render.worker.ts", import.meta.url), {
        type: "module",
      });

      activeWorker = worker;

      if (signal) {
        signal.addEventListener("abort", () => {
          worker.postMessage({ type: "cancel" });
          worker.terminate();
          activeWorker = null;
          reject(new Error("Cancelled"));
        });
      }

      worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const data = e.data;

        if (data.type === "progress") {
          onProgress(data.progress, data.message);
        } else if (data.type === "complete") {
          worker.terminate();
          activeWorker = null;
          resolve(new Uint8Array(data.pdfBytes));
        } else if (data.type === "error") {
          worker.terminate();
          activeWorker = null;
          reject(new Error(data.error));
        }
      };

      worker.onerror = (error) => {
        worker.terminate();
        activeWorker = null;
        reject(new Error(error.message || "Worker error"));
      };

      worker.postMessage(
        {
          type: "process",
          files: fileBuffers,
          fileNames,
          pageCounts,
          settings: {
            pagesPerSheet: settings.pagesPerSheet,
            dpi: settings.dpi,
            grayscale: settings.grayscale,
            invertColors: settings.invertColors,
            blackBackground: settings.blackBackground,
          },
        },
        fileBuffers
      );
    } catch (error) {
      reject(error);
    }
  });
}

export function downloadPDF(pdfBytes: Uint8Array, filename: string): void {
  const blob = new Blob([pdfBytes.slice()], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
