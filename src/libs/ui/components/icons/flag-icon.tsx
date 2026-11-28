import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const FlagIcon: FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M3 14V2m0 1c4-3 6 3 10 0v7c-4 3-6-3-10 0" />
  </SvgIcon>
);
