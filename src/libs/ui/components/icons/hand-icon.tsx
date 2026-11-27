import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const HandIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M6.61 9.06V4.12a1.06 1.06 0 0 1 2.12 0v3.53M8.73 7.65V3.06a1.06 1.06 0 0 1 2.12 0V7.65M10.85 7.65V4.12a1.06 1.06 0 0 1 2.12 0v5.65a4.24 4.24 0 0 1 -4.24 4.24h-0.71a4.24 4.24 0 0 1 -3.53 -2.12l-1.41 -2.47a1.06 1.06 0 0 1 1.76 -1.06L6.61 9.76" />
    </SvgIcon>
  );
};
