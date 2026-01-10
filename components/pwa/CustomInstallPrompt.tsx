"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Balancer from "react-wrap-balancer";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Download01Icon,
  Wifi01Icon,
  HardDriveIcon,
  Lightning,
} from "@hugeicons/core-free-icons";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const isDismissedRecently = (): boolean => {
  if (typeof window === "undefined") return false;
  const dismissed = localStorage.getItem("pwa-install-dismissed");
  if (!dismissed) return false;
  const dismissedTime = parseInt(dismissed);
  const weekInMs = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - dismissedTime < weekInMs;
};

const checkIsInstalled = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
};

export function CustomInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(true);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsInstalled(checkIsInstalled());

    setIsDismissed(isDismissedRecently());

    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
      setShowSuccess(true);
      setIsInstalled(true);

      localStorage.removeItem("pwa-install-dismissed");

      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (isIOS) {
      setShowPrompt(false);
      return;
    }

    if (!deferredPrompt) {
      console.warn("No install prompt available");
      setShowPrompt(false);
      return;
    }

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }

      setShowPrompt(false);
    } catch (error) {
      console.error("Install prompt error:", error);
      setShowPrompt(false);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt, isIOS]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    setIsDismissed(true);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  }, []);

  const handleShowPrompt = useCallback(() => {
    if (deferredPrompt || isIOS) {
      setShowPrompt(true);
    }
  }, [deferredPrompt, isIOS]);

  if (isInstalled) return null;

  const showFloatingButton = !isDismissed && !showPrompt && (deferredPrompt !== null || isIOS);

  return (
    <>
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
          >
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.95 }}
              className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="relative bg-linear-to-br from-primary to-primary/90 p-6 text-primary-foreground">
                <button
                  onClick={handleDismiss}
                  className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    size={16}
                    className="text-primary-foreground"
                  />
                </button>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                    <Image
                      src="/icons/web-app-manifest-192x192.png"
                      alt="1PDF"
                      className="w-10 h-10"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Install 1PDF</h3>
                    <p className="text-primary-foreground/80 text-sm">
                      Add to home screen for offline access
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {isIOS ? (
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                      To install 1PDF on your iPhone or iPad:
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">
                          1
                        </div>
                        <span className="text-foreground">
                          Tap the <strong>Share</strong> button in Safari
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">
                          2
                        </div>
                        <span className="text-foreground">
                          Select <strong>&quot;Add to Home Screen&quot;</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">
                          3
                        </div>
                        <span className="text-foreground">
                          Tap <strong>&quot;Add&quot;</strong> to install
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-muted rounded-lg">
                        <HugeiconsIcon
                          icon={Lightning}
                          size={24}
                          className="text-primary mx-auto mb-2"
                        />
                        <p className="text-xs text-muted-foreground">Faster Access</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <HugeiconsIcon
                          icon={Wifi01Icon}
                          size={24}
                          className="text-primary mx-auto mb-2"
                        />
                        <p className="text-xs text-muted-foreground">Works Offline</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <HugeiconsIcon
                          icon={HardDriveIcon}
                          size={24}
                          className="text-primary mx-auto mb-2"
                        />
                        <p className="text-xs text-muted-foreground">No Storage</p>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm text-center">
                      <Balancer>
                        Get the full app experience with instant loading and offline access.
                      </Balancer>
                    </p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleDismiss}
                    className="flex-1 px-4 py-3 text-muted-foreground bg-muted rounded-xl font-medium hover:bg-muted/80 transition-colors"
                  >
                    Maybe Later
                  </button>
                  <button
                    onClick={handleInstall}
                    disabled={isInstalling || (!deferredPrompt && !isIOS)}
                    className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isInstalling ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        <HugeiconsIcon
                          icon={Download01Icon}
                          size={16}
                          className="text-primary-foreground"
                        />
                        {isIOS ? "Got It" : "Install"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className="bg-white rounded-xl shadow-lg border border-green-200 p-4 max-w-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">1PDF Installed!</h4>
                  <p className="text-sm text-muted-foreground">
                    You can now access 1PDF from your home screen.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFloatingButton && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShowPrompt}
            className="fixed bottom-20 right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors z-40"
            aria-label="Install 1PDF"
          >
            <HugeiconsIcon icon={Download01Icon} size={20} className="text-primary-foreground" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
