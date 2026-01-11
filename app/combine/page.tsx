"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  FileListCard,
  ProcessingResultModal,
  CombineButton,
  DragHint,
  ConfigCard,
} from "@/components/combine";
import { useFileManager } from "@/hooks/use-file-manager";
import { useProcessing } from "@/hooks/use-processing";

export default function CombinePage() {
  const router = useRouter();
  const {
    files,
    totalPages,
    validationError,
    handleFilesAdded,
    addMoreFiles,
    removeFile,
    resetFiles,
    setFilesDirectly,
    clearValidationError,
  } = useFileManager();

  const {
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
  } = useProcessing(files);

  useEffect(() => {
    if (typeof document === "undefined") return;

    if (isProcessing || result) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isProcessing, result]);

  const handleReorderFiles = (newFiles: typeof files) => {
    setFilesDirectly(newFiles);
  };

  const handleReset = () => {
    reset();
    resetFiles();
  };

  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h1 className="text-xl font-semibold">PDF Processing Error</h1>
            <p className="text-muted-foreground">
              Something went wrong while processing your PDFs. Please try again.
            </p>
            <Button onClick={() => router.push("/")}>Go Back Home</Button>
          </div>
        </div>
      }
    >
      <PageTransition>
        <div className="min-h-screen flex flex-col items-center py-6 sm:py-8 md:py-10 px-4">
          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-160 flex flex-col gap-4 sm:gap-6">
            <header className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="self-start -ml-2 text-sm sm:text-base"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Button>
            </header>

            <main className="flex flex-col gap-4 sm:gap-6">
              <ConfigCard
                settings={settings}
                onFilenameChange={updateFilename}
                onSettingsChange={updateSettings}
                disabled={isProcessing}
                hasFiles={files.length > 0}
              />

              <DragHint fileCount={files.length} />

              <FileListCard
                files={files}
                totalPages={totalPages}
                isProcessing={isProcessing}
                onFilesAdded={handleFilesAdded}
                onRemoveFile={removeFile}
                onReorderFiles={handleReorderFiles}
                onAddMoreFiles={addMoreFiles}
              />

              {validationError && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-destructive"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-destructive whitespace-pre-line">
                        {validationError}
                      </p>
                      <button
                        onClick={clearValidationError}
                        className="mt-2 text-xs text-destructive/70 hover:text-destructive underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {state.status === "error" && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-destructive"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-destructive whitespace-pre-line">
                        {state.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {files.length > 0 && <div className="h-16 sm:h-20" />}
            </main>
          </div>

          {files.length > 0 && (
            <CombineButton
              totalPages={totalPages}
              outputSheets={outputSheets}
              onClick={process}
              disabled={isProcessing || !!result}
            />
          )}

          <AnimatePresence>
            {(isProcessing || result) && (
              <ProcessingResultModal
                key="processing-result"
                isOpen={isProcessing || !!result}
                isComplete={!!result}
                state={state}
                currentFact={currentFact}
                filename={settings.filename}
                resultSize={result?.length ?? 0}
                outputSheets={outputSheets}
                onCancel={cancelProcessing}
                onDownload={handleDownload}
                onReset={handleReset}
              />
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </ErrorBoundary>
  );
}
