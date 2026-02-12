"use client";

export function StatusBadge({
  status,
  t,
}: {
  status: "active" | "inactive";
  t: (key: string) => string;
}) {
  const isActive = status === "active";
  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
        isActive
          ? "bg-emerald-100/80 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
          : "bg-red-100/80 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
      }`}>
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isActive ? "bg-emerald-500" : "bg-red-500"
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isActive ? "bg-emerald-500" : "bg-red-500"
          }`}
        />
      </span>
      <span
        className={`text-[11px] uppercase font-bold tracking-wider ${
          isActive
            ? "text-emerald-700 dark:text-emerald-400"
            : "text-red-700 dark:text-red-400"
        }`}>
        {t(status === "active" ? "Active" : "Inactive")}
      </span>
    </div>
  );
}
