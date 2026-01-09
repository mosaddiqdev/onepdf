'use client'

import { Lightbulb } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface DragHintProps {
  fileCount: number
}

export function DragHint({ fileCount }: DragHintProps) {
  const getMobileText = () => {
    if (fileCount > 1) return 'Tap and hold to reorder files'
    if (fileCount === 1) return 'Add more files to enable reordering'
    return 'Upload PDF files to get started'
  }

  const getDesktopText = () => {
    if (fileCount > 1) return 'Drag files by the handle to reorder'
    if (fileCount === 1) return 'Add more files to enable reordering'
    return 'Upload PDF files to combine them into sheets'
  }

  return (
    <div className="text-xs text-muted-foreground text-left px-1 flex items-center gap-1 -mb-2">
      <HugeiconsIcon
        icon={Lightbulb}
        className="w-3 h-3 text-primary"
      />
      <span className="sm:hidden">{getMobileText()}</span>
      <span className="hidden sm:inline">{getDesktopText()}</span>
    </div>
  )
}
