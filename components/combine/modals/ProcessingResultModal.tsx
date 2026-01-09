'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'motion/react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { ProcessingContent } from './ProcessingContent'
import { ResultContent } from './ResultContent'
import type { ProcessingState } from '@/lib/types'

interface ProcessingResultModalProps {
  isOpen: boolean
  isComplete: boolean
  state: ProcessingState
  currentFact: string
  filename: string
  resultSize: number
  outputSheets: number
  onCancel: () => void
  onDownload: () => void
  onReset: () => void
}

function useIsMobile() {
  // Start with null to avoid flash - don't render anything until we know
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

// Shared content component for both modal and drawer
function SharedContent({
  isComplete,
  state,
  currentFact,
  filename,
  resultSize,
  outputSheets,
  onCancel,
  onDownload,
  onReset,
}: Omit<ProcessingResultModalProps, 'isOpen'>) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isComplete ? (
        <ProcessingContent
          key="processing"
          state={state}
          currentFact={currentFact}
          onCancel={onCancel}
        />
      ) : (
        <ResultContent
          key="result"
          filename={filename}
          resultSize={resultSize}
          outputSheets={outputSheets}
          onDownload={onDownload}
          onReset={onReset}
        />
      )}
    </AnimatePresence>
  )
}

export function ProcessingResultModal({
  isOpen,
  isComplete,
  state,
  currentFact,
  filename,
  resultSize,
  outputSheets,
  onCancel,
  onDownload,
  onReset,
}: ProcessingResultModalProps) {
  const isMobile = useIsMobile()

  // Don't render anything until we know if mobile or not (prevents flash)
  if (isMobile === null || !isOpen) return null

  // Mobile: Use Drawer
  if (isMobile) {
    return (
      <Drawer
        open={isOpen}
        onOpenChange={() => {
          // Don't allow closing by drag/backdrop - only via buttons
        }}
        // Disable drag to dismiss completely
        dismissible={false}
      >
        <DrawerContent className="px-6 pb-8 pt-6" showHandle={false}>
          {/* Hidden title and description for accessibility */}
          <VisuallyHidden>
            <DrawerTitle>
              {isComplete ? 'PDF Ready' : 'Processing PDFs'}
            </DrawerTitle>
            <DrawerDescription>
              {isComplete
                ? 'Your combined PDF is ready to download'
                : 'Combining your PDF files into one document'}
            </DrawerDescription>
          </VisuallyHidden>

          <motion.div
            layout
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {!isComplete ? (
                <ProcessingContent
                  key="processing"
                  state={state}
                  currentFact={currentFact}
                  onCancel={onCancel}
                />
              ) : (
                <ResultContent
                  key="result"
                  filename={filename}
                  resultSize={resultSize}
                  outputSheets={outputSheets}
                  onDownload={() => {
                    onDownload()
                    onReset()
                  }}
                  onReset={onReset}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </DrawerContent>
      </Drawer>
    )
  }

  // Desktop: Use Modal
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <LayoutGroup>
        <motion.div
          className="bg-card rounded-2xl border border-border p-6 sm:p-8 max-w-sm md:max-w-md w-full mx-auto overflow-hidden"
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -8 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          layout
          layoutId="processing-result-modal"
        >
          <SharedContent
            isComplete={isComplete}
            state={state}
            currentFact={currentFact}
            filename={filename}
            resultSize={resultSize}
            outputSheets={outputSheets}
            onCancel={onCancel}
            onDownload={onDownload}
            onReset={onReset}
          />
        </motion.div>
      </LayoutGroup>
    </motion.div>
  )
}
