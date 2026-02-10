import { useState, forwardRef } from "react";
import type { LucideIcon } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

const SettingsInput = forwardRef<
  HTMLInputElement,
  {
    id?: string;
    label?: string;
    value?: string;
    onChange?: (val: string) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    icon?: LucideIcon;
    placeholder?: string;
    type?: "text" | "password";
    disabled?: boolean;
    name?: string;
    customStyle?: string;
    className?: string;
    isShowPw?: boolean;
  }
>(
  (
    {
      label,
      value,
      onChange,
      onKeyDown,
      icon: Icon,
      placeholder,
      type = "text",
      disabled = false,
      id,
      name,
      customStyle,
      className,
      isShowPw = false,
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(isShowPw);
    const isPassword = type === "password";

    const defaultInputStyles =
      "w-full rounded-xl py-2.5 transition-all outline-none " +
      "bg-gray-50 border border-gray-300 text-gray-900 placeholder:text-gray-400 " +
      "focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 " +
      "dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-600 " +
      "dark:focus:bg-slate-950 dark:focus:border-cyan-500 dark:focus:ring-cyan-500/20";

    const inputClasses = customStyle ?? defaultInputStyles;

    return (
      <div className={cn("group space-y-1.5", className)}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 dark:text-slate-300 transition-colors">
            {label}
          </label>
        )}
        <div className="relative w-full">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon
                size={18}
                className="text-gray-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-cyan-400 transition-colors"
              />
            </div>
          )}

          {!Icon && label === "Bot Username" && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 dark:text-slate-500 text-lg group-focus-within:text-blue-500 dark:group-focus-within:text-cyan-400 transition-colors">
                @
              </span>
            </div>
          )}
          
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            type={isPassword && !showPassword ? "password" : "text"}
            value={value}
            name={name}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={(e) => onKeyDown?.(e)}
            placeholder={placeholder}
            className={cn(
              inputClasses,
              Icon || label === "Bot Username" ? "pl-10" : "pl-4",
              isPassword ? "pr-10" : "pr-4",
              disabled &&
                "cursor-not-allowed opacity-60 bg-gray-100 dark:bg-slate-900 text-gray-500 dark:text-slate-500",
            )}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-white transition-colors disabled:cursor-not-allowed">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      </div>
    );
  },
);

SettingsInput.displayName = "SettingsInput";
export default SettingsInput;
