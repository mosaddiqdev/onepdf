"use client";

import { useEffect, useState } from "react";

export function useBackgroundNotifications() {
  const [permissionGranted, setPermissionGranted] = useState<boolean>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission === "granted";
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (
        Notification.permission !== "denied" &&
        Notification.permission !== "granted"
      ) {
        Notification.requestPermission().then((permission) => {
          setPermissionGranted(permission === "granted");
        });
      }
    }
  }, []);

  const showNotification = (options: AppNotificationOptions) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    if (!document.hidden) {
      return;
    }

    if (!permissionGranted) {
      return;
    }

    if (!("Notification" in window)) {
      return;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || "/icons/web-app-manifest-192x192.png",
        badge: options.badge || "/icons/web-app-manifest-192x192.png",
        tag: options.tag || "pdf-processing",
        requireInteraction: options.requireInteraction || true,
        silent: false,
      });

      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 10000);
      }

      notification.onclick = () => {
        if (typeof window !== "undefined") {
          window.focus();
        }
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  };

  const notifyProcessingComplete = (filename: string, outputSheets: number) => {
    showNotification({
      title: "1PDF - Processing Complete",
      body: `${filename} has been successfully processed and combined into ${outputSheets} sheet${
        outputSheets !== 1 ? "s" : ""
      }. Click to return to the application.`,
      tag: "processing-complete",
      requireInteraction: true,
    });
  };

  const notifyProcessingError = () => {
    showNotification({
      title: "1PDF - Processing Failed",
      body: `PDF processing was unsuccessful. Please return to the application to review the error and try again.`,
      tag: "processing-error",
      requireInteraction: true,
    });
  };

  const notifyLongProcessing = (estimatedMinutes: number) => {
    showNotification({
      title: "1PDF - Processing Update",
      body: `Your PDF is still being processed in the background. Estimated time remaining: ${estimatedMinutes} minute${
        estimatedMinutes !== 1 ? "s" : ""
      }.`,
      tag: "processing-update",
      requireInteraction: false,
    });
  };

  return {
    showNotification,
    notifyProcessingComplete,
    notifyProcessingError,
    notifyLongProcessing,
    isSupported: typeof window !== "undefined" && "Notification" in window,
    hasPermission: permissionGranted,
  };
}
