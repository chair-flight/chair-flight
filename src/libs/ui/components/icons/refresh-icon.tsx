import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const RefreshIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M14 8a6 6 0 1 1 -1.75 -4.25L14 5.38" />
      <path d="M14 2v3.38h-3.38" />
    </SvgIcon>
  );
};
