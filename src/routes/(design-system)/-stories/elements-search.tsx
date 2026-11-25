import { useState } from "react";
import { Highlighted } from "../../../libs/ui/components/base/highlighted";
import { Search } from "../../../libs/ui/components/elements/search";
import { cn } from "../../../libs/ui/utils/cn";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

const ITEMS = [
  { id: "01", title: "Aircraft general", detail: "42 questions" },
  { id: "02", title: "Air systems", detail: "18 questions" },
  { id: "03", title: "Anti-ice and rain", detail: "7 questions" },
];

export const ElementsSearch: FC = () => {
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();
  const found = ITEMS.filter((item) =>
    item.title.toLowerCase().includes(trimmed),
  );

  return (
    <StoryBlock title="Default">
      <div
        className={cn(
          "flex h-[520px] flex-col overflow-hidden rounded-lg border",
          "border-rule [transform:translateZ(0)]",
        )}
      >
        <Search active={Boolean(trimmed)}>
          <Search.Lead>
            <div
              className={cn(
                "flex flex-col items-center justify-center px-8 pt-8 pb-2",
                "text-center",
              )}
            >
              <span
                className={cn(
                  "text-xs font-semibold tracking-widest text-muted uppercase",
                )}
              >
                Chair Flight
              </span>
              <h1
                className={cn(
                  "m-0 bg-linear-to-b from-ink to-accent bg-clip-text",
                  "text-5xl leading-tight font-bold tracking-tight",
                  "text-transparent lg:text-6xl",
                )}
              >
                {737}
              </h1>
            </div>
          </Search.Lead>
          <Search.Bar
            value={query}
            placeholder="Search..."
            onChange={setQuery}
          />
          {trimmed && found.length === 0 && (
            <Search.Empty>Nothing found for “{trimmed}”.</Search.Empty>
          )}
          {trimmed && found.length > 0 && (
            <Search.Results>
              <Search.Group title="Chapters">
                {found.map((item) => (
                  <Search.Item
                    key={item.id}
                    link={{ to: "/design-system/{-$story}" }}
                    className="items-baseline gap-3"
                  >
                    <span className="font-mono font-semibold text-accent">
                      {item.id}
                    </span>
                    <span className="font-semibold">
                      <Highlighted text={item.title} words={[trimmed]} />
                    </span>
                    <span className="ml-auto text-xs text-muted">
                      {item.detail}
                    </span>
                  </Search.Item>
                ))}
              </Search.Group>
            </Search.Results>
          )}
        </Search>
      </div>
    </StoryBlock>
  );
};
