"use client";

import { Switch } from "@/components/ui/switch";

interface ToggleOptionProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ToggleOption({
  label,
  description,
  checked,
  onChange,
  disabled,
}: ToggleOptionProps) {
  return (
    <label
      className={`flex items-center justify-between gap-3 py-2 ${
        disabled ? "opacity-50" : "cursor-pointer"
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </label>
  );
}
