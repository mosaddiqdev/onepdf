'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { processPDFs, downloadPDF, cancelProcessing as cancelWorker } from '@/lib/pdf-processor'
import { validateSettings, validatePageCount, sanitizeFilename, formatValidationErrors } from '@/lib/validation'
import { getRandomFact } from '@/lib/fun-facts'
import type { PDFFile, ProcessingSettings, ProcessingState } from '@/lib/types'

const DEFAULT_SETTINGS: ProcessingSettings = {
  filename: '',
  pagesPerSheet: 3,
  dpi: 150,
  grayscale: true,
  invertColors: true,
  blackBackground: false,
}

// Load settings from localStorage
const loadSettings = (): ProcessingSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  
  try {
    const saved = localStorage.getItem('pdf-processing-settings')
    if (saved) {
      const parsed = JSON.parse(saved)
      // Merge with defaults to handle new settings
      return { ...DEFAULT_SETTINGS, ...parsed, filename: '' } // Always reset filename
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error)
  }
  
  return DEFAULT_SETTINGS
}

// Save settings to localStorage
const saveSettings = (settings: ProcessingSettings) => {
  if (typeof window === 'undefined') return
  
  try {
    // Don't save filename
    const { filename, ...settingsToSave } = settings
    localStorage.setItem('pdf-processing-settings', JSON.stringify(settingsToSave))
  } catch (error) {
    console.warn('Failed to save settings to localStorage:', error)
  }
}

export function useProcessing(files: PDFFile[]) {
  const [settings, setSettings] = useState<ProcessingSettings>(loadSettings)
  const [state, setState] = useState<ProcessingState>({ status: 'idle', progress: 0, message: '' })
  const [result, setResult] = useState<Uint8Array | null>(null)
  const [currentFact, setCurrentFact] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)

  const isProcessing = state.status === 'processing'
  const outputSheets = Math.ceil(
    files.reduce((sum, f) => sum + (f.pageCount || 0), 0) / settings.pagesPerSheet
  )

  // Update filename when files change (always use first file's name)
  useEffect(() => {
    if (files.length > 0) {
      const firstName = files[0].name.replace(/\.pdf$/i, '')
      setSettings(prev => ({ ...prev, filename: firstName }))
    } else {
      setSettings(prev => ({ ...prev, filename: '' }))
    }
  }, [files])

  // Generate random fact when processing starts
  useEffect(() => {
    if (isProcessing) {
      setCurrentFact(getRandomFact())
    }
  }, [isProcessing])

  const updateFilename = useCallback((filename: string) => {
    setSettings(prev => ({ ...prev, filename }))
  }, [])

  const updateSettings = useCallback((updates: Partial<ProcessingSettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates }
      saveSettings(newSettings)
      return newSettings
    })
  }, [])

  const process = useCallback(async () => {
    if (files.length === 0) return
    
    // Validate settings before processing
    const settingsErrors = validateSettings(settings)
    if (settingsErrors.length > 0) {
      setState({ 
        status: 'error', 
        progress: 0, 
        message: formatValidationErrors(settingsErrors) 
      })
      return
    }

    // Validate page count
    const totalPages = files.reduce((sum, f) => sum + (f.pageCount || 0), 0)
    const pageCountError = validatePageCount(totalPages, settings.pagesPerSheet)
    if (pageCountError) {
      setState({ 
        status: 'error', 
        progress: 0, 
        message: pageCountError.message 
      })
      return
    }

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(settings.filename)
    if (sanitizedFilename !== settings.filename) {
      setSettings(prev => ({ ...prev, filename: sanitizedFilename }))
    }
    
    // Create new abort controller for this processing run
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal
    
    setState({ status: 'processing', progress: 0, message: 'Starting...' })
    setResult(null)
    
    try {
      const res = await processPDFs(files, settings, (progress, message) => {
        setState({ status: 'processing', progress, message })
      }, signal)
      setResult(res)
      setState({ status: 'complete', progress: 100, message: 'Done!' })
    } catch (e) {
      // Don't show error if cancelled
      if (e instanceof Error && e.message === 'Cancelled') {
        return
      }
      console.error('Processing error:', e)
      setState({ 
        status: 'error', 
        progress: 0, 
        message: e instanceof Error ? e.message : 'An unexpected error occurred during processing' 
      })
    } finally {
      abortControllerRef.current = null
    }
  }, [files, settings])

  const handleDownload = useCallback(() => {
    if (result) {
      downloadPDF(result, settings.filename)
    }
  }, [result, settings.filename])

  const cancelProcessing = useCallback(() => {
    // Abort the processing
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    // Also terminate any active worker
    cancelWorker()
    // Reset state
    setState({ status: 'idle', progress: 0, message: '' })
    setResult(null)
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setState({ status: 'idle', progress: 0, message: '' })
    // Reset only filename, preserve other user settings
    setSettings(prev => ({ ...prev, filename: '' }))
  }, [])

  return {
    settings,
    state,
    result,
    currentFact,
    isProcessing,
    outputSheets,
    updateFilename,
    updateSettings,
    process,
    handleDownload,
    cancelProcessing,
    reset,
    setResult,
  }
}
