import { useState, forwardRef } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { cn } from "@/utils/util";

const INPUT_STYLES = [
  "w-full rounded-xl py-2.5 transition-all outline-none",
  "bg-gray-50 border border-gray-300 text-gray-900 placeholder:text-gray-400",
  "focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
  "dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-600",
  "dark:focus:bg-slate-950 dark:focus:border-cyan-500 dark:focus:ring-cyan-500/20",
].join(" ");

interface SettingsInputProps {
  id?: string;
  label?: string;
  value?: string;
  placeholder?: string;
  name?: string;
  type?: "text" | "password";
  disabled?: boolean;
  className?: string;
  customStyle?: string;
  icon?: LucideIcon;
  defaultShowPassword?: boolean;
  onChange?: (val: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const SettingsInput = forwardRef<HTMLInputElement, SettingsInputProps>(
  (
    {
      label,
      value,
      onChange,
      onKeyDown,
      icon: Icon,
      type = "text",
      defaultShowPassword = false,
      disabled = false,
      customStyle,
      className,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(defaultShowPassword);
    const isPasswordType = type === "password";
    const isVisible = isPasswordType && !showPassword;
    const showAtSymbol = !Icon && label === "Bot Username";
    const hasLeftContent = Icon || showAtSymbol;

    return (
      <div className={cn("group/input space-y-1.5", className)}>
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700 dark:text-slate-300 transition-colors">
            {label}
          </label>
        )}

        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-slate-500 transition-colors group-focus-within/input:text-blue-500 dark:group-focus-within/input:text-cyan-400">
            {Icon && <Icon size={18} />}
            {showAtSymbol && <span className="text-lg">@</span>}
          </div>
          <input
            ref={ref}
            type={isVisible ? "password" : "text"}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={onKeyDown}
            className={cn(
              customStyle ?? INPUT_STYLES,
              hasLeftContent ? "pl-10" : "pl-4",
              isPasswordType ? "pr-10" : "pr-4",
              disabled &&
                "cursor-not-allowed opacity-60 bg-gray-100 dark:bg-slate-900",
            )}
            {...props}
          />
          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-white transition-colors disabled:cursor-not-allowed">
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          )}
        </div>
      </div>
    );
  },
);

SettingsInput.displayName = "SettingsInput";
export default SettingsInput;
