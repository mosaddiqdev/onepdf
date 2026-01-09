'use client'

import { motion } from 'motion/react'
import Balancer from 'react-wrap-balancer'
import { Button } from '@/components/ui/button'
import { formatFileSize } from '@/lib/pdf-processor'

interface ResultContentProps {
  filename: string
  resultSize: number
  outputSheets: number
  onDownload: () => void
  onReset: () => void
}

export function ResultContent({
  filename,
  resultSize,
  outputSheets,
  onDownload,
  onReset,
}: ResultContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Success Icon & Title */}
      <div className="text-center space-y-3 sm:space-y-4">
        <motion.div 
          className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-emerald-500/10 rounded-full flex items-center justify-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <motion.path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            />
          </svg>
        </motion.div>
        <div>
          <h3 className="text-lg sm:text-xl font-semibold">PDF Ready!</h3>
          <p className="text-sm text-muted-foreground mt-1">
            <Balancer>Your combined PDF has been generated successfully</Balancer>
          </p>
        </div>
      </div>
      
      {/* File Details */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-muted/30 rounded-xl border border-border/50">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-xs sm:text-sm truncate">{filename}.pdf</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(resultSize)} • {outputSheets} sheet{outputSheets !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
        <Button 
          onClick={onDownload}
          className="w-full sm:flex-1 h-12 text-base font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </Button>
        <Button 
          variant="outline" 
          onClick={onReset} 
          className="w-full sm:flex-1 h-12 text-base font-medium"
        >
          Start Over
        </Button>
      </div>
    </motion.div>
  )
}
