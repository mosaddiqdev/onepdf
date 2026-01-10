"use client";

import { cn } from "@/lib/utils";

interface LayoutSelectorProps {
  value: 2 | 3 | 4 | 6;
  onChange: (value: 2 | 3 | 4 | 6) => void;
  disabled?: boolean;
}

const layouts = [
  {
    value: 2 as const,
    label: "2",
    grid: "grid-cols-2 grid-rows-1",
    cells: 2,
  },
  {
    value: 3 as const,
    label: "3",
    grid: "grid-cols-1 grid-rows-3",
    cells: 3,
  },
  {
    value: 4 as const,
    label: "4",
    grid: "grid-cols-2 grid-rows-2",
    cells: 4,
  },
  {
    value: 6 as const,
    label: "6",
    grid: "grid-cols-2 grid-rows-3",
    cells: 6,
  },
];

function LayoutIcon({
  grid,
  cells,
  isSelected,
}: {
  grid: string;
  cells: number;
  isSelected: boolean;
}) {
  return (
    <div
      className={cn(
        "w-8 h-10 rounded border grid gap-0.5 p-0.5",
        isSelected ? "border-primary bg-primary/5" : "border-border bg-muted/30"
      )}
    >
      <div className={cn("grid gap-0.5", grid)}>
        {Array.from({ length: cells }).map((_, i) => (
          <div
            key={i}
            className={cn("rounded-[1px]", isSelected ? "bg-primary/60" : "bg-muted-foreground/30")}
          />
        ))}
      </div>
    </div>
  );
}

export function LayoutSelector({ value, onChange, disabled }: LayoutSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Pages per Sheet</label>
      <div className="grid grid-cols-4 gap-2">
        {layouts.map((layout) => {
          const isSelected = value === layout.value;
          return (
            <button
              key={layout.value}
              type="button"
              onClick={() => onChange(layout.value)}
              disabled={disabled}
              className={cn(
                "flex flex-col items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg border transition-all",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <LayoutIcon grid={layout.grid} cells={layout.cells} isSelected={isSelected} />
              <span
                className={cn(
                  "text-xs font-medium hidden sm:block",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )}
              >
                {layout.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
