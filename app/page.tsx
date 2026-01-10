"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Balancer from "react-wrap-balancer";
import { PageTransition } from "@/components/page-transition";
import { FileDropzone } from "@/components/file-dropzone";
import { GradientBackground } from "@/components/ui/gradient-background";
import { getPDFPageCount, formatFileSize, generateId } from "@/lib/pdf-processor";

export default function Home() {
  const router = useRouter();

  const handleFilesAdded = useCallback(
    async (newFiles: File[]) => {
      const pdfFiles: PDFFile[] = await Promise.all(
        newFiles.map(async (file) => ({
          id: generateId(),
          file,
          name: file.name,
          size: file.size,
          formattedSize: formatFileSize(file.size),
          pageCount: await getPDFPageCount(file).catch(() => undefined),
        }))
      );

      window.uploadedFiles = pdfFiles;
      router.push("/combine");
    },
    [router]
  );

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col relative bg-background">
        <GradientBackground />

        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm px-6">
          <div className="max-w-2xl mx-auto h-14 flex items-center justify-between border-b border-border/40">
            <span className="font-semibold text-foreground tracking-tight">
              <span className="text-primary">1</span>PDF
            </span>
            <a
              href="https://github.com/mosaddiqdev/onepdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </header>

        <main className="flex-1 flex flex-col justify-center px-6 py-12 sm:py-16 relative z-30">
          <div className="w-full max-w-2xl mx-auto space-y-10 sm:space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-foreground leading-[1.1]">
                <Balancer>Combine PDF Pages</Balancer>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                <Balancer>
                  Merge multiple pages onto single sheets. Save paper, save ink, save money.
                </Balancer>
              </p>
            </div>

            <FileDropzone onFilesAdded={handleFilesAdded} disabled={false} />
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
