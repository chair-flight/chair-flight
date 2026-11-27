import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const LogOutIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M5.38 2H2.38v12h3" />
      <path d="M10.62 5l3 3 -3 3" />
      <path d="M13.62 8H5.38" />
    </SvgIcon>
  );
};
