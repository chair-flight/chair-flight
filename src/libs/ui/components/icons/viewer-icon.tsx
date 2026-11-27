import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const ViewerIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <rect x="2" y="2.67" width="12" height="10.67" rx="1.33" />
      <path d="M5.33 6h5.33M5.33 8.67h5.33M5.33 11.33h3.33" />
    </SvgIcon>
  );
};
