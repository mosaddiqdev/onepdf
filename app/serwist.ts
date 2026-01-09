"use client";

interface SerwistProviderProps {
  children: React.ReactNode;
}

/**
 * PWA provider wrapper for service worker initialization.
 * Currently provides PWA manifest support without active service worker.
 * Can be extended to add offline functionality in the future.
 */
export function SerwistProvider({ children }: SerwistProviderProps) {
  return children;
}