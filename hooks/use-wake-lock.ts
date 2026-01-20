"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function useWakeLock(enabled: boolean) {
  const wakeLock = useRef<WakeLockSentinel | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const requestLock = useCallback(async () => {
    if (
      typeof navigator !== "undefined" &&
      "wakeLock" in navigator &&
      !wakeLock.current
    ) {
      try {
        wakeLock.current = await navigator.wakeLock.request("screen");
        setIsLocked(true);

        wakeLock.current.addEventListener("release", () => {
          setIsLocked(false);
          wakeLock.current = null;
        });
      } catch (err) {
        console.warn(
          `${err instanceof Error ? err.name : "Error"}, ${
            err instanceof Error ? err.message : "unknown error"
          }`
        );
      }
    }
  }, []);

  const releaseLock = useCallback(async () => {
    if (wakeLock.current) {
      try {
        await wakeLock.current.release();
        wakeLock.current = null;
        setIsLocked(false);
      } catch (err) {
        console.warn(
          `${err instanceof Error ? err.name : "Error"}, ${
            err instanceof Error ? err.message : "unknown error"
          }`
        );
      }
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      requestLock();
    } else {
      releaseLock();
    }

    return () => {
      releaseLock();
    };
  }, [enabled, requestLock, releaseLock]);

  // Re-acquire lock if visibility changes (e.g. user tabs back)
  // Note: Modern browsers release lock on visibility change, so we need to re-request when visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && enabled) {
        requestLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, requestLock]);

  return { isLocked };
}
