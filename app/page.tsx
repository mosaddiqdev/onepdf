'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { HeroSection } from '@/components/sections/HeroSection'
import { PageTransition } from '@/components/page-transition'
import { getPDFPageCount, formatFileSize, generateId } from '@/lib/pdf-processor'
import type { PDFFile } from '@/lib/types'

export default function Home() {
  const router = useRouter()

  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    const pdfFiles: PDFFile[] = await Promise.all(
      newFiles.map(async (file) => ({
        id: generateId(),
        file,
        name: file.name,
        size: file.size,
        formattedSize: formatFileSize(file.size),
        pageCount: await getPDFPageCount(file).catch(() => undefined),
      }))
    )
    
    // Store files in global variable (File objects can't be serialized)
    ;(window as any).uploadedFiles = pdfFiles
    router.push('/combine')
  }, [router])

  return (
    <PageTransition>
      <HeroSection onFilesAdded={handleFilesAdded} />
    </PageTransition>
  )
}
