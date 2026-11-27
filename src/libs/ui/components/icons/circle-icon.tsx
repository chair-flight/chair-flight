import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const CircleIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <circle cx="8" cy="8" r="6" />
    </SvgIcon>
  );
};
