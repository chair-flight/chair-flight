import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import { ButtonCard } from "../base/button-card";
import { ButtonIcon } from "../base/button-icon";
import { ChevronLeftIcon } from "../icons/chevron-left-icon";
import type { LinkProps } from "@tanstack/react-router";
import type { CSSProperties, FC } from "react";

type Chapter = {
  id: string;
  label?: string;
  title: string;
  numberOfQuestions: number;
  chapters?: Chapter[];
};

export const ChapterSelection: FC<{
  title?: string;
  chapters: Chapter[];
  getLink: (chapterId: string) => LinkProps;
}> = ({ title = "Questions", chapters, getLink }) => {
  const [path, setPath] = useState<string[]>([]);
  const [depth, setDepth] = useState(0);
  const [opening, setOpening] = useState(false);
  const [height, setHeight] = useState<number>();
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  const levels = path.reduce(
    (accumulated, chapterId) => {
      const selected = accumulated
        .at(-1)
        ?.chapters.find((chapter) => chapter.id === chapterId);
      if (!selected?.chapters) return accumulated;
      return accumulated.concat({
        title: selected.title,
        chapters: selected.chapters,
      });
    },
    [{ title, chapters }],
  );

  useEffect(() => {
    if (!opening) return;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setDepth(depth + 1);
        setOpening(false);
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [opening, depth]);

  useEffect(() => {
    const panel = panelRefs.current[depth];
    if (!panel) return;
    const observer = new ResizeObserver(() => setHeight(panel.offsetHeight));
    observer.observe(panel);
    return () => observer.disconnect();
  }, [depth]);

  return (
    <div
      style={{ "--height": `${height}px` } as CSSProperties}
      className={cn(
        "-mx-(--gap) overflow-clip px-(--gap) [--gap:1rem] md:[--gap:2rem]",
        height !== undefined && "max-md:h-(--height)",
        "max-md:transition-[height] max-md:duration-400 max-md:ease-in-out",
        "[mask-image:linear-gradient(to_right,transparent,black_var(--gap),black_calc(100%_-_var(--gap)),transparent)]",
      )}
    >
      <div
        style={
          {
            "--panels": levels.length,
            "--depth": depth,
          } as CSSProperties
        }
        className={cn(
          "flex w-[calc(var(--panels)*100%+(var(--panels)-1)*var(--gap))]",
          "gap-(--gap) transition-transform duration-400",
          "will-change-transform ease-in-out **:backdrop-blur-none",
          "items-start md:h-111.5 md:items-stretch",
          "translate-x-[calc(var(--depth)/var(--panels)*-1*(100%+var(--gap)))]",
        )}
      >
        {levels.map((level, index) => (
          <div
            key={index}
            ref={(element) => {
              panelRefs.current[index] = element;
            }}
            inert={index !== depth}
            className="flex min-w-0 flex-1 flex-col gap-4"
          >
            <div
              className={cn(
                "flex h-8 flex-none items-center gap-2",
                index === 0 && "justify-center",
              )}
            >
              {index > 0 && (
                <ButtonIcon
                  label="Back"
                  icon={ChevronLeftIcon}
                  onClick={() => setDepth(index - 1)}
                />
              )}
              <h2
                className={cn(
                  "m-0 truncate",
                  index === 0
                    ? "text-xs font-semibold tracking-widest text-muted uppercase"
                    : "text-sm font-semibold text-ink",
                )}
              >
                {level.title}
              </h2>
            </div>
            <ul
              className={cn(
                "m-0 grid min-h-0 flex-1 list-none grid-cols-1 content-start",
                "gap-0 overflow-y-auto p-0 md:grid-cols-3 md:gap-3",
              )}
            >
              {level.chapters.map((chapter) => (
                <ButtonCard
                  key={chapter.id}
                  label={chapter.label}
                  title={chapter.title}
                  subtitle={`${chapter.numberOfQuestions} ${chapter.numberOfQuestions === 1 ? "question" : "questions"}`}
                  link={chapter.chapters ? undefined : getLink(chapter.id)}
                  onSelect={() => {
                    setPath([...path.slice(0, index), chapter.id]);
                    setOpening(true);
                  }}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
