'use client'

interface CombineButtonProps {
  totalPages: number
  outputSheets: number
  onClick: () => void
  disabled?: boolean
}

export function CombineButton({ totalPages, outputSheets, onClick, disabled }: CombineButtonProps) {
  return (
    <div className="fixed bottom-2 sm:bottom-4 left-4 right-4 z-20 max-w-sm sm:max-w-md md:max-w-lg lg:max-w-[640px] mx-auto">
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-full group relative flex items-center justify-between p-1 pl-4 sm:pl-6 pr-3 sm:pr-4 bg-primary text-primary-foreground rounded-xl transition-all duration-200 active:scale-[0.98] hover:bg-primary/90 active:bg-primary/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:bg-primary"
      >
        <div className="flex flex-col items-start py-2 sm:py-3">
          <span className="text-base sm:text-lg font-bold">Combine Files</span>
          <span className="text-xs font-medium text-primary-foreground/80">
            <span className="hidden sm:inline">
              {totalPages} Pages → {outputSheets} Sheets (3/sheet, grayscale, inverted)
            </span>
            <span className="sm:hidden">
              {totalPages} Pages → {outputSheets} Sheets
            </span>
          </span>
        </div>
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg group-hover:bg-white/30 group-active:bg-white/40 transition-colors">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </button>
    </div>
  )
}
