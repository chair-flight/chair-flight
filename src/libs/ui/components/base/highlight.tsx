import type { FC } from "react";

const MAX_WORDS = 8;

const patterns = new Map<string, RegExp | null>();

const buildPattern = (words: string[]) => {
  const key = words.join("\n");
  const cached = patterns.get(key);
  if (cached !== undefined) return cached;
  const terms = Array.from(
    new Set(
      words.flatMap((word) => {
        const stem =
          word.length > 4 ? word.replace(/(ing|ed|es|s)$/, "") : word;
        return [word, stem];
      }),
    ),
  )
    .filter((term) => term.length > 1)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern =
    terms.length === 0 ? null : new RegExp(`\\b(${terms.join("|")})`, "gi");
  if (patterns.size > 50) patterns.clear();
  patterns.set(key, pattern);
  return pattern;
};

export const Highlight: FC<{
  highlight?: string | string[];
  children: string;
}> = ({ highlight, children }) => {
  const words = (
    Array.isArray(highlight) ? highlight : (highlight ?? "").split(/\s+/)
  )
    .map((word) => word.trim())
    .filter((word) => word.length > 1)
    .slice(0, MAX_WORDS);
  const pattern = buildPattern(words);
  if (!pattern) return children;
  return children.split(pattern).map((part, index) => {
    const key = `${index}-${part}`;
    if (index % 2 === 0) return part;
    return (
      <mark key={key} className="rounded-sm bg-warning/40 text-inherit">
        {part}
      </mark>
    );
  });
};
