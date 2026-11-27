import type { FC, ReactNode } from "react";

export type IconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

type SvgIconProps = IconProps & {
  children: ReactNode;
  filled?: boolean;
};

export const SvgIcon: FC<SvgIconProps> = ({
  size = 16,
  className,
  filled,
  strokeWidth = 2,
  children,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={strokeWidth * (2 / 3)}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
};
