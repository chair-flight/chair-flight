import { useState } from "react";
import { Checkbox } from "../../../libs/ui/components/base/checkbox";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

const OPTIONS = ["Meteorology", "Navigation", "Performance"];

export const BaseCheckbox: FC = () => {
  const [checked, setChecked] = useState<string[]>(["Navigation"]);
  const all = checked.length === OPTIONS.length;

  return (
    <div className="grid gap-6">
      <StoryBlock title="States">
        <div className="grid gap-3">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox />
            Unchecked
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox defaultChecked />
            Checked
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox disabled defaultChecked />
            Disabled
          </label>
        </div>
      </StoryBlock>
      <StoryBlock title="Indeterminate">
        <div className="grid gap-2">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <Checkbox
              checked={all}
              indeterminate={!all && checked.length > 0}
              onChange={() => setChecked(all ? [] : OPTIONS)}
            />
            All subjects
          </label>
          {OPTIONS.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 pl-6 text-sm"
            >
              <Checkbox
                checked={checked.includes(option)}
                onChange={() =>
                  setChecked(
                    checked.includes(option)
                      ? checked.filter((value) => value !== option)
                      : [...checked, option],
                  )
                }
              />
              {option}
            </label>
          ))}
        </div>
      </StoryBlock>
    </div>
  );
};
