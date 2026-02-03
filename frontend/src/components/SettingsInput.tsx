import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const SettingsInput = ({
  label,
  value,
  onChange,
  icon: Icon,
  placeholder,
  type = "text",
  disabled = false,
  id,
  name,
  customStyle,
  isShowPw = true,
}: {
  id?: string;
  label: string;
  value?: string;
  onChange?: (val: string) => void;
  icon?: any;
  placeholder?: string;
  type?: "text" | "password";
  disabled?: boolean;
  name?: string;
  customStyle?: string;
  isShowPw?: boolean;
}) => {
  const [showPassword, setShowPassword] = useState(isShowPw);
  const isPassword = type === "password";
  const class_input =
    customStyle ??
    "w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 pr-4 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all placeholder:text-slate-600 ";
  return (
    <div className="group">
      <label className="text-sm font-medium text-slate-300 mb-1.5 block">
        {label}
      </label>
      <div className="relative transition-all duration-300 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.15)] rounded-xl">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon
              size={18}
              className="text-slate-500 group-focus-within:text-cyan-400 transition-colors"
            />
          </div>
        )}

        {!Icon && label === "Bot Username" && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-slate-500 text-lg">@</span>
          </div>
        )}

        <input
          id={id}
          disabled={disabled}
          type={isPassword && !showPassword ? "password" : "text"}
          value={value}
          name={name}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={`${class_input}
            ${Icon || label === "Bot Username" ? "pl-10" : "pl-4"} 
            ${disabled ? "cursor-not-allowed opacity-70 text-slate-400" : ""}
            ${isPassword ? "pr-10" : ""}
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-white transition-colors">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};
export default SettingsInput;
