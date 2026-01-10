"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/custom-input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ToggleOption } from "./ToggleOption";
import { LayoutSelector } from "./LayoutSelector";

interface ConfigCardProps {
  settings: ProcessingSettings;
  onFilenameChange: (filename: string) => void;
  onSettingsChange: (updates: Partial<ProcessingSettings>) => void;
  disabled?: boolean;
  hasFiles: boolean;
}

export function ConfigCard({
  settings,
  onFilenameChange,
  onSettingsChange,
  disabled,
  hasFiles,
}: ConfigCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const qualityOptions = [
    { dpi: 150 as const, label: "Standard", desc: "150 DPI" },
    { dpi: 300 as const, label: "High", desc: "300 DPI" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-3 sm:p-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Output Filename</Label>
          <CustomInput
            value={settings.filename}
            onChange={(e) => onFilenameChange(e.target.value)}
            disabled={disabled}
            suffix=".pdf"
            placeholder={hasFiles ? "Enter filename" : "1PDF - Combined Document"}
          />
        </div>
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 border-t border-border bg-muted/30 hover:bg-muted/50 transition-colors"
            disabled={disabled}
          >
            <span className="text-sm font-medium text-muted-foreground">Layout & Settings</span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <svg
                className="w-4 h-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent forceMount>
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ overflow: "hidden" }}
              >
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-3 space-y-4 border-t border-border">
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <LayoutSelector
                      value={settings.pagesPerSheet}
                      onChange={(pagesPerSheet) => onSettingsChange({ pagesPerSheet })}
                      disabled={disabled}
                    />

                    <div className="border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Quality</label>
                        <div className="flex flex-row sm:flex-col gap-2">
                          {qualityOptions.map((option) => {
                            const isSelected = settings.dpi === option.dpi;
                            return (
                              <Button
                                key={option.dpi}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => onSettingsChange({ dpi: option.dpi })}
                                disabled={disabled}
                                className="flex-1 sm:flex-none sm:w-full justify-between"
                              >
                                <span>{option.label}</span>
                                <span
                                  className={
                                    isSelected
                                      ? "text-primary-foreground/70"
                                      : "text-muted-foreground"
                                  }
                                >
                                  {option.desc}
                                </span>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 space-y-1">
                    <ToggleOption
                      label="Grayscale"
                      description="Convert pages to black & white"
                      checked={settings.grayscale}
                      onChange={(checked) => onSettingsChange({ grayscale: checked })}
                      disabled={disabled}
                    />
                    <ToggleOption
                      label="Invert Colors"
                      description="Swap light and dark colors"
                      checked={settings.invertColors}
                      onChange={(checked) => onSettingsChange({ invertColors: checked })}
                      disabled={disabled}
                    />
                    <ToggleOption
                      label="Black Background"
                      description="Use dark background for sheets"
                      checked={settings.blackBackground}
                      onChange={(checked) => onSettingsChange({ blackBackground: checked })}
                      disabled={disabled}
                    />
                    <ToggleOption
                      label="Background Notifications"
                      description="Get notified when processing completes"
                      checked={settings.enableNotifications}
                      onChange={(checked) => onSettingsChange({ enableNotifications: checked })}
                      disabled={disabled}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
