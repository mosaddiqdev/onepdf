'use client'

import { useEffect, useRef } from 'react'



export function useBackgroundNotifications() {
  const permissionGranted = useRef<boolean>(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      // console.log('[Notifications] Current permission:', Notification.permission)
      if (Notification.permission === 'granted') {
        permissionGranted.current = true
        // console.log('[Notifications] Permission already granted')
      } else if (Notification.permission !== 'denied') {
        // console.log('[Notifications] Requesting permission...')
        Notification.requestPermission().then((permission) => {
          permissionGranted.current = permission === 'granted'
          // console.log('[Notifications] Permission result:', permission)
        })
      } else {
        // console.log('[Notifications] Permission denied by user')
      }
    } else {
      // console.log('[Notifications] Not supported in this browser')
    }
  }, [])

  const showNotification = (options: AppNotificationOptions) => {
    // console.log('[Notifications] showNotification called:', {
    //   title: options.title,
    //   isHidden: typeof document !== 'undefined' ? document.hidden : 'N/A',
    //   hasPermission: permissionGranted.current,
    //   supported: typeof window !== 'undefined' && 'Notification' in window
    // })

    if (typeof window === 'undefined' ||
      typeof document === 'undefined') {
      // console.log('[Notifications] Skipped: SSR environment')
      return
    }

    if (!document.hidden) {
      // console.log('[Notifications] Skipped: Page is visible (not in background)')
      return
    }

    if (!permissionGranted.current) {
      // console.log('[Notifications] Skipped: Permission not granted')
      return
    }

    if (!('Notification' in window)) {
      // console.log('[Notifications] Skipped: Notifications not supported')
      return
    }

    try {
      // console.log('[Notifications] Creating notification...')
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/web-app-manifest-192x192.png',
        badge: options.badge || '/icons/web-app-manifest-192x192.png',
        tag: options.tag || 'pdf-processing',
        requireInteraction: options.requireInteraction || true,
        silent: false
      })
      // console.log('[Notifications] Notification created successfully!')

      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close()
        }, 10000)
      }

      notification.onclick = () => {
        if (typeof window !== 'undefined') {
          window.focus()
        }
        notification.close()
      }

      return notification
    } catch (error) {
      // console.warn('[Notifications] Failed to show notification:', error)
    }
  }

  const notifyProcessingComplete = (filename: string, outputSheets: number) => {
    // console.log('[Notifications] notifyProcessingComplete called:', { filename, outputSheets })
    showNotification({
      title: '1PDF - Processing Complete',
      body: `${filename} has been successfully processed and combined into ${outputSheets} sheet${outputSheets !== 1 ? 's' : ''}. Click to return to the application.`,
      tag: 'processing-complete',
      requireInteraction: true
    })
  }

  const notifyProcessingError = (error: string) => {
    // console.log('[Notifications] notifyProcessingError called:', { error })
    showNotification({
      title: '1PDF - Processing Failed',
      body: `PDF processing was unsuccessful. Please return to the application to review the error and try again.`,
      tag: 'processing-error',
      requireInteraction: true
    })
  }

  const notifyLongProcessing = (estimatedMinutes: number) => {
    // console.log('[Notifications] notifyLongProcessing called:', { estimatedMinutes })
    showNotification({
      title: '1PDF - Processing Update',
      body: `Your PDF is still being processed in the background. Estimated time remaining: ${estimatedMinutes} minute${estimatedMinutes !== 1 ? 's' : ''}.`,
      tag: 'processing-update',
      requireInteraction: false
    })
  }

  return {
    showNotification,
    notifyProcessingComplete,
    notifyProcessingError,
    notifyLongProcessing,
    isSupported: typeof window !== 'undefined' && 'Notification' in window,
    hasPermission: permissionGranted.current
  }
}