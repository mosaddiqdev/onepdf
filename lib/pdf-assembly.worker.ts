/**
 * Web Worker for PDF assembly
 * Handles the heavy PDF creation work off the main thread
 */

import { PDFDocument } from 'pdf-lib'

// PDF points (72 DPI)
const A4_WIDTH_PT = 595.28
const A4_HEIGHT_PT = 841.89

export type WorkerMessage = {
  type: 'assemble'
  sheetPngBytes: ArrayBuffer[]
}

export type WorkerResponse = 
  | { type: 'progress'; progress: number; message: string }
  | { type: 'complete'; pdfBytes: ArrayBuffer }
  | { type: 'error'; error: string }

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, sheetPngBytes } = e.data

  if (type === 'assemble') {
    try {
      const respond = (data: WorkerResponse) => {
        if (data.type === 'complete') {
          // Transfer the ArrayBuffer to avoid copying
          self.postMessage(data, { transfer: [data.pdfBytes] })
        } else {
          self.postMessage(data)
        }
      }
      
      respond({ type: 'progress', progress: 0, message: 'Creating PDF document...' })
      
      const outputPdf = await PDFDocument.create()
      const totalSheets = sheetPngBytes.length

      for (let i = 0; i < totalSheets; i++) {
        const progress = Math.round(((i + 1) / totalSheets) * 90)
        respond({ type: 'progress', progress, message: `Embedding sheet ${i + 1} of ${totalSheets}...` })

        // Embed PNG image
        const pngImage = await outputPdf.embedPng(sheetPngBytes[i])
        
        // Add page to PDF
        const page = outputPdf.addPage([A4_WIDTH_PT, A4_HEIGHT_PT])
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: A4_WIDTH_PT,
          height: A4_HEIGHT_PT,
        })
      }

      respond({ type: 'progress', progress: 95, message: 'Finalizing PDF...' })
      
      const pdfBytes = await outputPdf.save()
      
      // Convert Uint8Array to ArrayBuffer for transfer
      const buffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer
      respond({ type: 'complete', pdfBytes: buffer })
      
    } catch (error) {
      self.postMessage({ 
        type: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      } as WorkerResponse)
    }
  }
}
