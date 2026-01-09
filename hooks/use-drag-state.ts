'use client'

import { useState, useCallback, useMemo } from 'react'

export function useDragState() {
  const [isDragging, setIsDragging] = useState(false)

  const onDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const onDragEnd = useCallback(() => {
    // Small delay to let dnd-kit finish its animations
    setTimeout(() => setIsDragging(false), 50)
  }, [])

  // When dragging, disable all framer motion animations
  const getItemAnimationProps = useMemo(() => {
    if (isDragging) {
      return {
        initial: false,
        animate: { opacity: 1, height: 'auto' },
        exit: { opacity: 1, height: 'auto' },
        transition: { duration: 0 },
        layout: false,
      }
    }
    return {
      initial: { opacity: 0, height: 0 },
      animate: { opacity: 1, height: 'auto' },
      exit: { opacity: 0, height: 0 },
      transition: {
        opacity: { duration: 0.15 },
        height: { duration: 0.2 },
      },
      layout: false,
    }
  }, [isDragging])

  return {
    isDragging,
    onDragStart,
    onDragEnd,
    getItemAnimationProps,
  }
}
