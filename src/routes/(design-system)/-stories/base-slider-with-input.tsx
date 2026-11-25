import { useState } from "react";
import { SliderWithInput } from "../../../libs/ui/components/base/slider-with-input";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

export const BaseSliderWithInput: FC = () => {
  const [value, setValue] = useState(40);

  return (
    <StoryBlock title="Enabled and disabled">
      <div className="grid max-w-md gap-4">
        <SliderWithInput value={value} min={1} max={100} onChange={setValue} />
        <SliderWithInput
          value={value}
          min={1}
          max={100}
          disabled
          onChange={setValue}
        />
      </div>
    </StoryBlock>
  );
};
