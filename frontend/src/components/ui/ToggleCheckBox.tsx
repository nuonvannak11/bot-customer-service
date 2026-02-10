"use client";
import clsx from "clsx";

interface ToggleProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
}

export default function Toggle({
  label,
  description,
  icon,
  checked,
  onChange,
}: ToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
            {icon}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-slate-200">{label}</p>
          {description && (
            <p className="text-xs text-slate-500">{description}</p>
          )}
        </div>
      </div>

      <button
        onClick={() => onChange(!checked)}
        className={clsx(
          "relative w-12 h-6 cursor-pointer rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-900",
          checked ? "bg-cyan-500" : "bg-slate-700",
        )}>
        <span
          className={clsx(
            "absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out",
            checked ? "translate-x-6" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}
