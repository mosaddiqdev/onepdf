'use client'

import Balancer from 'react-wrap-balancer'
import { FileDropzone } from '@/components/file-dropzone'

interface HeroSectionProps {
  onFilesAdded: (files: File[]) => void
}

// Gradient blob SVG background
function GradientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top-left blob */}
      <svg
        className="absolute w-[500px] h-[500px] -top-[100px] left-[10%]"
        viewBox="0 0 500 500"
        fill="none"
      >
        <defs>
          <radialGradient id="blob1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#DC4C4C" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#DC4C4C" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="250" cy="250" rx="220" ry="200" fill="url(#blob1)" />
      </svg>
      
      {/* Right side blob */}
      <svg
        className="absolute w-[400px] h-[400px] top-[30%] -right-[80px]"
        viewBox="0 0 400 400"
        fill="none"
      >
        <defs>
          <radialGradient id="blob2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#DC4C4C" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#DC4C4C" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="200" cy="200" rx="180" ry="160" fill="url(#blob2)" />
      </svg>
      
      {/* Bottom blob */}
      <svg
        className="absolute w-[600px] h-[600px] -bottom-[200px] left-[20%]"
        viewBox="0 0 600 600"
        fill="none"
      >
        <defs>
          <radialGradient id="blob3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#DC4C4C" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#DC4C4C" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="300" cy="300" rx="260" ry="240" fill="url(#blob3)" />
      </svg>
    </div>
  )
}

export function HeroSection({ onFilesAdded }: HeroSectionProps) {
  return (
    <div className="h-screen flex flex-col overflow-hidden relative bg-background">
      {/* Gradient background blobs */}
      <GradientBackground />
      
      {/* Main Hero Content */}
      <section className="relative flex-1 flex flex-col px-6 pt-12 pb-6 sm:pt-16 sm:pb-8 md:justify-center md:pt-0 md:pb-0">
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 sm:gap-10 md:gap-12">
          
          {/* Hero Text */}
          <div className="text-center space-y-4 sm:space-y-5">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground leading-[1.1]">
              <Balancer>Combine PDF Pages</Balancer>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-md sm:max-w-lg mx-auto leading-relaxed">
              <Balancer>
                Merge multiple pages onto single sheets. Save paper, save ink, save money.
              </Balancer>
            </p>
          </div>

          {/* File Dropzone */}
          <div className="w-full">
            <FileDropzone onFilesAdded={onFilesAdded} disabled={false} />
          </div>

        </div>
      </section>

      {/* Footer with blur */}
      <footer className="shrink-0 relative z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 sm:py-5 border-t border-border/40 backdrop-blur-sm bg-background/60">
          <div className="flex items-center justify-center sm:justify-between gap-3 sm:gap-4 text-sm text-muted-foreground">
            {/* Mobile: Single row with all items */}
            <div className="flex items-center gap-3 sm:hidden">
              <span className="font-medium text-foreground">1PDF</span>
              <span className="text-border">·</span>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                GitHub
              </a>
              <span className="text-border">·</span>
              <a 
                href="https://pw.live" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                PW
              </a>
            </div>
            
            {/* Desktop: Two column layout */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-medium text-foreground">1PDF</span>
              <span className="text-border">·</span>
              <span>Built for students who print lecture notes</span>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                GitHub
              </a>
              <a 
                href="https://pw.live" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                PW
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}