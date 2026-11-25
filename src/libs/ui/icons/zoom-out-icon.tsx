import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const ZoomOutIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4M8 11h6" />
    </SvgIcon>
  );
};
