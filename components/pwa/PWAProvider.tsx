'use client'

import { useEffect, useState, createContext, useContext, useCallback, type ReactNode } from 'react'
import { Toaster, toast } from 'sonner'

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAContextType {
    isInstallable: boolean
    isInstalled: boolean
    isIOS: boolean
    installApp: () => Promise<void>
}

const PWAContext = createContext<PWAContextType>({
    isInstallable: false,
    isInstalled: false,
    isIOS: false,
    installApp: async () => { },
})

export const usePWA = () => useContext(PWAContext)

export function PWAProvider({ children }: { children: ReactNode }) {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isInstalled, setIsInstalled] = useState(false)
    const [isIOS, setIsIOS] = useState(false)

    const installApp = useCallback(async () => {
        if (!deferredPrompt) {
            // iOS - show instructions
            if (isIOS) {
                toast.info('Install 1PDF', {
                    description: 'Tap the share button, then "Add to Home Screen"',
                    duration: 6000,
                })
            }
            return
        }

        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            toast.success('Installing 1PDF...', {
                description: 'The app will be added to your home screen',
            })
        }

        setDeferredPrompt(null)
    }, [deferredPrompt, isIOS])

    useEffect(() => {
        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as Navigator & { standalone?: boolean }).standalone === true
        setIsInstalled(isStandalone)

        // Check if iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream
        setIsIOS(isIOSDevice)

        // Listen for install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
        }

        // Listen for successful install
        const handleAppInstalled = () => {
            setIsInstalled(true)
            setDeferredPrompt(null)
            toast.success('1PDF installed!', {
                description: 'You can now use the app offline',
            })
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [])

    // Show install prompt after a delay (only once per session)
    useEffect(() => {
        if (!deferredPrompt || isInstalled) return

        const hasShownPrompt = sessionStorage.getItem('pwa-prompt-shown')
        if (hasShownPrompt) return

        const timer = setTimeout(() => {
            toast('Install 1PDF', {
                description: 'Add to home screen for offline access',
                action: {
                    label: 'Install',
                    onClick: installApp,
                },
                duration: 10000,
            })
            sessionStorage.setItem('pwa-prompt-shown', 'true')
        }, 30000) // Show after 30 seconds

        return () => clearTimeout(timer)
    }, [deferredPrompt, isInstalled, installApp])

    return (
        <PWAContext.Provider
            value={{
                isInstallable: !!deferredPrompt || (isIOS && !isInstalled),
                isInstalled,
                isIOS,
                installApp,
            }}
        >
            {children}
            <Toaster
                position="bottom-center"
                toastOptions={{
                    className: 'font-sans',
                }}
            />
        </PWAContext.Provider>
    )
}
