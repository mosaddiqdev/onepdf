'use client'

import { motion } from 'motion/react'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

// Subtle fade + slight upward slide - Vercel/Linear style
export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.2,
        ease: [0.25, 0.1, 0.25, 1], // cubic-bezier for smooth feel
      }}
    >
      {children}
    </motion.div>
  )
}
