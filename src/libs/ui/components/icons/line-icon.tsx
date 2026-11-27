import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const LineIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M2 14L14 2" />
    </SvgIcon>
  );
};
