import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const ArrowDownIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M8 2v12" />
      <path d="M14 8l-6 6 -6 -6" />
    </SvgIcon>
  );
};
