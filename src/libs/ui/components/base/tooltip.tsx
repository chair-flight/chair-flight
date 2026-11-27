import { cn } from "../../utils/cn";
import type { FC, ReactNode } from "react";

export const Tooltip: FC<{
  label: string;
  shortcut?: string;
  children: ReactNode;
  className?: string;
}> = ({ label, shortcut, children, className }) => (
  <span className={cn("group relative inline-flex flex-none", className)}>
    {children}
    <span
      role="tooltip"
      className={cn(
        "pointer-events-none absolute top-full left-1/2 z-50 mt-1.5",
        "-translate-x-1/2 flex items-center gap-1.5 rounded-md",
        "bg-paper px-2 py-1 text-xs font-medium whitespace-nowrap text-ink shadow-lg",
        "opacity-0 transition-opacity duration-150 delay-0",
        "group-hover:opacity-100 group-hover:delay-1000",
        "group-active:opacity-0 group-active:delay-0",
        "group-focus-visible:opacity-100",
      )}
    >
      {label}
      {shortcut && (
        <kbd className="rounded-sm border border-rule-strong px-1 font-mono text-[11px] text-muted">
          {shortcut}
        </kbd>
      )}
    </span>
  </span>
);
