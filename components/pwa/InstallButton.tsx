'use client'

import { usePWA } from './PWAProvider'
import { HugeiconsIcon } from '@hugeicons/react'
import { Download01Icon } from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'

interface InstallButtonProps {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function InstallButton({ variant = 'default', size = 'default' }: InstallButtonProps) {
    const { isInstallable, isInstalled, installApp } = usePWA()

    if (isInstalled || !isInstallable) {
        return null
    }

    return (
        <Button
            onClick={installApp}
            variant={variant}
            size={size}
            className="inline-flex items-center gap-2"
        >
            <HugeiconsIcon
                icon={Download01Icon}
                className="w-4 h-4"
            />
            Install App
        </Button>
    )
}