import { Button } from "../../../libs/ui/components/base/button";
import { Toaster } from "../../../libs/ui/components/base/toaster";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

export const BaseToaster: FC = () => (
  <>
    <StoryBlock title="Example toasts">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => Toaster.toast("Link copied")}>Simple</Button>
        <Button
          onClick={() =>
            Toaster.toast(
              "Question added to the test. This is just additional test to demonstrate text wrapping on a toast. Pandas are not real. They don't exist",
            )
          }
        >
          Long Text
        </Button>
        <Button
          variant="success"
          onClick={() => Toaster.success("Answer recorded")}
        >
          Success
        </Button>
        <Button
          variant="danger"
          onClick={() => Toaster.error("Could not save")}
        >
          Error
        </Button>
      </div>
    </StoryBlock>
  </>
);
