import { LearningObjectivesTable } from "../../../libs/ui/components/elements/learning-objectives-table";
import {
  STORY_LEARNING_OBJECTIVE_COURSES,
  STORY_LEARNING_OBJECTIVES,
} from "../-mock-data/design-system-mock-data";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

export const ElementsLearningObjectivesTable: FC = () => (
  <div className="flex flex-col gap-8">
    <StoryBlock title="Default">
      <div className="h-96">
        <LearningObjectivesTable
          items={STORY_LEARNING_OBJECTIVES}
          courses={STORY_LEARNING_OBJECTIVE_COURSES}
        />
      </div>
    </StoryBlock>
    <StoryBlock title="Highlight and filter">
      <div className="h-96">
        <LearningObjectivesTable
          items={STORY_LEARNING_OBJECTIVES}
          highlight="atmosphere"
          filterItems={["050", "050.01", "050.01.01"]}
          courses={STORY_LEARNING_OBJECTIVE_COURSES}
        />
      </div>
    </StoryBlock>
    <StoryBlock title="Loading">
      <div className="h-96">
        <LearningObjectivesTable
          loading
          items={[]}
          courses={STORY_LEARNING_OBJECTIVE_COURSES}
        />
      </div>
    </StoryBlock>
  </div>
);
