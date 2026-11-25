import { Link } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { useKeyboardShortcuts } from "../../hooks/use-keyboard-shortcuts";
import { cn } from "../../utils/cn";
import { Checkbox } from "../base/checkbox";
import { Highlight } from "../base/search-highlight";
import type { LinkProps } from "@tanstack/react-router";
import type { FC } from "react";

type ThreadItem = {
  id: string;
  parentId: string | null;
  level: number;
  text: string;
  items: string[];
  source: string;
  courses: string[];
  numberOfQuestions: number | null;
};

type ThreadNode = {
  item: ThreadItem;
  children: ThreadNode[];
};

type WindowNode = {
  index: number;
  children: WindowNode[];
};

type FlatRow = {
  item: ThreadItem;
  depth: number;
  parent: boolean;
  open: boolean;
  ancestorIds: string[];
};

type Course = {
  id: string;
  text: string;
};

const HEADER_HEIGHT = 32;
const PARENT_HEIGHT = 32;
const LEAF_HEIGHT_ESTIMATE = 56;

const nestWindowRows = (rows: FlatRow[], indexes: number[]) => {
  const roots: WindowNode[] = [];
  const stack: WindowNode[] = [];
  for (const index of indexes) {
    const node: WindowNode = { index, children: [] };
    const depth = rows[index]?.depth ?? 0;
    while (
      stack.length > 0 &&
      (rows[stack.at(-1)?.index ?? 0]?.depth ?? 0) >= depth
    ) {
      stack.pop();
    }
    const parentNode = stack.at(-1);
    (parentNode ? parentNode.children : roots).push(node);
    stack.push(node);
  }
  return roots;
};

const buildThreadNodes = (items: ThreadItem[]) => {
  const nodesById = new Map(
    items.map((item) => [item.id, { item, children: [] as ThreadNode[] }]),
  );
  return items.flatMap((item) => {
    const node = nodesById.get(item.id);
    if (!node) return [];
    const parent = item.parentId ? nodesById.get(item.parentId) : undefined;
    if (!parent) return [node];
    parent.children.push(node);
    return [];
  });
};

const findVisibleIds = (items: ThreadItem[], query: string) => {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const parentIds = tokens
    .filter((token) => token.startsWith("parent:"))
    .map((token) => token.slice("parent:".length));
  const words = tokens.filter((token) => !token.startsWith("parent:"));
  if (tokens.length === 0) return null;
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const childIdsByParentId = items.reduce((groups, item) => {
    if (!item.parentId) return groups;
    groups.set(item.parentId, [...(groups.get(item.parentId) ?? []), item]);
    return groups;
  }, new Map<string, ThreadItem[]>());
  const visibleIds = new Set<string>();
  const addAncestors = (parentId: string | null) => {
    if (!parentId || !itemsById.has(parentId) || visibleIds.has(parentId)) {
      return;
    }
    visibleIds.add(parentId);
    addAncestors(itemsById.get(parentId)?.parentId ?? null);
  };
  const addDescendants = (id: string) => {
    visibleIds.add(id);
    for (const child of childIdsByParentId.get(id) ?? []) {
      addDescendants(child.id);
    }
  };
  for (const item of items) {
    const inScope =
      parentIds.length === 0 ||
      parentIds.some((id) => {
        const itemId = item.id.toLowerCase();
        return itemId === id || itemId.startsWith(`${id}.`);
      });
    if (!inScope) continue;
    const haystack = `${item.id} ${item.text}`.toLowerCase();
    if (!words.every((word) => haystack.includes(word))) continue;
    addDescendants(item.id);
    addAncestors(item.parentId);
  }
  return visibleIds;
};

const flattenNode = (
  node: ThreadNode,
  depth: number,
  ancestorIds: string[],
  visibleIds: Set<string> | null,
  collapsedIds: Set<string>,
): FlatRow[] => {
  const children = visibleIds
    ? node.children.filter((child) => visibleIds.has(child.item.id))
    : node.children;
  const open = !collapsedIds.has(node.item.id);
  return [
    { item: node.item, depth, parent: children.length > 0, open, ancestorIds },
    ...(open
      ? children.flatMap((child) =>
          flattenNode(
            child,
            depth + 1,
            [...ancestorIds, node.item.id],
            visibleIds,
            collapsedIds,
          ),
        )
      : []),
  ];
};

const ItemText: FC<{
  text: string;
  items: string[];
  className?: string;
}> = ({ text, items, className }) => (
  <div className={cn("leading-6 wrap-break-word", className)}>
    <p className="m-0">
      <Highlight>{text}</Highlight>
    </p>
    {items.length > 0 && (
      <ul className="mt-3 mb-0 list-disc pl-6">
        {items.map((item) => (
          <li key={item}>
            <Highlight>{item}</Highlight>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const TableSkeleton: FC = () => (
  <div
    role="status"
    aria-label="Loading Learning Objectives"
    className={cn(
      "relative h-full overflow-hidden rounded-lg border border-rule",
      "bg-paper text-[13px]",
    )}
  >
    <div
      className={cn(
        "grid grid-cols-[12.5rem_minmax(0,1fr)_5.5rem_5rem]",
        "h-8 items-center border-b border-rule text-xs font-semibold",
        "text-muted",
      )}
    >
      {["Learning Objective", "Description", "Courses", "Questions"].map(
        (header, index) => (
          <div
            key={header}
            className={cn(
              index === 0 && "pl-3",
              index === 3 && "pr-3 text-right",
            )}
          >
            {header}
          </div>
        ),
      )}
    </div>
    {[0, 1, 2, 2, 2, 1, 2, 2, 3, 3, 2, 1, 2, 2, 0, 1].map((depth, index) => (
      <div
        key={index}
        className={cn(
          "grid grid-cols-[12.5rem_minmax(0,1fr)_5.5rem_5rem]",
          "h-12 animate-pulse",
        )}
      >
        <div
          className="flex items-center border-b border-rule"
          style={{ marginLeft: `${0.75 + depth}rem` }}
        >
          <div className="h-3 w-20 rounded bg-rule" />
        </div>
        <div className="flex items-center border-b border-rule pr-4">
          <div
            className="h-3 rounded bg-rule"
            style={{ width: `${40 + ((index * 17) % 50)}%` }}
          />
        </div>
        <div className="flex items-center border-b border-rule">
          <div className="h-2 w-12 rounded bg-rule" />
        </div>
        <div className="border-b border-rule" />
      </div>
    ))}
    <div className="absolute inset-0 top-8 flex items-center justify-center">
      <div
        className={cn(
          "size-8 animate-spin rounded-full border-2 border-rule-strong",
          "border-t-accent",
        )}
      />
    </div>
  </div>
);

const CourseFilter: FC<{
  courses: Course[];
  hiddenCourseIds: string[];
  className?: string;
  onToggle: (courseId: string) => void;
  onSelectAll: () => void;
}> = ({ courses, hiddenCourseIds, className, onToggle, onSelectAll }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", closeOnOutsidePress);
    return () => window.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-6 cursor-pointer items-center gap-1 rounded-md px-1.5",
          "text-xs font-semibold hover:text-ink",
          hiddenCourseIds.length > 0 ? "text-accent" : "text-muted",
        )}
      >
        Courses
        {hiddenCourseIds.length > 0 &&
          ` · ${courses.length - hiddenCourseIds.length}`}
        <span aria-hidden>▾</span>
      </button>
      {open && (
        <ul
          className={cn(
            "absolute top-full right-0 z-40 m-0 mt-1 flex w-56 list-none",
            "flex-col gap-1 rounded-md border border-rule bg-paper p-2",
            "text-xs font-normal text-ink shadow-lg",
          )}
        >
          {hiddenCourseIds.length > 0 && (
            <li>
              <button
                type="button"
                onClick={onSelectAll}
                className="cursor-pointer font-semibold text-accent"
              >
                Select all
              </button>
            </li>
          )}
          {courses.map((course) => (
            <li key={course.id}>
              <label className="flex cursor-pointer items-center gap-2 py-0.5">
                <Checkbox
                  checked={!hiddenCourseIds.includes(course.id)}
                  onChange={() => onToggle(course.id)}
                />
                {course.text}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const CoursesCell: FC<{
  item: ThreadItem;
  courses: Course[];
  parent: boolean;
}> = ({ item, courses, parent }) => (
  <div
    className={cn(
      "flex items-center border-b border-rule",
      "text-[8px] tracking-wider text-muted",
      parent && "pointer-events-auto bg-paper",
    )}
  >
    {item.courses.length > 0 && (
      <span
        data-courses={item.courses.join(" ")}
        className="inline-block cursor-default"
      >
        {courses
          .map((course) => (item.courses.includes(course.id) ? "●" : "○"))
          .join("")}
      </span>
    )}
  </div>
);

const QuestionsCell: FC<{
  item: ThreadItem;
  parent: boolean;
  questionsLink?: (learningObjectiveId: string) => LinkProps | undefined;
}> = ({ item, parent, questionsLink }) => (
  <div
    className={cn(
      "flex items-center justify-end border-b border-rule",
      "pr-3 text-xs text-muted tabular-nums",
      parent && "pointer-events-auto bg-paper",
    )}
  >
    {item.numberOfQuestions && questionsLink?.(item.id) ? (
      <Link
        {...questionsLink(item.id)}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        className="font-semibold text-accent underline-offset-2 hover:underline"
      >
        {item.numberOfQuestions}
      </Link>
    ) : (
      item.numberOfQuestions || "-"
    )}
  </div>
);

const ParentRow = memo<{
  item: ThreadItem;
  depth: number;
  open: boolean;
  courses: Course[];
  questionsLink?: (learningObjectiveId: string) => LinkProps | undefined;
  onToggle: (id: string) => void;
}>(({ item, depth, open, courses, questionsLink, onToggle }) => (
  <div
    className={cn(
      "pointer-events-none grid h-8",
      "grid-cols-[12.5rem_minmax(0,1fr)_5.5rem_5rem]",
      depth === 0 && "border-t-2 border-rule bg-paper",
    )}
  >
    <button
      type="button"
      aria-expanded={open}
      onClick={() => onToggle(item.id)}
      className={cn(
        "pointer-events-auto flex cursor-pointer items-center border-b",
        "border-rule bg-paper pr-2 text-left font-semibold",
      )}
      style={{ marginLeft: `${0.75 + depth}rem` }}
    >
      <Highlight>{item.id}</Highlight>
    </button>
    <div
      title={item.text}
      className={cn(
        "pointer-events-auto flex items-center truncate border-b border-rule",
        "bg-paper pr-4 font-semibold",
      )}
    >
      <span className="truncate">
        <Highlight>{item.text}</Highlight>
      </span>
    </div>
    <CoursesCell item={item} courses={courses} parent />
    <QuestionsCell item={item} parent questionsLink={questionsLink} />
  </div>
));

const LeafRow = memo<{
  item: ThreadItem;
  depth: number;
  courses: Course[];
  questionsLink?: (learningObjectiveId: string) => LinkProps | undefined;
}>(({ item, depth, courses, questionsLink }) => (
  <div className="grid grid-cols-[12.5rem_minmax(0,1fr)_5.5rem_5rem]">
    <div
      className={cn("border-b border-rule", "py-2 pt-2.5 pr-2 font-semibold")}
      style={{ marginLeft: `${0.75 + depth}rem` }}
    >
      <Highlight>{item.id}</Highlight>
    </div>
    <div className={cn("border-b border-rule", "py-2 pr-4")}>
      <ItemText text={item.text} items={item.items} />
      {item.source && (
        <div className="mt-1.5 text-[11px] whitespace-pre-line text-muted/75">
          {item.source}
        </div>
      )}
    </div>
    <CoursesCell item={item} courses={courses} parent={false} />
    <QuestionsCell item={item} parent={false} questionsLink={questionsLink} />
  </div>
));

export const LearningObjectivesTable: FC<{
  items: ThreadItem[];
  query: string;
  courses: Course[];
  loading?: boolean;
  questionsLink?: (learningObjectiveId: string) => LinkProps | undefined;
}> = ({ items, query, courses, loading = false, questionsLink }) => {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [hiddenCourseIds, setHiddenCourseIds] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLUListElement>(null);

  const filteredItems = useMemo(
    () =>
      hiddenCourseIds.length === 0
        ? items
        : items.filter((item) =>
            item.courses.some((id) => !hiddenCourseIds.includes(id)),
          ),
    [items, hiddenCourseIds],
  );
  const roots = useMemo(() => buildThreadNodes(filteredItems), [filteredItems]);
  const visibleIds = useMemo(
    () => findVisibleIds(filteredItems, query),
    [filteredItems, query],
  );
  const rows = useMemo(
    () =>
      roots
        .filter((root) => !visibleIds || visibleIds.has(root.item.id))
        .flatMap((root) => flattenNode(root, 0, [], visibleIds, collapsedIds)),
    [roots, visibleIds, collapsedIds],
  );
  const indexById = useMemo(
    () => new Map(rows.map((row, index) => [row.item.id, index])),
    [rows],
  );

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) =>
      rows[index]?.parent ? PARENT_HEIGHT : LEAF_HEIGHT_ESTIMATE,
    getItemKey: (index) => rows[index]?.item.id ?? index,
    scrollMargin: HEADER_HEIGHT,
    overscan: 12,
  });

  const toggleRow = (id: string) =>
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const collapseRow = (index: number) => {
    const row = rows[index];
    const start = virtualizer.measurementsCache[index]?.start;
    if (!row || start === undefined) return;
    flushSync(() =>
      setCollapsedIds((current) => new Set(current).add(row.item.id)),
    );
    const target = Math.max(
      0,
      start - HEADER_HEIGHT - row.depth * PARENT_HEIGHT,
    );
    if ((scrollRef.current?.scrollTop ?? 0) > target) {
      scrollRef.current?.scrollTo({ top: target });
    }
  };

  const foldToLevel = (level: number) =>
    setCollapsedIds(
      new Set(
        level === 0
          ? []
          : items.filter((item) => item.level >= level).map((item) => item.id),
      ),
    );

  useKeyboardShortcuts({
    "mod+k mod+0": () => foldToLevel(0),
    "mod+k mod+1": () => foldToLevel(1),
    "mod+k mod+2": () => foldToLevel(2),
    "mod+k mod+3": () => foldToLevel(3),
    "mod+k mod+4": () => foldToLevel(4),
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (query !== undefined) scrollRef.current?.scrollTo({ top: 0 });
  }, [query]);

  useEffect(() => {
    const container = scrollRef.current;
    const popover = popoverRef.current;
    if (!container || !popover) return;
    const hide = () => {
      popover.hidden = true;
    };
    const show = (event: MouseEvent) => {
      const row = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-courses]",
      );
      const appliesTo = row?.dataset.courses;
      if (!row || !appliesTo) return hide();
      const applicable = appliesTo.split(" ");
      for (const entry of Array.from(popover.children)) {
        const element = entry as HTMLElement;
        element.dataset.applies = String(
          applicable.includes(element.dataset.courseId ?? ""),
        );
      }
      popover.hidden = false;
      const rowRect = row.getBoundingClientRect();
      const popoverHeight = popover.offsetHeight;
      const below = rowRect.bottom + popoverHeight < window.innerHeight;
      popover.style.top = `${below ? rowRect.bottom + 4 : rowRect.top - popoverHeight - 4}px`;
      popover.style.left = `${rowRect.right - popover.offsetWidth}px`;
    };
    container.addEventListener("mouseover", show);
    container.addEventListener("mouseleave", hide);
    container.addEventListener("scroll", hide, { passive: true });
    return () => {
      container.removeEventListener("mouseover", show);
      container.removeEventListener("mouseleave", hide);
      container.removeEventListener("scroll", hide);
    };
  }, [loading, mounted]);

  const toggleCourse = (courseId: string) =>
    setHiddenCourseIds((current) =>
      current.includes(courseId)
        ? current.filter((id) => id !== courseId)
        : [...current, courseId],
    );

  if (loading) return <TableSkeleton />;

  const virtualItems = virtualizer.getVirtualItems();
  const firstItem = virtualItems.at(0);
  const lastItem = virtualItems.at(-1);
  const ancestorIndexes = (
    rows[firstItem?.index ?? 0]?.ancestorIds ?? []
  ).flatMap((id) => indexById.get(id) ?? []);
  const windowRoots = nestWindowRows(rows, [
    ...ancestorIndexes,
    ...virtualItems.map((item) => item.index),
  ]);
  const paddingTop = Math.max(
    0,
    (firstItem?.start ?? HEADER_HEIGHT) -
      HEADER_HEIGHT -
      ancestorIndexes.length * PARENT_HEIGHT,
  );
  const paddingBottom = Math.max(
    0,
    virtualizer.getTotalSize() -
      ((lastItem?.end ?? HEADER_HEIGHT) - HEADER_HEIGHT),
  );
  const renderNode = (node: WindowNode) => {
    const row = rows[node.index];
    if (!row) return null;
    if (!row.parent) {
      return (
        <div
          key={row.item.id}
          ref={virtualizer.measureElement}
          data-index={node.index}
        >
          <LeafRow
            item={row.item}
            depth={row.depth}
            courses={courses}
            questionsLink={questionsLink}
          />
        </div>
      );
    }
    return (
      <div key={row.item.id} className="relative">
        <div
          ref={virtualizer.measureElement}
          data-index={node.index}
          className="pointer-events-none sticky"
          style={{
            top: `${HEADER_HEIGHT + row.depth * PARENT_HEIGHT}px`,
            zIndex: 20 - row.depth,
          }}
        >
          <ParentRow
            item={row.item}
            depth={row.depth}
            open={row.open}
            courses={courses}
            questionsLink={questionsLink}
            onToggle={toggleRow}
          />
        </div>
        {node.children.length > 0 && (
          <>
            <button
              type="button"
              aria-label={`Collapse ${row.item.id}`}
              onClick={() => collapseRow(node.index)}
              className={cn(
                "group absolute bottom-0 z-1 flex w-4 cursor-pointer",
                "justify-center",
              )}
              style={{ left: `${0.75 + row.depth}rem`, top: "2rem" }}
            >
              <span
                className={cn(
                  "block w-px bg-muted/70",
                  "group-hover:w-0.5 group-hover:bg-accent",
                )}
              />
            </button>
            {node.children.map(renderNode)}
          </>
        )}
      </div>
    );
  };
  const empty = rows.length === 0;

  return (
    <div
      ref={scrollRef}
      className={cn(
        "h-full overflow-auto rounded-lg border border-rule bg-paper",
        "text-[13px]",
      )}
    >
      <div className="min-w-200">
        <div
          className={cn(
            "grid grid-cols-[12.5rem_minmax(0,1fr)_5.5rem_5rem]",
            "sticky top-0 z-30 h-8 items-center border-b border-rule bg-paper",
            "text-xs font-semibold text-muted",
          )}
        >
          <div className="pl-3">Learning Objective</div>
          <div className="pr-3">Description</div>
          <CourseFilter
            courses={courses}
            hiddenCourseIds={hiddenCourseIds}
            onToggle={toggleCourse}
            onSelectAll={() => setHiddenCourseIds([])}
          />
          <div className="pr-3 text-right">Questions</div>
        </div>
        {empty && (
          <p className="m-0 p-6 text-center text-sm text-muted">
            No Learning Objectives found
          </p>
        )}
        {!empty && (
          <div style={{ paddingTop, paddingBottom }}>
            {windowRoots.map(renderNode)}
          </div>
        )}
      </div>
      {mounted &&
        createPortal(
          <ul
            ref={popoverRef}
            hidden
            className={cn(
              "fixed z-40 m-0 w-56 list-none rounded-md border border-rule",
              "bg-paper p-2 text-xs shadow-lg",
            )}
          >
            {courses.map((course) => (
              <li
                key={course.id}
                data-course-id={course.id}
                className={cn(
                  "py-0.5 text-ink",
                  "data-[applies=false]:text-muted/60",
                  "data-[applies=false]:line-through",
                )}
              >
                {course.text}
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  );
};
