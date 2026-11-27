import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const LinkIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props} filled>
      <path d="M2.6 8c0 -1.14 0.93 -2.07 2.07 -2.07h2.67V4.67H4.67c-1.84 0 -3.33 1.49 -3.33 3.33s1.49 3.33 3.33 3.33h2.67v-1.27H4.67c-1.14 0 -2.07 -0.93 -2.07 -2.07zM5.33 8.67h5.33v-1.33H5.33v1.33zm6 -4h-2.67v1.27h2.67c1.14 0 2.07 0.93 2.07 2.07s-0.93 2.07 -2.07 2.07h-2.67V11.33h2.67c1.84 0 3.33 -1.49 3.33 -3.33s-1.49 -3.33 -3.33 -3.33z" />
    </SvgIcon>
  );
};
