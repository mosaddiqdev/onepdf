'use client'

import Balancer from 'react-wrap-balancer'

interface EmptyStateProps {
  onFilesAdded: (files: File[]) => void
}

export function EmptyState({ onFilesAdded }: EmptyStateProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('bg-primary/5')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('bg-primary/5')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('bg-primary/5')
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    )
    if (files.length > 0) {
      onFilesAdded(files)
    }
  }

  return (
    <div 
      className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center transition-colors"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 sm:mb-6">
        <svg 
          className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/50" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={1.5}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" 
          />
        </svg>
      </div>
      <h3 className="text-sm sm:text-base font-medium text-muted-foreground mb-2">
        No PDF files yet
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground/70 max-w-xs">
        <Balancer>
          Click <span className="hidden sm:inline">"Add Files"</span><span className="sm:hidden">"Add"</span> above or drag and drop PDF files here to get started
        </Balancer>
      </p>
    </div>
  )
}
