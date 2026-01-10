"use client";

import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { ProcessingContent } from "./ProcessingContent";
import { ResultContent } from "./ResultContent";
import { useMobile } from "@/hooks/use-mobile";

interface ProcessingResultModalProps {
  isOpen: boolean;
  isComplete: boolean;
  state: ProcessingState;
  currentFact: string;
  filename: string;
  resultSize: number;
  outputSheets: number;
  onCancel: () => void;
  onDownload: () => void;
  onReset: () => void;
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
  const isMobile = useMobile();

  if (isMobile === null || !isOpen) return null;

  const renderContent = () => (
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
            onDownload();
            onReset();
          }}
          onReset={onReset}
        />
      )}
    </AnimatePresence>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={() => {}} dismissible={false}>
        <DrawerContent className="px-6 pb-8 pt-6" showHandle={false}>
          <VisuallyHidden>
            <DrawerTitle>{isComplete ? "PDF Ready" : "Processing PDFs"}</DrawerTitle>
            <DrawerDescription>
              {isComplete
                ? "Your combined PDF is ready to download"
                : "Combining your PDF files into one document"}
            </DrawerDescription>
          </VisuallyHidden>

          <motion.div layout transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}>
            {renderContent()}
          </motion.div>
        </DrawerContent>
      </Drawer>
    );
  }

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
          {renderContent()}
        </motion.div>
      </LayoutGroup>
    </motion.div>
  );
}
