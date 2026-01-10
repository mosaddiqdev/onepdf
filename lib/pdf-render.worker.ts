import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";

class OffscreenCanvasFactory {
  create(width: number, height: number) {
    if (width <= 0 || height <= 0) {
      throw new Error("Invalid canvas size");
    }
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("2d");
    return { canvas, context };
  }

  reset(
    canvasAndContext: {
      canvas: OffscreenCanvas;
      context: OffscreenCanvasRenderingContext2D | null;
    },
    width: number,
    height: number
  ) {
    if (!canvasAndContext.canvas) {
      throw new Error("Canvas is not specified");
    }
    if (width <= 0 || height <= 0) {
      throw new Error("Invalid canvas size");
    }
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }

  destroy(canvasAndContext: {
    canvas: OffscreenCanvas | null;
    context: OffscreenCanvasRenderingContext2D | null;
  }) {
    if (!canvasAndContext.canvas) {
      throw new Error("Canvas is not specified");
    }
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

if (typeof document === "undefined") {
  (globalThis as Record<string, unknown>).document = {
    createElement: () => ({
      style: {},
      setAttribute: () => {},
      getAttribute: () => null,
      appendChild: () => {},
      removeChild: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
    createElementNS: () => ({
      style: {},
      setAttribute: () => {},
      getAttribute: () => null,
      appendChild: () => {},
      removeChild: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
    head: { appendChild: () => {}, removeChild: () => {} },
    body: { appendChild: () => {}, removeChild: () => {} },
  };
}

const getA4Dimensions = (dpi: number) => ({
  width: Math.round((210 * dpi) / 25.4),
  height: Math.round((297 * dpi) / 25.4),
});

const PADDING = 40;
const GAP = 24;
const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;

function respond(data: WorkerResponse) {
  if (data.type === "complete") {
    self.postMessage(data, { transfer: [data.pdfBytes] });
  } else {
    self.postMessage(data);
  }
}

async function renderPageToOffscreenCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNum: number,
  maxWidth: number,
  maxHeight: number
): Promise<OffscreenCanvas> {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1 });

  const scaleX = maxWidth / viewport.width;
  const scaleY = maxHeight / viewport.height;
  const scale = Math.min(scaleX, scaleY);

  const scaledViewport = page.getViewport({ scale });

  const canvas = new OffscreenCanvas(
    Math.floor(scaledViewport.width),
    Math.floor(scaledViewport.height)
  );

  const ctx = canvas.getContext("2d")!;

  await page.render({
    canvasContext: ctx as unknown as CanvasRenderingContext2D,
    viewport: scaledViewport,
    intent: "display",
    canvas: canvas as unknown as HTMLCanvasElement,
  }).promise;

  return canvas;
}

function applyFilters(canvas: OffscreenCanvas, grayscale: boolean, invert: boolean): void {
  if (!grayscale && !invert) return;

  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (grayscale) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = g = b = gray;
    }

    if (invert) {
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  ctx.putImageData(imageData, 0, 0);
}

async function canvasToPngBytes(canvas: OffscreenCanvas): Promise<ArrayBuffer> {
  const blob = await canvas.convertToBlob({ type: "image/png" });
  return blob.arrayBuffer();
}

async function processFiles(
  files: ArrayBuffer[],
  fileNames: string[],
  pageCounts: number[],
  settings: ProcessingSettings
): Promise<Uint8Array> {
  const { pagesPerSheet, dpi, grayscale, invertColors, blackBackground } = settings;

  const { width: A4_WIDTH_PX, height: A4_HEIGHT_PX } = getA4Dimensions(dpi);

  const getGridLayout = (pages: number): { cols: number; rows: number } => {
    switch (pages) {
      case 2:
        return { cols: 2, rows: 1 };
      case 3:
        return { cols: 1, rows: 3 };
      case 4:
        return { cols: 2, rows: 2 };
      case 6:
        return { cols: 2, rows: 3 };
      default:
        return { cols: 1, rows: pages };
    }
  };

  const { cols, rows } = getGridLayout(pagesPerSheet);

  const availableWidth = A4_WIDTH_PX - PADDING * 2;
  const availableHeight = A4_HEIGHT_PX - PADDING * 2;
  const horizontalGaps = GAP * (cols - 1);
  const verticalGaps = GAP * (rows - 1);
  const slotWidth = Math.floor((availableWidth - horizontalGaps) / cols);
  const slotHeight = Math.floor((availableHeight - verticalGaps) / rows);

  const pageCanvases: OffscreenCanvas[] = [];
  const totalPages = pageCounts.reduce((sum, count) => sum + count, 0);
  let processedPages = 0;

  respond({ type: "progress", progress: 0, message: "Loading PDF files..." });

  for (let fileIdx = 0; fileIdx < files.length; fileIdx++) {
    const fileData = files[fileIdx];
    const fileName = fileNames[fileIdx];

    respond({
      type: "progress",
      progress: Math.round((processedPages / totalPages) * 40),
      message: `Loading ${fileName}...`,
    });

    try {
      const pdfDoc = await pdfjsLib.getDocument({
        data: fileData,
        CanvasFactory: OffscreenCanvasFactory,
        useSystemFonts: false,
        disableFontFace: true,
        isEvalSupported: false,
        disableAutoFetch: true,
        disableStream: true,
        disableRange: true,
        verbosity: 0,
        enableXfa: false,
        wasmUrl: "/pdfjs/",
        useWorkerFetch: true,
        useWasm: true,
        isOffscreenCanvasSupported: true,
        cMapUrl: undefined,
        standardFontDataUrl: undefined,
      }).promise;

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        processedPages++;
        const progress = Math.round((processedPages / totalPages) * 40);
        respond({
          type: "progress",
          progress,
          message: `Rendering page ${processedPages} of ${totalPages}...`,
        });

        try {
          const canvas = await renderPageToOffscreenCanvas(pdfDoc, pageNum, slotWidth, slotHeight);

          if (grayscale || invertColors) {
            applyFilters(canvas, grayscale, invertColors);
          }

          pageCanvases.push(canvas);
        } catch (error) {
          console.error(`Error rendering page ${pageNum} of ${fileName}:`, error);
          if (error instanceof Error) {
            console.error("Error name:", error.name);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
          }
          respond({
            type: "progress",
            progress,
            message: `Warning: Skipped page ${pageNum} of ${fileName} due to rendering error`,
          });
        }
      }
    } catch (error) {
      console.error(`Error loading ${fileName}:`, error);
      throw new Error(
        `Failed to load ${fileName}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  if (pageCanvases.length === 0) {
    throw new Error("No pages could be rendered from the provided PDF files");
  }

  respond({ type: "progress", progress: 45, message: "Creating sheets..." });

  const totalOutputSheets = Math.ceil(pageCanvases.length / pagesPerSheet);
  const sheetPngBytes: ArrayBuffer[] = [];

  for (let sheetIdx = 0; sheetIdx < totalOutputSheets; sheetIdx++) {
    const progress = 45 + Math.round((sheetIdx / totalOutputSheets) * 25);
    respond({
      type: "progress",
      progress,
      message: `Creating sheet ${sheetIdx + 1} of ${totalOutputSheets}...`,
    });

    const outputCanvas = new OffscreenCanvas(A4_WIDTH_PX, A4_HEIGHT_PX);
    const ctx = outputCanvas.getContext("2d")!;

    ctx.fillStyle = blackBackground ? "#000000" : "#ffffff";
    ctx.fillRect(0, 0, A4_WIDTH_PX, A4_HEIGHT_PX);

    const startIdx = sheetIdx * pagesPerSheet;

    for (let slot = 0; slot < pagesPerSheet; slot++) {
      const pageIdx = startIdx + slot;
      if (pageIdx >= pageCanvases.length) break;

      const pageCanvas = pageCanvases[pageIdx];

      const col = slot % cols;
      const row = Math.floor(slot / cols);

      const slotX = PADDING + col * (slotWidth + GAP);
      const slotY = PADDING + row * (slotHeight + GAP);

      const x = slotX + Math.floor((slotWidth - pageCanvas.width) / 2);
      const y = slotY + Math.floor((slotHeight - pageCanvas.height) / 2);

      ctx.drawImage(pageCanvas, x, y);
    }

    const pngBytes = await canvasToPngBytes(outputCanvas);
    sheetPngBytes.push(pngBytes);
  }

  pageCanvases.length = 0;

  respond({ type: "progress", progress: 70, message: "Assembling PDF..." });

  const outputPdf = await PDFDocument.create();

  for (let i = 0; i < sheetPngBytes.length; i++) {
    const progress = 70 + Math.round(((i + 1) / sheetPngBytes.length) * 25);
    respond({
      type: "progress",
      progress,
      message: `Embedding sheet ${i + 1} of ${sheetPngBytes.length}...`,
    });

    const pngImage = await outputPdf.embedPng(sheetPngBytes[i]);
    const page = outputPdf.addPage([A4_WIDTH_PT, A4_HEIGHT_PT]);
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: A4_WIDTH_PT,
      height: A4_HEIGHT_PT,
    });
  }

  respond({ type: "progress", progress: 98, message: "Finalizing PDF..." });

  const pdfBytes = await outputPdf.save();

  respond({ type: "progress", progress: 100, message: "Complete!" });

  return pdfBytes;
}

let isProcessing = false;
let shouldCancel = false;

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type } = e.data;

  if (type === "cancel") {
    shouldCancel = true;
    return;
  }

  if (type === "process") {
    if (isProcessing) {
      respond({ type: "error", error: "Already processing" });
      return;
    }

    isProcessing = true;
    shouldCancel = false;

    try {
      const { files, fileNames, pageCounts, settings } = e.data;
      const pdfBytes = await processFiles(files, fileNames, pageCounts, settings);

      if (shouldCancel) {
        respond({ type: "error", error: "Cancelled" });
      } else {
        const buffer = pdfBytes.buffer.slice(
          pdfBytes.byteOffset,
          pdfBytes.byteOffset + pdfBytes.byteLength
        ) as ArrayBuffer;
        respond({ type: "complete", pdfBytes: buffer });
      }
    } catch (error) {
      respond({
        type: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      isProcessing = false;
    }
  }
};
