'use client'

import { motion } from 'motion/react'
import Balancer from 'react-wrap-balancer'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { Lightbulb } from '@hugeicons/core-free-icons'
import type { ProcessingState } from '@/lib/types'

interface ProcessingContentProps {
  state: ProcessingState
  currentFact: string
  onCancel: () => void
}

export function ProcessingContent({ state, currentFact, onCancel }: ProcessingContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="text-center space-y-4 sm:space-y-6"
    >
      {/* Title */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-semibold">Processing PDFs</h3>
        <div className="text-sm text-muted-foreground tabular-nums">
          <Balancer>
            {state.message}
          </Balancer>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 sm:space-y-3">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span className="font-mono text-primary tabular-nums">{Math.round(state.progress)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 sm:h-3 overflow-hidden">
          <div
            className="bg-primary h-2 sm:h-3 rounded-full transition-all duration-200 ease-out relative"
            style={{ width: `${state.progress}%` }}
          >
            {/* Shimmer effect at the leading edge */}
            {state.progress > 0 && state.progress < 100 && (
              <div className="absolute top-0 right-0 w-4 h-full bg-gradient-to-r from-transparent to-white/40 rounded-r-full animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* Fun Fact */}
      <div className="bg-muted/50 rounded-xl p-3 sm:p-4 text-left">
        <div className="flex items-center gap-2 mb-2">
          <HugeiconsIcon
            icon={Lightbulb}
            className="w-3 h-3 sm:w-4 sm:h-4 text-primary shrink-0"
          />
          <span className="text-xs font-medium text-muted-foreground">Did you know?</span>
        </div>
        <p className="text-xs sm:text-sm">
          <Balancer>{currentFact}</Balancer>
        </p>
      </div>

      {/* Footer with Cancel */}
      <div className="pt-3 border-t border-border/50 space-y-3">
        <p className="text-xs text-muted-foreground text-center">
          <Balancer>Keep this tab open until processing completes.</Balancer>
        </p>
        <Button
          variant="ghost"
          onClick={onCancel}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Button>
      </div>
    </motion.div>
  )
}