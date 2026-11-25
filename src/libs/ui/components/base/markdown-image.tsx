import { cn } from "../../utils/cn";
import { AnnexCanvas } from "./annex-canvas";
import type { FC } from "react";

const WRAPPER_CLASS_NAMES = {
  sm: "mr-2 inline-block align-top",
  md: "block w-full max-w-xs",
  lg: "block w-full max-w-2xl",
};

const SIZE_CLASS_NAMES = {
  sm: "size-20 rounded-md border border-rule",
  md: "h-auto w-full max-w-xs border border-rule",
  lg: "h-auto w-full max-w-2xl border border-rule",
};

export const MarkdownImage: FC<{
  href?: string;
  alt?: string;
  size?: keyof typeof SIZE_CLASS_NAMES;
  onClick?: (href: string) => void;
}> = ({ href, alt, size = "sm", onClick }) => {
  if (!href)
    return (
      <span className={WRAPPER_CLASS_NAMES[size]}>
        <div
          role="img"
          aria-label={alt ?? "Missing annex"}
          className={cn(
            "grid aspect-square place-items-center bg-accent-soft p-2",
            "text-center text-xs text-muted",
            SIZE_CLASS_NAMES[size],
          )}
        >
          Missing annex
        </div>
      </span>
    );

  const canvas = (
    <AnnexCanvas
      href={href}
      alt={alt}
      crop={size === "sm"}
      className={SIZE_CLASS_NAMES[size]}
    />
  );
  if (!onClick)
    return <span className={WRAPPER_CLASS_NAMES[size]}>{canvas}</span>;
  return (
    <button
      type="button"
      aria-label="Open annex"
      className={cn(
        "cursor-zoom-in border-0 bg-transparent p-0",
        WRAPPER_CLASS_NAMES[size],
      )}
      onClick={() => onClick(href)}
    >
      {canvas}
    </button>
  );
};
