import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const MenuIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M2 4.25h12M2 8h12M2 11.75h12" />
    </SvgIcon>
  );
};
