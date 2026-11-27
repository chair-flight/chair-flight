import { Link } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  memo,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal, flushSync } from "react-dom";
import { useKeyboardShortcuts } from "../../hooks/use-keyboard-shortcuts";
import { cn } from "../../utils/cn";
import { Highlight } from "../base/highlight";
import { ChevronRightIcon } from "../icons/chevron-right-icon";
import type { LinkProps } from "@tanstack/react-router";
import type { CSSProperties, FC } from "react";

type ThreadItem = {
  id: string;
  parentId: string | null;
  level: number;
  text: string;
  items: string[];
  source: string;
  courses: string[];
  numberOfQuestions: number | null;
  link?: LinkProps;
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
const MOBILE_ID_INDENT_REM = 0.375;
const DESKTOP_ID_INDENT_REM = 0.5;
const GRID_COLUMNS =
  "grid grid-cols-[var(--lo-id-width,10.5rem)_minmax(0,1fr)_5.5rem_5rem]";

const getCourseMarker = (target: EventTarget | null) =>
  target instanceof Element
    ? target.closest<HTMLButtonElement>("button[data-courses]")
    : null;

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

const flattenNode = (
  node: ThreadNode,
  depth: number,
  ancestorIds: string[],
  collapsedIds: Set<string>,
): FlatRow[] => {
  const open = !collapsedIds.has(node.item.id);
  return [
    {
      item: node.item,
      depth,
      parent: node.children.length > 0,
      open,
      ancestorIds,
    },
    ...(open
      ? node.children.flatMap((child) =>
          flattenNode(
            child,
            depth + 1,
            [...ancestorIds, node.item.id],
            collapsedIds,
          ),
        )
      : []),
  ];
};

const ItemText: FC<{
  text: string;
  items: string[];
  highlight?: string | string[];
}> = ({ text, items, highlight }) => (
  <div className="leading-6 wrap-break-word">
    <p className="m-0">
      <Highlight highlight={highlight}>{text}</Highlight>
    </p>
    {items.length > 0 && (
      <ul className="mt-3 mb-0 list-disc pl-6">
        {items.map((item) => (
          <li key={item}>
            <Highlight highlight={highlight}>{item}</Highlight>
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
        GRID_COLUMNS,
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
      <div key={index} className={cn(GRID_COLUMNS, "h-12 animate-pulse")}>
        <div
          className="flex items-center border-b border-rule"
          style={{ marginLeft: `${0.5 + depth * DESKTOP_ID_INDENT_REM}rem` }}
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
      <button
        type="button"
        data-courses={item.courses.join(" ")}
        aria-label={`Course applicability for ${item.id}`}
        className="h-7 cursor-pointer rounded px-1 hover:text-ink"
      >
        <span aria-hidden>
          {courses
            .map((course) => (item.courses.includes(course.id) ? "●" : "○"))
            .join("")}
        </span>
      </button>
    )}
  </div>
);

const QuestionsCell: FC<{
  item: ThreadItem;
  parent: boolean;
}> = ({ item, parent }) => (
  <div
    className={cn(
      "flex items-center justify-end border-b border-rule",
      "pr-3 text-xs text-muted tabular-nums",
      parent && "pointer-events-auto bg-paper",
    )}
  >
    {item.numberOfQuestions || "-"}
  </div>
);

const LearningObjectiveId: FC<{
  id: string;
  highlight?: string | string[];
  link?: LinkProps;
}> = ({ id, highlight, link }) => (
  <span className="font-mono text-xs whitespace-nowrap">
    {link ? (
      <Link {...link} className="underline-offset-2 hover:underline">
        <Highlight highlight={highlight}>{id}</Highlight>
      </Link>
    ) : (
      <Highlight highlight={highlight}>{id}</Highlight>
    )}
  </span>
);

const ParentRow = memo<{
  item: ThreadItem;
  depth: number;
  open: boolean;
  courses: Course[];
  highlight?: string | string[];
  onToggle: (id: string) => void;
}>(({ item, depth, open, courses, highlight, onToggle }) => (
  <div
    className={cn(
      GRID_COLUMNS,
      "pointer-events-none h-8",
      depth === 0 && "bg-paper",
    )}
  >
    <div
      className={cn(
        "pointer-events-auto flex items-center gap-1 border-b border-rule",
        "bg-paper py-2 pt-2.5 pr-1 font-semibold",
      )}
      style={{ marginLeft: `calc(${depth} * var(--lo-indent))` }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-label={`${open ? "Collapse" : "Expand"} ${item.id}`}
        onClick={() => onToggle(item.id)}
        className="grid size-3 flex-none cursor-pointer place-items-center text-muted hover:text-accent"
      >
        <ChevronRightIcon
          size={12}
          strokeWidth={2.5}
          className={cn(
            "transition-transform duration-150",
            open && "rotate-90",
          )}
        />
      </button>
      <LearningObjectiveId
        id={item.id}
        highlight={highlight}
        link={item.link}
      />
    </div>
    <div
      title={item.text}
      className={cn(
        "pointer-events-auto flex items-center truncate border-b border-rule",
        "bg-paper pr-4 font-semibold",
      )}
    >
      <span className="truncate">
        <Highlight highlight={highlight}>{item.text}</Highlight>
      </span>
    </div>
    <CoursesCell item={item} courses={courses} parent />
    <QuestionsCell item={item} parent />
  </div>
));

const LeafRow = memo<{
  item: ThreadItem;
  depth: number;
  courses: Course[];
  highlight?: string | string[];
}>(({ item, depth, courses, highlight }) => (
  <div className={GRID_COLUMNS}>
    <div
      className={cn(
        "relative flex items-center gap-1 border-b border-rule",
        "py-2 pt-2.5 pr-1 font-semibold",
      )}
      style={{ marginLeft: `calc(${depth} * var(--lo-indent))` }}
    >
      {depth > 0 && (
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-0 h-px w-4 bg-muted/70 md:-left-0.5"
        />
      )}
      <span aria-hidden className="size-3 flex-none" />
      <LearningObjectiveId
        id={item.id}
        highlight={highlight}
        link={item.link}
      />
    </div>
    <div className={cn("border-b border-rule", "py-2 pr-4")}>
      <ItemText text={item.text} items={item.items} highlight={highlight} />
      {item.source && (
        <div className="mt-1.5 text-[11px] whitespace-pre-line text-muted/75">
          {item.source}
        </div>
      )}
    </div>
    <CoursesCell item={item} courses={courses} parent={false} />
    <QuestionsCell item={item} parent={false} />
  </div>
));

export const LearningObjectivesTable: FC<{
  items: ThreadItem[];
  courses: Course[];
  highlight?: string | string[];
  filterItems?: string[];
  loading?: boolean;
}> = ({ items, courses, highlight, filterItems, loading = false }) => {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [courseMarker, setCourseMarker] = useState<HTMLButtonElement | null>(
    null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const courseLegend = useRef<HTMLUListElement>(null);
  const courseLegendId = useId();

  const [mobileIdColumnWidth, desktopIdColumnWidth] = useMemo(
    () =>
      [MOBILE_ID_INDENT_REM, DESKTOP_ID_INDENT_REM].map((indent) =>
        items.reduce(
          (width, item) =>
            Math.max(
              width,
              item.id.length * 0.46 + (item.level - 1) * indent + 1.5,
            ),
          7.5,
        ),
      ),
    [items],
  );
  const hideCourseLegend = useCallback(() => setCourseMarker(null), []);

  const filteredItems = useMemo(() => {
    if (!filterItems) return items;
    const allowedIds = new Set(filterItems);
    return items.filter((item) => allowedIds.has(item.id));
  }, [items, filterItems]);
  const filterKey = useMemo(() => filterItems?.join("|"), [filterItems]);
  const roots = useMemo(() => buildThreadNodes(filteredItems), [filteredItems]);
  const rows = useMemo(
    () => roots.flatMap((root) => flattenNode(root, 0, [], collapsedIds)),
    [roots, collapsedIds],
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [filterKey]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const showOnHover = (event: PointerEvent) => {
      if (event.pointerType === "mouse") {
        setCourseMarker(getCourseMarker(event.target));
      }
    };
    const hideOnMouseLeave = (event: PointerEvent) => {
      if (event.pointerType === "mouse") hideCourseLegend();
    };
    const toggleOnPress = (event: MouseEvent) => {
      const marker = getCourseMarker(event.target);
      if (!marker) return;
      setCourseMarker((current) => (current === marker ? null : marker));
    };

    scroller.addEventListener("pointerover", showOnHover);
    scroller.addEventListener("pointerleave", hideOnMouseLeave);
    scroller.addEventListener("click", toggleOnPress);
    scroller.addEventListener("scroll", hideCourseLegend, { passive: true });
    return () => {
      scroller.removeEventListener("pointerover", showOnHover);
      scroller.removeEventListener("pointerleave", hideOnMouseLeave);
      scroller.removeEventListener("click", toggleOnPress);
      scroller.removeEventListener("scroll", hideCourseLegend);
    };
  }, [loading, hideCourseLegend]);

  useLayoutEffect(() => {
    const legend = courseLegend.current;
    if (!courseMarker || !legend) return;
    const marker = courseMarker.getBoundingClientRect();
    const below =
      marker.bottom + legend.offsetHeight + 4 <= window.innerHeight - 8;
    legend.style.top = `${Math.max(8, below ? marker.bottom + 4 : marker.top - legend.offsetHeight - 4)}px`;
    legend.style.left = `${Math.max(8, Math.min(marker.right - legend.offsetWidth, window.innerWidth - legend.offsetWidth - 8))}px`;
    courseMarker.setAttribute("aria-describedby", courseLegendId);
    return () => courseMarker.removeAttribute("aria-describedby");
  }, [courseMarker, courseLegendId]);

  useEffect(() => {
    if (!courseMarker) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (getCourseMarker(event.target) !== courseMarker) hideCourseLegend();
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") hideCourseLegend();
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", hideCourseLegend);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", hideCourseLegend);
    };
  }, [courseMarker, hideCourseLegend]);

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
            highlight={highlight}
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
            highlight={highlight}
            onToggle={(id) =>
              row.open ? collapseRow(node.index) : toggleRow(id)
            }
          />
        </div>
        {node.children.length > 0 && (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-0 z-1 flex w-3 justify-center"
              style={{
                left: `calc(${row.depth} * var(--lo-indent))`,
                top: "1.125rem",
              }}
            >
              <span className="block w-px bg-muted/70" />
            </span>
            {node.children.map(renderNode)}
          </>
        )}
        {row.depth === 0 && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px bg-muted/70"
          />
        )}
      </div>
    );
  };
  const empty = rows.length === 0;
  const applicableCourses = courseMarker?.dataset.courses?.split(" ") ?? [];

  return (
    <div
      ref={scrollRef}
      className={cn(
        "@container h-full overflow-auto rounded-lg border border-rule bg-paper",
        "text-[13px]",
      )}
    >
      <div
        className={cn(
          "w-[calc(var(--lo-id-width)_+_min(100cqw,100vw_-_20px)_+_10.5rem)]",
          "md:w-full md:min-w-200",
          "[--lo-id-width:var(--lo-mobile-id-width)]",
          "md:[--lo-id-width:var(--lo-desktop-id-width)]",
          "[--lo-indent:var(--lo-mobile-indent)]",
          "md:[--lo-indent:var(--lo-desktop-indent)]",
        )}
        style={
          {
            "--lo-mobile-id-width": `${mobileIdColumnWidth}rem`,
            "--lo-desktop-id-width": `${desktopIdColumnWidth}rem`,
            "--lo-mobile-indent": `${MOBILE_ID_INDENT_REM}rem`,
            "--lo-desktop-indent": `${DESKTOP_ID_INDENT_REM}rem`,
          } as CSSProperties
        }
      >
        <div
          className={cn(
            GRID_COLUMNS,
            "sticky top-0 z-30 h-8 items-center border-b border-rule bg-paper",
            "text-xs font-semibold text-muted",
          )}
        >
          <div className="pl-3">Learning Objective</div>
          <div className="pr-3">Description</div>
          <div>Courses</div>
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
            <div aria-hidden className={cn(GRID_COLUMNS, "h-8")}>
              <div className="border-b border-rule" />
              <div className="border-b border-rule" />
              <div className="border-b border-rule" />
              <div className="border-b border-rule" />
            </div>
          </div>
        )}
      </div>
      {courseMarker &&
        createPortal(
          <ul
            id={courseLegendId}
            ref={courseLegend}
            role="tooltip"
            className={cn(
              "pointer-events-none fixed z-50 m-0 w-48 max-w-[90vw] list-none",
              "rounded-md border border-rule bg-paper p-2 text-xs shadow-lg",
            )}
          >
            {courses.map((course) => {
              const applies = applicableCourses.includes(course.id);
              return (
                <li key={course.id} className="flex items-center gap-2 py-0.5">
                  <span aria-hidden className="text-[8px]">
                    {applies ? "●" : "○"}
                  </span>
                  <span className="sr-only">
                    {applies ? "Applies to" : "Does not apply to"}{" "}
                  </span>
                  <span
                    className={applies ? "text-ink" : "text-muted line-through"}
                  >
                    {course.text}
                  </span>
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
};
