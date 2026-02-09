export const ActionButton = ({
  disabled,
  onClick,
  label,
  icon,
  colorClass,
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  colorClass: "indigo" | "purple";
}) => {
  const colors = {
    indigo:
      "hover:bg-indigo-900/20 hover:border-indigo-500/30 hover:text-indigo-400 group-hover:bg-indigo-500/20",
    purple:
      "hover:bg-purple-900/20 hover:border-purple-500/30 hover:text-purple-400 group-hover:bg-purple-500/20",
  };
  const baseBtn =
    "flex cursor-pointer items-center justify-center gap-2 bg-slate-900 border border-slate-800 text-slate-300 py-2 rounded-lg transition-all text-xs font-semibold group";
  const baseIcon = "p-1 rounded bg-slate-800 transition-colors";
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`${baseBtn} ${colors[colorClass].split(" ").slice(0, 3).join(" ")}`}>
      <div className={`${baseIcon} ${colors[colorClass].split(" ").pop()}`}>
        {icon}
      </div>
      {label}
    </button>
  );
};
