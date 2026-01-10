"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { SortableFileItem } from "./SortableFileItem";
import { EmptyState } from "./EmptyState";
import { useDragState } from "@/hooks/use-drag-state";

interface FileListCardProps {
  files: PDFFile[];
  totalPages: number;
  isProcessing: boolean;
  onFilesAdded: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  onReorderFiles: (files: PDFFile[]) => void;
  onAddMoreFiles: () => void;
}

export function FileListCard({
  files,
  totalPages,
  isProcessing,
  onFilesAdded,
  onRemoveFile,
  onReorderFiles,
  onAddMoreFiles,
}: FileListCardProps) {
  const { isDragging, onDragStart, onDragEnd, getItemAnimationProps } = useDragState();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    onDragStart();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = files.findIndex((item) => item.id === active.id);
      const newIndex = files.findIndex((item) => item.id === over?.id);
      onReorderFiles(arrayMove(files, oldIndex, newIndex));
    }

    setActiveId(null);
    onDragEnd();
  };

  const activeDragFile = files.find((file) => file.id === activeId);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-border bg-muted/30">
        <span className="text-sm font-medium">
          {files.length === 0 ? "No files" : `${files.length} file${files.length !== 1 ? "s" : ""}`}
        </span>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-xs text-muted-foreground">
            {files.length === 0 ? (
              <>
                <span className="hidden sm:inline">0 pages total</span>
                <span className="sm:hidden">0 pages</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">{totalPages} pages total</span>
                <span className="sm:hidden">{totalPages} pages</span>
              </>
            )}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddMoreFiles}
            disabled={isProcessing}
            className="h-6 sm:h-7 px-1.5 sm:px-2 text-xs"
          >
            <svg
              className="w-3 h-3 mr-0.5 sm:mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">
              {files.length === 0 ? "Add Files" : "Add More"}
            </span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      <motion.div layout className="relative">
        <AnimatePresence mode="popLayout" initial={false}>
          {files.length > 0 ? (
            <motion.div key="file-list" layout>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={files.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div>
                    <AnimatePresence initial={false} mode="sync">
                      {files.map((file) => (
                        <motion.div
                          key={file.id}
                          {...getItemAnimationProps}
                          style={{ overflow: isDragging ? "visible" : "hidden" }}
                        >
                          <SortableFileItem
                            file={file}
                            isProcessing={isProcessing}
                            onRemove={onRemoveFile}
                            totalFiles={files.length}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activeDragFile ? (
                    <SortableFileItem
                      file={activeDragFile}
                      isProcessing={isProcessing}
                      onRemove={onRemoveFile}
                      isDragOverlay
                      totalFiles={files.length}
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              layout
            >
              <EmptyState onFilesAdded={onFilesAdded} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
