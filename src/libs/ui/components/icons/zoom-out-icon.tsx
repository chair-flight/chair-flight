import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const ZoomOutIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <circle cx="7.25" cy="7.25" r="5.25" />
      <path d="M14 14l-3 -3M5 7.25h4.5" />
    </SvgIcon>
  );
};
