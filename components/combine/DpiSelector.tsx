"use client";

interface DpiSelectorProps {
  value: 150 | 300;
  onChange: (dpi: 150 | 300) => void;
  disabled?: boolean;
}

export function DpiSelector({ value, onChange, disabled }: DpiSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Quality</p>
          <p className="text-xs text-muted-foreground">
            {value === 150 ? "Faster processing, smaller files" : "Higher quality, larger files"}
          </p>
        </div>
      </div>

      <div className="flex rounded-lg border border-border p-1 bg-muted/30">
        <button
          type="button"
          onClick={() => !disabled && onChange(150)}
          disabled={disabled}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
            value === 150
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          150 DPI
        </button>
        <button
          type="button"
          onClick={() => !disabled && onChange(300)}
          disabled={disabled}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
            value === 300
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          300 DPI
        </button>
      </div>
    </div>
  );
}
