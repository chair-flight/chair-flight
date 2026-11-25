import { CloseIcon } from "../../icons/close-icon";
import { cn } from "../../utils/cn";
import { ButtonIcon } from "./button-icon";
import type { FC, ReactNode } from "react";

const SIZE_CLASS_NAMES = {
  md: "w-[min(32rem,calc(100vw-2rem))]",
  lg: "w-[min(38rem,calc(100vw-2rem))]",
  xl: "w-[min(64rem,calc(100vw-2rem))]",
  full: "w-[calc(100vw-2rem)]",
};

export const Dialog: FC<{
  title: string;
  size?: keyof typeof SIZE_CLASS_NAMES;
  footer?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}> = ({ title, size = "md", footer, onClose, children }) => (
  <div
    className={cn(
      "flex max-h-[calc(100dvh-2rem)] flex-col",
      SIZE_CLASS_NAMES[size],
    )}
  >
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b",
        "border-rule px-4 py-3",
      )}
    >
      <h2 className="m-0 text-base font-bold">{title}</h2>
      <ButtonIcon label="Close" onClick={onClose} icon={CloseIcon} />
    </div>
    <div className="min-h-0 flex-1 overflow-auto p-4">{children}</div>
    {footer && <div className="border-t border-rule px-4 py-3">{footer}</div>}
  </div>
);
