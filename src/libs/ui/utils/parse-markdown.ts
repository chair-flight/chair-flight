import { convertLatexAsMathml } from "./convert-latex-as-mathml";

export type MarkdownNode =
  | string
  | {
      tag: string;
      props?: Record<string, string>;
      children?: MarkdownNode[];
      html?: string;
    };

const HEADING = /^ {0,3}(#{1,6})\s+(.*?)(?:\s+#+)?\s*$/;
const MATH_FENCE = /^ {0,3}\$\$/;
const QUOTE = /^ {0,3}>/;
const BULLET = /^( {0,3})[-*+]\s+(.*)$/;
const ORDERED = /^( {0,3})(\d{1,9})[.)]\s+(.*)$/;
const TABLE_SEPARATOR = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;
const INLINE =
  /\\(?<escaped>[\\`*_{}[\]()#+\-.!|<>~])|\$\$(?<math>[^$]+?)\$\$|`(?<code>[^`]+)`|(?<html><(?<htmlTag>math|sub|sup)\b[^>]*>[\s\S]*?<\/\k<htmlTag>>)|(?<bang>!?)\[(?<label>[^\]]*)\]\((?<target>[^)\s]+)\)|\*\*(?<strong>[^\s*](?:[\s\S]*?[^\s*])??)\*\*|\*(?<emphasis>[^*\s](?:[\s\S]*?[^*\s])??)\*|(?<![\w])_(?<underscore>[^_\s](?:[\s\S]*?[^_\s])??)_(?!\w)|(?<lineBreak>(?: {2,}|\\)\n)/g;
const ALLOWED_HTML_TAGS = new Set([
  "math",
  "sub",
  "sup",
  "semantics",
  "mrow",
  "mi",
  "mn",
  "mo",
  "ms",
  "mtext",
  "mspace",
  "mstyle",
  "mfrac",
  "msqrt",
  "mroot",
  "msub",
  "msup",
  "msubsup",
  "munder",
  "mover",
  "munderover",
  "mtable",
  "mtr",
  "mtd",
]);
const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

const decodeEntities = (text: string) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, name: string) => {
    if (name[0] !== "#") return ENTITIES[name] ?? entity;
    const code =
      name[1] === "x"
        ? Number.parseInt(name.slice(2), 16)
        : Number(name.slice(1));
    return String.fromCodePoint(code);
  });

const sanitiseHtml = (html: string) =>
  html.replace(/<(\/?)([a-z][a-z0-9]*)\b[^>]*>/gi, (_tag, slash, name) =>
    ALLOWED_HTML_TAGS.has(name.toLowerCase())
      ? `<${slash}${name.toLowerCase()}>`
      : "",
  );

const isSafeTarget = (target: string) =>
  !/^[a-z][a-z0-9+.-]*:/i.test(target) || /^(https?|mailto):/i.test(target);

const parseInline = (text: string): MarkdownNode[] => {
  const matches = [...text.matchAll(INLINE)];
  const nodes = matches.flatMap((match, index) => {
    const previous = matches[index - 1];
    const gap = text.slice(
      previous ? previous.index + previous[0].length : 0,
      match.index,
    );
    const {
      escaped,
      math,
      code,
      html,
      bang,
      label,
      target,
      strong,
      emphasis,
      underscore,
    } = match.groups ?? {};
    const node: MarkdownNode =
      escaped !== undefined
        ? escaped
        : math !== undefined
          ? { tag: "raw", html: convertLatexAsMathml(math, "inline") }
          : code !== undefined
            ? { tag: "code", children: [code] }
            : html !== undefined
              ? { tag: "raw", html: sanitiseHtml(html) }
              : target !== undefined && bang
                ? isSafeTarget(target)
                  ? { tag: "img", props: { src: target, alt: label ?? "" } }
                  : (label ?? "")
                : target !== undefined && !isSafeTarget(target)
                  ? { tag: "span", children: parseInline(label ?? "") }
                  : target !== undefined
                    ? {
                        tag: "a",
                        props: { href: target },
                        children: parseInline(label ?? ""),
                      }
                    : strong !== undefined
                      ? { tag: "strong", children: parseInline(strong) }
                      : emphasis !== undefined || underscore !== undefined
                        ? {
                            tag: "em",
                            children: parseInline(emphasis ?? underscore ?? ""),
                          }
                        : { tag: "br" };
    return [decodeEntities(gap), node];
  });
  const last = matches.at(-1);
  const tail = text.slice(last ? last.index + last[0].length : 0);
  return [...nodes, decodeEntities(tail)]
    .filter((node) => node !== "")
    .reduce<MarkdownNode[]>((merged, node) => {
      const previous = merged.at(-1);
      if (typeof node === "string" && typeof previous === "string")
        merged[merged.length - 1] = previous + node;
      else merged.push(node);
      return merged;
    }, []);
};

const splitTableRow = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim());

const startsBlock = (line: string) =>
  HEADING.test(line) ||
  MATH_FENCE.test(line) ||
  QUOTE.test(line) ||
  BULLET.test(line) ||
  /^ {0,3}1[.)]\s+/.test(line);

const parseBlocks = (lines: string[]): MarkdownNode[] => {
  const blocks: MarkdownNode[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    const heading = HEADING.exec(line);
    const ordered = ORDERED.test(line);
    if (!line.trim()) {
      index += 1;
    } else if (heading) {
      blocks.push({
        tag: `h${heading[1].length}`,
        children: parseInline(heading[2]),
      });
      index += 1;
    } else if (MATH_FENCE.test(line)) {
      const opening = line.replace(MATH_FENCE, "");
      const gathered = [opening];
      index += 1;
      while (!gathered.join("\n").includes("$$") && index < lines.length) {
        gathered.push(lines[index]);
        index += 1;
      }
      const latex = gathered.join("\n").split("$$")[0];
      blocks.push({ tag: "raw", html: convertLatexAsMathml(latex, "block") });
    } else if (QUOTE.test(line)) {
      const quoted: string[] = [];
      while (
        index < lines.length &&
        lines[index].trim() &&
        (QUOTE.test(lines[index]) || !startsBlock(lines[index]))
      ) {
        quoted.push(lines[index].replace(/^ {0,3}> ?/, ""));
        index += 1;
      }
      blocks.push({ tag: "blockquote", children: parseBlocks(quoted) });
    } else if (BULLET.test(line) || ordered) {
      const marker = ordered ? ORDERED : BULLET;
      const items: { lines: string[]; blankAfter: boolean }[] = [];
      while (index < lines.length && marker.test(lines[index])) {
        const match = marker.exec(lines[index]) as RegExpExecArray;
        const text = match[match.length - 1];
        const indent = lines[index].length - text.length;
        const itemLines = [text];
        let blankAfter = false;
        index += 1;
        while (index < lines.length) {
          const next = lines[index];
          if (!next.trim()) {
            const after = lines[index + 1];
            if (after !== undefined && /^ {2,}\S/.test(after)) {
              itemLines.push("");
              index += 1;
              continue;
            }
            blankAfter = after !== undefined && marker.test(after);
            break;
          }
          if (marker.test(next) && !/^ {2,}/.test(next)) break;
          if (!/^ {2,}/.test(next) && startsBlock(next)) break;
          itemLines.push(next.slice(Math.min(indent, next.search(/\S/))));
          index += 1;
        }
        items.push({ lines: itemLines, blankAfter });
        if (blankAfter) index += 1;
      }
      const parsedItems = items.map(({ lines: itemLines, blankAfter }) => {
        const blocks = parseBlocks(itemLines);
        const last = blocks.at(-1);
        const endsWithList =
          typeof last === "object" && (last.tag === "ul" || last.tag === "ol");
        const spread =
          (blankAfter && !endsWithList) ||
          (blocks.length > 1 && itemLines.includes(""));
        return { blocks, spread };
      });
      const loose = parsedItems.some(({ spread }) => spread);
      const start = ordered ? Number(ORDERED.exec(line)?.[2]) : 1;
      blocks.push({
        tag: ordered ? "ol" : "ul",
        props: ordered && start !== 1 ? { start: String(start) } : undefined,
        children: parsedItems.map(({ blocks: itemBlocks }) => ({
          tag: "li",
          children: itemBlocks.flatMap((block) =>
            !loose && typeof block !== "string" && block.tag === "p"
              ? (block.children ?? [])
              : [block],
          ),
        })),
      });
    } else if (
      line.includes("|") &&
      lines[index + 1] !== undefined &&
      lines[index + 1].includes("-") &&
      TABLE_SEPARATOR.test(lines[index + 1])
    ) {
      const header = splitTableRow(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].trim()) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      blocks.push({
        tag: "table",
        children: [
          {
            tag: "thead",
            children: [
              {
                tag: "tr",
                children: header.map((cell) => ({
                  tag: "th",
                  children: parseInline(cell),
                })),
              },
            ],
          },
          {
            tag: "tbody",
            children: rows.map((row) => ({
              tag: "tr",
              children: header.map((_, column) => ({
                tag: "td",
                children: parseInline(row[column] ?? ""),
              })),
            })),
          },
        ],
      });
    } else {
      const paragraph = [line];
      index += 1;
      while (
        index < lines.length &&
        lines[index].trim() &&
        !startsBlock(lines[index])
      ) {
        paragraph.push(lines[index]);
        index += 1;
      }
      blocks.push({
        tag: "p",
        children: parseInline(paragraph.join("\n").trim()),
      });
    }
  }
  return blocks;
};

export const parseMarkdown = (source: string) =>
  parseBlocks(source.replaceAll("\r\n", "\n").split("\n"));
