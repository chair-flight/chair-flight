import { cn } from "../../utils/cn";
import { BUTTON_DEFAULT_VARIANT_CLASS } from "./button";
import type { ComponentProps, FC } from "react";
import type { IconProps } from "../icons/svg-icon";

export const ButtonIcon: FC<
  Omit<ComponentProps<"button">, "children" | "aria-label"> & {
    icon: FC<IconProps>;
    label: string;
    active?: boolean;
    variant?: "default" | "ghost";
  }
> = ({
  icon: Icon,
  label,
  active,
  variant = "ghost",
  type = "button",
  className,
  ...props
}) => (
  <button
    type={type}
    aria-label={label}
    aria-pressed={active}
    className={cn(
      "inline-flex size-8 flex-none cursor-pointer items-center",
      "justify-center rounded-md",
      variant === "default" ? "border" : "border-0",
      active
        ? "border-accent bg-accent text-white"
        : variant === "default"
          ? BUTTON_DEFAULT_VARIANT_CLASS
          : "bg-transparent text-ink enabled:hover:text-accent",
      "disabled:cursor-default disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <Icon size={16} />
  </button>
);
