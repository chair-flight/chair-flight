import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const HandIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M8 13V6a1.500 1.500 0 0 1 3 0v5M11 11V4.500a1.500 1.500 0 0 1 3 0V11M14 11V6a1.500 1.500 0 0 1 3 0v8a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-3l-2-3.500a1.500 1.500 0 0 1 2.500-1.500L8 14" />
    </SvgIcon>
  );
};
