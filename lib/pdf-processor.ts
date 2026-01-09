import { PDFDocument } from 'pdf-lib'
import type { PDFFile, ProcessingSettings } from './types'
import type { WorkerResponse } from './pdf-assembly.worker'

// Processing timeout constants - configurable via environment variables
const PROCESSING_TIMEOUT = (parseInt(process.env.NEXT_PUBLIC_PROCESSING_TIMEOUT_MINUTES || '30') * 60 * 1000) // Default 30 minutes
const FILE_LOAD_TIMEOUT = (parseInt(process.env.NEXT_PUBLIC_FILE_LOAD_TIMEOUT_SECONDS || '60') * 1000) // Default 1 minute per file
const PAGE_RENDER_TIMEOUT = (parseInt(process.env.NEXT_PUBLIC_PAGE_RENDER_TIMEOUT_SECONDS || '30') * 1000) // Default 30 seconds per page

// A4 dimensions - now dynamic based on DPI
const getA4Dimensions = (dpi: number) => ({
  width: Math.round(210 * dpi / 25.4),
  height: Math.round(297 * dpi / 25.4)
})

// Layout settings
const PADDING = 40
const GAP = 24

// Track active worker for cancellation
let activeWorker: Worker | null = null

/**
 * Create a timeout promise that rejects after specified time
 */
function createTimeout(ms: number, message: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms)
  })
}

/**
 * Load a File object as ArrayBuffer with timeout
 */
export async function loadPDFFile(file: File): Promise<ArrayBuffer> {
  const loadPromise = new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
    reader.readAsArrayBuffer(file)
  })

  const timeoutPromise = createTimeout(
    FILE_LOAD_TIMEOUT, 
    `Timeout loading file: ${file.name}. File may be too large or corrupted.`
  )

  return Promise.race([loadPromise, timeoutPromise])
}

/**
 * Get page count from a PDF file with timeout
 */
export async function getPDFPageCount(file: File): Promise<number> {
  const loadPromise = async () => {
    const arrayBuffer = await loadPDFFile(file)
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    return pdfDoc.getPageCount()
  }

  const timeoutPromise = createTimeout(
    FILE_LOAD_TIMEOUT,
    `Timeout getting page count for: ${file.name}`
  )

  return Promise.race([loadPromise(), timeoutPromise])
}

/**
 * Render a PDF page to canvas using pdfjs-dist
 */
async function renderPageToCanvas(
  pdfDoc: any,
  pageNum: number,
  maxWidth: number,
  maxHeight: number
): Promise<HTMLCanvasElement> {
  const page = await pdfDoc.getPage(pageNum)
  const viewport = page.getViewport({ scale: 1 })
  
  const scaleX = maxWidth / viewport.width
  const scaleY = maxHeight / viewport.height
  const scale = Math.min(scaleX, scaleY)
  
  const scaledViewport = page.getViewport({ scale })
  
  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(scaledViewport.width)
  canvas.height = Math.floor(scaledViewport.height)
  
  const ctx = canvas.getContext('2d')!
  await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise
  
  return canvas
}

/**
 * Apply grayscale and/or invert filters using canvas filter (GPU accelerated)
 */
function applyFilters(
  canvas: HTMLCanvasElement,
  grayscale: boolean,
  invert: boolean
): void {
  if (!grayscale && !invert) return
  
  const ctx = canvas.getContext('2d')!
  const filters: string[] = []
  
  if (grayscale) filters.push('grayscale(1)')
  if (invert) filters.push('invert(1)')
  
  // Use CSS filter - GPU accelerated, non-blocking
  ctx.filter = filters.join(' ')
  ctx.drawImage(canvas, 0, 0)
  ctx.filter = 'none'
}

/**
 * Convert canvas to PNG bytes
 * Uses OffscreenCanvas.convertToBlob when available (async, non-blocking)
 * Falls back to toBlob for older browsers
 */
async function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<ArrayBuffer> {
  // Transfer to OffscreenCanvas for async convertToBlob
  const offscreen = new OffscreenCanvas(canvas.width, canvas.height)
  const ctx = offscreen.getContext('2d')!
  ctx.drawImage(canvas, 0, 0)
  
  const blob = await offscreen.convertToBlob({ type: 'image/png' })
  return blob.arrayBuffer()
}

/**
 * Assemble PDF in Web Worker (off main thread)
 */
function assemblePdfInWorker(
  sheetPngBytes: ArrayBuffer[],
  onProgress: (progress: number, message: string) => void,
  signal?: AbortSignal
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./pdf-assembly.worker.ts', import.meta.url),
      { type: 'module' }
    )
    
    // Track active worker for cancellation
    activeWorker = worker
    
    // Handle abort signal
    if (signal) {
      signal.addEventListener('abort', () => {
        worker.terminate()
        activeWorker = null
        reject(new Error('Cancelled'))
      })
    }
    
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const data = e.data
      
      if (data.type === 'progress') {
        onProgress(data.progress, data.message)
      } else if (data.type === 'complete') {
        worker.terminate()
        activeWorker = null
        resolve(new Uint8Array(data.pdfBytes))
      } else if (data.type === 'error') {
        worker.terminate()
        activeWorker = null
        reject(new Error(data.error))
      }
    }
    
    worker.onerror = (error) => {
      worker.terminate()
      activeWorker = null
      reject(new Error(error.message))
    }
    
    // Transfer ArrayBuffers to worker (zero-copy)
    worker.postMessage(
      { type: 'assemble', sheetPngBytes },
      sheetPngBytes
    )
  })
}

/**
 * Cancel any ongoing processing
 */
export function cancelProcessing(): void {
  if (activeWorker) {
    activeWorker.terminate()
    activeWorker = null
  }
}

/**
 * Main PDF processing function with timeout handling
 * Combines multiple PDF pages into single sheets with filters applied
 */
export async function processPDFs(
  files: PDFFile[],
  settings: ProcessingSettings,
  onProgress: (progress: number, message: string) => void,
  signal?: AbortSignal
): Promise<Uint8Array> {
  // Wrap the entire processing in a timeout
  const processingPromise = async (): Promise<Uint8Array> => {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
    
    // Helper to check if cancelled
    const checkCancelled = () => {
      if (signal?.aborted) {
        throw new Error('Cancelled')
      }
    }
    
    onProgress(0, 'Loading PDF files...')
    checkCancelled()
    
    const { pagesPerSheet, dpi, grayscale, invertColors, blackBackground } = settings
    
    const { width: A4_WIDTH_PX, height: A4_HEIGHT_PX } = getA4Dimensions(dpi)
    const availableWidth = A4_WIDTH_PX - (PADDING * 2)
    const totalGaps = GAP * (pagesPerSheet - 1)
    const slotHeight = Math.floor((A4_HEIGHT_PX - (PADDING * 2) - totalGaps) / pagesPerSheet)
    
    const pageCanvases: HTMLCanvasElement[] = []
    let totalPages = 0
    
    for (const file of files) {
      totalPages += file.pageCount || 0
    }
    
    let processedPages = 0
    
    // Phase 1: Render all PDF pages to canvases (main thread - needs DOM)
    for (const file of files) {
      checkCancelled()
      const arrayBuffer = await loadPDFFile(file.file)
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        checkCancelled()
        processedPages++
        const progress = Math.round((processedPages / totalPages) * 40)
        onProgress(progress, `Rendering page ${processedPages} of ${totalPages}...`)
        
        // Add timeout for individual page rendering
        const pageRenderPromise = renderPageToCanvas(pdfDoc, pageNum, availableWidth, slotHeight)
        const pageTimeoutPromise = createTimeout(
          PAGE_RENDER_TIMEOUT,
          `Timeout rendering page ${pageNum} of ${file.file.name}`
        )
        
        const canvas = await Promise.race([pageRenderPromise, pageTimeoutPromise])
        
        // Apply filters if needed
        if (grayscale || invertColors) {
          applyFilters(canvas, grayscale, invertColors)
        }
        
        pageCanvases.push(canvas)
      }
    }
    
    // Continue with rest of processing...
    checkCancelled()
    
    // Phase 2: Combine pages into sheet canvases and convert to PNG
    onProgress(45, 'Creating sheets...')
    
    const totalOutputSheets = Math.ceil(pageCanvases.length / pagesPerSheet)
    const sheetPngBytes: ArrayBuffer[] = []
    
    for (let sheetIdx = 0; sheetIdx < totalOutputSheets; sheetIdx++) {
      checkCancelled()
      const progress = 45 + Math.round((sheetIdx / totalOutputSheets) * 20)
      onProgress(progress, `Creating sheet ${sheetIdx + 1} of ${totalOutputSheets}...`)
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      const outputCanvas = document.createElement('canvas')
      outputCanvas.width = A4_WIDTH_PX
      outputCanvas.height = A4_HEIGHT_PX
      const ctx = outputCanvas.getContext('2d')!
      
      ctx.fillStyle = blackBackground ? '#000000' : '#ffffff'
      ctx.fillRect(0, 0, A4_WIDTH_PX, A4_HEIGHT_PX)
      
      const startIdx = sheetIdx * pagesPerSheet
      
      for (let slot = 0; slot < pagesPerSheet; slot++) {
        const pageIdx = startIdx + slot
        if (pageIdx >= pageCanvases.length) break
        
        const pageCanvas = pageCanvases[pageIdx]
        const x = PADDING + Math.floor((availableWidth - pageCanvas.width) / 2)
        const y = PADDING + slot * (slotHeight + GAP) + Math.floor((slotHeight - pageCanvas.height) / 2)
        
        ctx.drawImage(pageCanvas, x, y)
      }
      
      // Use async convertToBlob instead of blocking toDataURL
      const pngBytes = await canvasToPngBytes(outputCanvas)
      sheetPngBytes.push(pngBytes)
      
      // Clean up
      outputCanvas.width = 0
      outputCanvas.height = 0
    }
    
    // Clean up page canvases
    pageCanvases.forEach(c => { c.width = 0; c.height = 0 })
    
    // Phase 3: Assemble PDF in Web Worker (off main thread!)
    onProgress(65, 'Assembling PDF...')
    
    const pdfBytes = await assemblePdfInWorker(sheetPngBytes, (workerProgress, message) => {
      const progress = 65 + Math.round(workerProgress * 0.35)
      onProgress(progress, message)
    }, signal)
    
    onProgress(100, 'Complete!')
    
    return pdfBytes
  }

  // Race the processing against timeout
  const timeoutPromise = createTimeout(
    PROCESSING_TIMEOUT,
    `Processing timeout after ${PROCESSING_TIMEOUT / 60000} minutes. Please try with fewer files or pages.`
  )

  return Promise.race([processingPromise(), timeoutPromise])
}

/**
 * Download PDF bytes as a file
 */
export function downloadPDF(pdfBytes: Uint8Array, filename: string): void {
  const blob = new Blob([pdfBytes.slice()], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}
