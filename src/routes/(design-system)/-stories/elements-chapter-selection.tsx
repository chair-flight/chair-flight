import { ChapterSelection } from "../../../libs/ui/components/elements/chapter-selection";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

export const ElementsChapterSelection: FC = () => (
  <div className="flex flex-col gap-6">
    <StoryBlock title="Flat">
      <ChapterSelection
        chapters={[
          {
            id: "01",
            label: "01",
            title: "Airplane general",
            numberOfQuestions: 42,
          },
          {
            id: "02",
            label: "02",
            title: "Air systems",
            numberOfQuestions: 18,
          },
          {
            id: "03",
            label: "03",
            title: "Anti-ice and rain",
            numberOfQuestions: 1,
          },
        ]}
        getLink={(chapterId) => ({
          to: "/question-banks/$questionBank/chapters/$chapter",
          params: { questionBank: "b737", chapter: chapterId },
        })}
      />
    </StoryBlock>
    <StoryBlock title="Nested">
      <ChapterSelection
        chapters={[
          {
            id: "021",
            label: "021",
            title: "Aircraft general knowledge",
            numberOfQuestions: 60,
            chapters: [
              {
                id: "021.01",
                label: "01",
                title: "Fuselage",
                numberOfQuestions: 25,
              },
              {
                id: "021.02",
                label: "02",
                title: "Wings",
                numberOfQuestions: 35,
              },
            ],
          },
          {
            id: "022",
            label: "022",
            title: "Instrumentation",
            numberOfQuestions: 12,
            chapters: [
              {
                id: "022.01",
                label: "01",
                title: "Pitot-static",
                numberOfQuestions: 12,
              },
            ],
          },
        ]}
        getLink={(chapterId) => ({
          to: "/question-banks/$questionBank/chapters/$chapter",
          params: { questionBank: "atpl_a", chapter: chapterId },
        })}
      />
    </StoryBlock>
  </div>
);
