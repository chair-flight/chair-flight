import { createElement, useMemo } from "react";
import { cn } from "../../utils/cn";
import { parseMarkdown } from "../../utils/parse-markdown";
import { Highlight } from "../base/highlight";
import { MarkdownImage } from "../base/markdown-image";
import type { FC, ReactNode } from "react";
import type { MarkdownNode } from "../../utils/parse-markdown";

const renderNode = (
  node: MarkdownNode,
  highlight: string | string[] | undefined,
  key: number,
  renderAnnexes: boolean,
  onAnnexClick?: (href: string) => void,
): ReactNode => {
  if (typeof node === "string") {
    return (
      <Highlight key={key} highlight={highlight}>
        {node}
      </Highlight>
    );
  }

  if (node.tag === "raw") {
    return (
      <span key={key} dangerouslySetInnerHTML={{ __html: node.html ?? "" }} />
    );
  }

  if (node.tag === "img" && !renderAnnexes)
    return <span key={key}>[annex]</span>;

  if (node.tag === "img") {
    const href = node.props?.src;
    const modifiers = href?.split("#")[1]?.split(":") ?? [];
    const size = modifiers.includes("lg")
      ? "lg"
      : modifiers.includes("md")
        ? "md"
        : "sm";

    return (
      <MarkdownImage
        key={key}
        href={href}
        alt={node.props?.alt}
        size={size}
        onClick={onAnnexClick}
      />
    );
  }

  const children = node.children?.map((child, index) =>
    renderNode(
      child,
      node.tag === "code" ? undefined : highlight,
      index,
      renderAnnexes,
      onAnnexClick,
    ),
  );
  return createElement(node.tag, { key, ...node.props }, children);
};

export const Markdown: FC<{
  children: string;
  className?: string;
  highlight?: string | string[];
  question?: boolean;
  large?: boolean;
  renderAnnexes?: boolean;
  onAnnexClick?: (href: string) => void;
}> = ({
  children,
  className,
  highlight,
  question,
  large,
  renderAnnexes = false,
  onAnnexClick,
}) => {
  const nodes = useMemo(() => parseMarkdown(children), [children]);
  return (
    <div
      className={cn(
        "text-ink/80 wrap-break-word",
        large
          ? "text-base leading-6.5"
          : "[:where(&)]:text-[13px] [:where(&)]:leading-5.5",
        "*:first:mt-0 *:last:mb-0",
        "[&_:is(h1,h2,h3,h4)]:mt-5 [&_:is(h1,h2,h3,h4)]:mb-2",
        "[&_:is(h1,h2,h3,h4)]:font-bold [&_:is(h1,h2,h3,h4)]:text-ink",
        "[&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm",
        "[&_:is(p,ul,ol,table,blockquote)]:my-3",
        "[&_math[display=block]:not(.math-cell)]:my-3",
        "[&_math[display=block]:not(.math-cell)]:max-w-full",
        "[&_math[display=block]:not(.math-cell)]:overflow-x-auto",
        "[&_.math-lines]:my-3 [&_.math-lines]:grid [&_.math-lines]:max-w-full",
        "[&_.math-lines]:justify-center",
        "[&_.math-lines]:gap-x-[0.5em] [&_.math-lines]:gap-y-[1.5em]",
        "[&_.math-lines]:items-baseline [&_.math-lines]:overflow-x-auto",
        "[&_.math-cell]:justify-self-start",
        "**:data-[columns='1']:grid-cols-[max-content]",
        "**:data-[columns='2']:grid-cols-[max-content_max-content]",
        "**:data-[columns='2']:**:[.math-cell:nth-child(odd)]:justify-self-end",
        "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6",
        "[&_a]:text-accent [&_a]:underline",
        "[&_blockquote]:border-l-4 [&_blockquote]:border-rule-strong",
        "[&_blockquote]:pl-4 [&_blockquote]:text-muted",
        "[&_blockquote_:is(ul,ol)]:my-0 [&_blockquote_li]:my-1",
        "[&_:is(strong,b)]:font-extrabold [&_:is(strong,b)]:text-ink",
        "[&_blockquote_:is(strong,b)]:font-bold",
        "[&_blockquote_:is(strong,b)]:text-[color-mix(in_srgb,var(--ink)_70%,var(--muted))]",
        "[&_table]:block [&_table]:w-full [&_table]:overflow-x-auto",
        "[&_table]:border-collapse",
        "[&_:is(th,td)]:border [&_:is(th,td)]:border-rule",
        "[&_:is(th,td)]:px-2 [&_:is(th,td)]:py-1 [&_:is(th,td)]:text-left",
        "[&_code]:rounded [&_code]:bg-accent-soft [&_code]:px-1",
        large ? "[&_code]:text-sm" : "[&_code]:text-[13px]",
        question && "[&_thead]:bg-accent-soft",
        question && "[&_tbody_:is(th,td)]:bg-paper",
        className,
      )}
    >
      {nodes.map((node, index) =>
        renderNode(node, highlight, index, renderAnnexes, onAnnexClick),
      )}
    </div>
  );
};
