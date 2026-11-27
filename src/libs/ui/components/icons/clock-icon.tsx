import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const ClockIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.67v3.33l2 1.33" />
    </SvgIcon>
  );
};
