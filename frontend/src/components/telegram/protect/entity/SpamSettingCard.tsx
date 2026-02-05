interface SpamSettingCardProps {
  label: string;
  valueDisplay: string;
  isActive?: boolean;
  children: React.ReactNode;
  description?: string;
}

export const SpamSettingCard: React.FC<SpamSettingCardProps> = ({
  label,
  valueDisplay,
  isActive = true,
  children,
  description,
}) => {
  return (
    <div className="spam-card space-y-4 group">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-300 transition-colors group-hover:text-white">
            {label}
          </label>
          {description && (
            <span className="text-[10px] text-slate-600">{description}</span>
          )}
        </div>

        <span
          className={`text-xs font-bold px-2 py-0.5 rounded border transition-all duration-300 ${
            !isActive
              ? "text-slate-400 bg-slate-800 border-slate-700"
              : "text-indigo-300 bg-indigo-500/20 border-indigo-500/20 shadow-[0_0_10px_-4px_rgba(99,102,241,0.5)]"
          }`}
        >
          {valueDisplay}
        </span>
      </div>
      <div className="relative h-6 flex items-center">{children}</div>
    </div>
  );
};