import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const EyeIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M2 8s2.1 -3.9 6 -3.9S14 8 14 8s-2.1 3.9 -6 3.9S2 8 2 8z" />
      <circle cx="8" cy="8" r="1.8" />
    </SvgIcon>
  );
};
