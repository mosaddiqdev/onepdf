"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { processPDFs, downloadPDF, cancelProcessing as cancelWorker } from "@/lib/pdf-processor";
import {
  validateSettings,
  validatePageCount,
  sanitizeFilename,
  formatValidationErrors,
} from "@/lib/validation";
import { getRandomFact } from "@/lib/fun-facts";
import { useBackgroundNotifications } from "./use-background-notifications";

const DEFAULT_SETTINGS: ProcessingSettings = {
  filename: "",
  pagesPerSheet: 3,
  dpi: 150,
  grayscale: true,
  invertColors: true,
  blackBackground: false,
  enableNotifications: true,
};

const loadSettings = (): ProcessingSettings => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  try {
    const saved = localStorage.getItem("pdf-processing-settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed, filename: "" };
    }
  } catch (error) {
    console.warn("Failed to load settings from localStorage:", error);
  }

  return DEFAULT_SETTINGS;
};

const saveSettings = (settings: ProcessingSettings) => {
  if (typeof window === "undefined") return;

  try {
    const { ...settingsToSave } = settings;
    localStorage.setItem("pdf-processing-settings", JSON.stringify(settingsToSave));
  } catch (error) {
    console.warn("Failed to save settings to localStorage:", error);
  }
};

const saveProcessingState = (state: EnhancedProcessingState) => {
  if (typeof window === "undefined" || state.status === "idle") return;

  try {
    localStorage.setItem(
      "pdf-processing-state",
      JSON.stringify({
        ...state,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.warn("Failed to save processing state:", error);
  }
};

const loadProcessingState = (): EnhancedProcessingState | null => {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem("pdf-processing-state");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Date.now() - parsed.timestamp < 3600000) {
        const { ...state } = parsed;
        return state;
      }
    }
  } catch (error) {
    console.warn("Failed to load processing state:", error);
  }

  return null;
};

const clearProcessingState = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("pdf-processing-state");
  } catch (error) {
    console.warn("Failed to clear processing state:", error);
  }
};

export function useProcessing(files: PDFFile[]) {
  const [settings, setSettings] = useState<ProcessingSettings>(DEFAULT_SETTINGS);
  const [state, setState] = useState<EnhancedProcessingState>({
    status: "idle",
    progress: 0,
    message: "",
  });
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [currentFact, setCurrentFact] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    const saved = loadSettings();
    setSettings((prev) => ({ ...saved, filename: prev.filename }));
    setIsVisible(!document.hidden);
  }, []);

  const abortControllerRef = useRef<AbortController | null>(null);
  const processingStartTime = useRef<number>(0);
  const lastNotificationTime = useRef<number>(0);
  const isBackgroundRef = useRef<boolean>(false);

  const { notifyProcessingComplete, notifyProcessingError, notifyLongProcessing } =
    useBackgroundNotifications();

  const isProcessing = state.status === "processing";
  const outputSheets = Math.ceil(
    files.reduce((sum, f) => sum + (f.pageCount || 0), 0) / settings.pagesPerSheet
  );

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsVisible(visible);

      if (isProcessing) {
        if (!visible) {
          isBackgroundRef.current = true;
          setState((prev) => ({
            ...prev,
            isBackground: true,
            backgroundStartTime: Date.now(),
            message: prev.message.includes("(Running in background...)")
              ? prev.message
              : prev.message + " (Running in background...)",
          }));
        } else {
          console.log("Tab visible again - switching to foreground mode");
          isBackgroundRef.current = false;
          setState((prev) => ({
            ...prev,
            isBackground: false,
            message: prev.message.replace(" (Running in background...)", ""),
          }));
        }
      }
    };

    setIsVisible(!document.hidden);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    window.addEventListener("focus", () => {
      if (document.hidden === false) handleVisibilityChange();
    });
    window.addEventListener("blur", () => {
      if (document.hidden === true) handleVisibilityChange();
    });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
      window.removeEventListener("blur", handleVisibilityChange);
    };
  }, [isProcessing, state.status]);

  useEffect(() => {
    const savedState = loadProcessingState();
    if (savedState && files.length > 0) {
      if (savedState.status === "processing") {
        setState({
          status: "error",
          progress: 0,
          message: "Previous processing was interrupted. Please try again.",
        });
      }
    }
  }, [files.length]);

  useEffect(() => {
    if (state.status !== "idle") {
      saveProcessingState(state);
    } else {
      clearProcessingState();
    }
  }, [state]);

  useEffect(() => {
    if (files.length > 0) {
      const firstName = files[0].name.replace(/\.pdf$/i, "");
      setSettings((prev) => ({ ...prev, filename: firstName }));
    } else {
      setSettings((prev) => ({ ...prev, filename: "" }));
    }
  }, [files]);

  useEffect(() => {
    if (isProcessing) {
      setCurrentFact(getRandomFact());
    }
  }, [isProcessing]);

  useEffect(() => {
    if (!isProcessing || state.progress <= 0) return;

    const elapsed = Date.now() - processingStartTime.current;
    const estimatedTotal = (elapsed / state.progress) * 100;
    const remaining = estimatedTotal - elapsed;

    const currentEstimate = state.estimatedTimeRemaining || 0;
    const timeDiff = Math.abs(remaining - currentEstimate);

    if (timeDiff > 5000) {
      setState((prev) => ({
        ...prev,
        estimatedTimeRemaining: Math.max(0, remaining),
      }));
    }

    if (state.isBackground && remaining > 0 && settings.enableNotifications) {
      const now = Date.now();
      const timeSinceLastNotification = now - lastNotificationTime.current;

      if (timeSinceLastNotification > 300000 && remaining > 600000) {
        const estimatedMinutes = Math.ceil(remaining / 60000);
        notifyLongProcessing(estimatedMinutes);
        lastNotificationTime.current = now;
      }
    }
  }, [
    isProcessing,
    state.progress,
    state.isBackground,
    state.estimatedTimeRemaining,
    notifyLongProcessing,
  ]);

  const updateFilename = useCallback((filename: string) => {
    setSettings((prev) => ({ ...prev, filename }));
  }, []);

  const updateSettings = useCallback((updates: Partial<ProcessingSettings>) => {
    setSettings((prev) => {
      const newSettings = { ...prev, ...updates };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  const process = useCallback(async () => {
    if (files.length === 0) return;

    const settingsErrors = validateSettings(settings);
    if (settingsErrors.length > 0) {
      setState({
        status: "error",
        progress: 0,
        message: formatValidationErrors(settingsErrors),
      });
      return;
    }

    const totalPages = files.reduce((sum, f) => sum + (f.pageCount || 0), 0);
    const pageCountError = validatePageCount(totalPages, settings.pagesPerSheet);
    if (pageCountError) {
      setState({
        status: "error",
        progress: 0,
        message: pageCountError.message,
      });
      return;
    }

    const sanitizedFilename = sanitizeFilename(settings.filename);
    if (sanitizedFilename !== settings.filename) {
      setSettings((prev) => ({ ...prev, filename: sanitizedFilename }));
    }

    if (totalPages > 100) {
      console.log(`Processing ${totalPages} pages - this may take 10-30 minutes`);
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    processingStartTime.current = Date.now();
    lastNotificationTime.current = Date.now();

    setState({
      status: "processing",
      progress: 0,
      message: "Starting...",
      isBackground: !isVisible,
      backgroundStartTime: !isVisible ? Date.now() : undefined,
    });
    isBackgroundRef.current = !isVisible;
    setResult(null);

    try {
      const res = await processPDFs(
        files,
        settings,
        (progress, message) => {
          setState((prev) => ({
            ...prev,
            progress,
            message: message + (prev.isBackground ? " (Running in background...)" : ""),
          }));
        },
        signal
      );

      const wasInBackground = isBackgroundRef.current;
      console.log("[Processing] Completed! wasInBackground:", wasInBackground);

      setResult(res);
      setState((prev) => ({
        ...prev,
        status: "complete",
        progress: 100,
        message: "Done!",
        isBackground: false,
      }));
      isBackgroundRef.current = false;

      if (wasInBackground && settings.enableNotifications) {
        console.log("[Processing] Calling notifyProcessingComplete");
        notifyProcessingComplete(settings.filename || "combined.pdf", outputSheets);
      } else {
        console.log(
          "[Processing] Not calling notification - was not in background or notifications disabled"
        );
      }

      clearProcessingState();
    } catch (e) {
      if (e instanceof Error && e.message === "Cancelled") {
        clearProcessingState();
        return;
      }
      console.error("Processing error:", e);
      const errorMessage =
        e instanceof Error ? e.message : "An unexpected error occurred during processing";

      const wasInBackground = isBackgroundRef.current;
      console.log("[Processing] Error occurred! wasInBackground:", wasInBackground);

      setState({
        status: "error",
        progress: 0,
        message: errorMessage,
      });
      isBackgroundRef.current = false;

      if (wasInBackground && settings.enableNotifications) {
        notifyProcessingError();
      }
    } finally {
      abortControllerRef.current = null;
    }
  }, [
    files,
    settings,
    isVisible,
    state.isBackground,
    notifyProcessingComplete,
    notifyProcessingError,
    outputSheets,
  ]);

  const handleDownload = useCallback(() => {
    if (result) {
      downloadPDF(result, settings.filename);
    }
  }, [result, settings.filename]);

  const cancelProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    cancelWorker();
    setState({ status: "idle", progress: 0, message: "" });
    setResult(null);
    clearProcessingState();
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setState({ status: "idle", progress: 0, message: "" });
    setSettings((prev) => ({ ...prev, filename: "" }));
    clearProcessingState();
  }, []);

  return {
    settings,
    state,
    result,
    currentFact,
    isProcessing,
    outputSheets,
    isVisible,
    updateFilename,
    updateSettings,
    process,
    handleDownload,
    cancelProcessing,
    reset,
    setResult,
  };
}
