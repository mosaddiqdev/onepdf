export interface PDFFile {
  id: string
  file: File
  name: string
  size: number
  formattedSize: string
  pageCount?: number
}

export interface ProcessingSettings {
  filename: string
  pagesPerSheet: 2 | 3 | 4 | 6
  dpi: 150 | 300
  grayscale: boolean
  invertColors: boolean
  blackBackground: boolean
}

export interface ProcessingState {
  status: 'idle' | 'processing' | 'complete' | 'error'
  progress: number
  message: string
}
