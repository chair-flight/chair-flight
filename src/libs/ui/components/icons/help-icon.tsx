import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const HelpIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <circle cx="8" cy="8" r="6" />
      <path d="M6.24 6.24a1.76 1.76 0 1 1 2.47 1.62c-0.49 0.28 -0.71 0.64 -0.71 1.2" />
      <path d="M8 11.18h0.01" />
    </SvgIcon>
  );
};
