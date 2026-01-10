'use client'

import { useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { FileNotFoundIcon, Home01Icon, ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { PageTransition } from '@/components/page-transition'
import Balancer from 'react-wrap-balancer'

export default function NotFound() {
    const router = useRouter()

    return (
        <PageTransition>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4 sm:p-6 lg:p-8">
                <div className="text-center space-y-6 sm:space-y-8 max-w-sm sm:max-w-md lg:max-w-lg w-full">
                    {/* 404 Icon */}
                    <div className="relative">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 mx-auto rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/20">
                            <HugeiconsIcon
                                icon={FileNotFoundIcon}
                                className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-primary"
                            />
                        </div>
                        {/* Floating PDF pages animation */}
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-8 sm:w-8 sm:h-10 bg-red-100 border border-red-200 rounded-sm transform rotate-12 animate-pulse">
                            <div className="w-full h-1.5 sm:h-2 bg-red-200 rounded-t-sm"></div>
                        </div>
                        <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-6 h-8 sm:w-8 sm:h-10 bg-blue-100 border border-blue-200 rounded-sm transform -rotate-12 animate-pulse delay-300">
                            <div className="w-full h-1.5 sm:h-2 bg-blue-200 rounded-t-sm"></div>
                        </div>
                    </div>

                    {/* Error Message */}
                    <div className="space-y-3 sm:space-y-4">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary">404</h1>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground">
                            Page Not Found
                        </h2>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-2 sm:px-0">
                            <Balancer>
                                Oops! The page you're looking for seems to have vanished like a PDF page in the wind.
                                Don't worry, we'll help you get back on track.
                            </Balancer>
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center w-full px-4 sm:px-0">
                        <Button
                            onClick={() => router.back()}
                            variant="outline"
                            size="default"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
                        >
                            <HugeiconsIcon
                                icon={ArrowLeft01Icon}
                                className="w-4 h-4"
                            />
                            Go Back
                        </Button>

                        <Button
                            onClick={() => router.push('/')}
                            size="default"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
                        >
                            <HugeiconsIcon
                                icon={Home01Icon}
                                className="w-4 h-4"
                            />
                            Back to Home
                        </Button>
                    </div>

                    {/* Helpful Links */}
                    <div className="pt-4 sm:pt-6 border-t border-border/50 w-full">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                            Looking for something specific?
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center w-full px-4 sm:px-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/combine')}
                                className="w-full sm:w-auto text-xs sm:text-sm"
                            >
                                Combine PDFs
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/')}
                                className="w-full sm:w-auto text-xs sm:text-sm"
                            >
                                Upload Files
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    )
}