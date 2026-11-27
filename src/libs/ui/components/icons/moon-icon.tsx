import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const MoonIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M14 10.2A6.25 6.25 0 0 1 5.8 2a6.25 6.25 0 1 0 8.2 8.2z" />
    </SvgIcon>
  );
};
