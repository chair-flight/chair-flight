import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "../../libs/ui/components/base/logo";
import { ThemeToggle } from "../../libs/ui/components/base/theme-toggle";
import { ChevronRightIcon } from "../../libs/ui/components/icons/chevron-right-icon";
import { CloseIcon } from "../../libs/ui/components/icons/close-icon";
import { MenuIcon } from "../../libs/ui/components/icons/menu-icon";
import { cn } from "../../libs/ui/utils/cn";
import { BackgroundsAirbus320 } from "./-stories/backgrounds-airbus-320";
import { BackgroundsAtpl } from "./-stories/backgrounds-atpl";
import { BackgroundsBoeing737 } from "./-stories/backgrounds-boeing-737";
import { BackgroundsPpl } from "./-stories/backgrounds-ppl";
import { BackgroundsPublic } from "./-stories/backgrounds-public";
import { BaseAnnunciatorLight } from "./-stories/base-annunciator-light";
import { BaseBreadcrumbs } from "./-stories/base-breadcrumbs";
import { BaseButton } from "./-stories/base-button";
import { BaseButtonCard } from "./-stories/base-button-card";
import { BaseButtonIcon } from "./-stories/base-button-icon";
import { BaseButtonSearchBar } from "./-stories/base-button-search-bar";
import { BaseButtonStat } from "./-stories/base-button-stat";
import { BaseCheckbox } from "./-stories/base-checkbox";
import { BaseHighlight } from "./-stories/base-highlight";
import { BaseMarkdown } from "./-stories/base-markdown";
import { BaseMarkdownImage } from "./-stories/base-markdown-image";
import { BaseDialog, BaseModal } from "./-stories/base-modal";
import { BaseNestedCheckboxSelect } from "./-stories/base-nested-checkbox-select";
import { BaseSliderWithInput } from "./-stories/base-slider-with-input";
import { BaseThemeToggle } from "./-stories/base-theme-toggle";
import { BaseToaster } from "./-stories/base-toaster";
import { BaseTooltip } from "./-stories/base-tooltip";
import { ContainersApp } from "./-stories/containers-app";
import { ContainersLandingPage } from "./-stories/containers-landing-page";
import { ContainersPublic } from "./-stories/containers-public";
import { ElementsChapterSelection } from "./-stories/elements-chapter-selection";
import { ElementsLearningObjectivesTable } from "./-stories/elements-learning-objectives-table";
import { ElementsQuestionAnnexViewer } from "./-stories/elements-question-annex-viewer";
import { ElementsQuestionBankPreviewCard } from "./-stories/elements-question-bank-preview-card";
import { ElementsQuestionMultipleChoice } from "./-stories/elements-question-multiple-choice";
import { ElementsQuestionPreviewCard } from "./-stories/elements-question-preview-card";
import { ElementsQuestionViewer } from "./-stories/elements-question-viewer";
import { ElementsQuestionsTable } from "./-stories/elements-questions-table";
import { ElementsSearch } from "./-stories/elements-search";
import { ElementsTitlePage } from "./-stories/elements-title-page";
import { ElementsTypical } from "./-stories/elements-typical";
import { FoundationsColors } from "./-stories/foundations-colors";
import { FoundationsLogo } from "./-stories/foundations-logo";
import { GraphicsSvgIcons } from "./-stories/graphics-svg-icons";
import { OutlinesSvgAirplanes } from "./-stories/outlines-svg-airplanes";
import { OutlinesSvgGraphics } from "./-stories/outlines-svg-graphics";
import { OutlinesSvgSubject } from "./-stories/outlines-svg-subject";
import { TestsTestMaker } from "./-stories/tests-test-maker";
import { TestsTestNotFound } from "./-stories/tests-test-not-found";
import { TestsTestReviewer } from "./-stories/tests-test-reviewer";
import { TestsTestViewer } from "./-stories/tests-test-viewer";
import type { FC } from "react";

const GROUPS: {
  title: string;
  dividerBefore?: boolean;
  stories: { id: string; name: string; about: string; Story: FC }[];
}[] = [
  {
    title: "Foundations",
    stories: [
      {
        id: "colors",
        name: "Colors",
        about: "The colour tokens, switching with the theme.",
        Story: FoundationsColors,
      },
      {
        id: "logo",
        name: "Logo",
        about: "The brand mark.",
        Story: FoundationsLogo,
      },
    ],
  },
  {
    title: "Base",
    stories: [
      {
        id: "annunciator-light",
        name: "Annunciator light",
        about: "A lit cockpit light, one or two lines, in five colours.",
        Story: BaseAnnunciatorLight,
      },
      {
        id: "breadcrumbs",
        name: "Breadcrumbs",
        about: "The trail of parent pages in the header.",
        Story: BaseBreadcrumbs,
      },
      {
        id: "button",
        name: "Button",
        about: "Outline and solid buttons with variants, sizes, and icons.",
        Story: BaseButton,
      },
      {
        id: "button-card",
        name: "Button card",
        about: "A card-sized link or button with a label, title and subtitle.",
        Story: BaseButtonCard,
      },
      {
        id: "button-icon",
        name: "Button icon",
        about: "The icon inside a button, sized to it.",
        Story: BaseButtonIcon,
      },
      {
        id: "button-search-bar",
        name: "Button search bar",
        about: "A search bar look-alike that acts as a button or link.",
        Story: BaseButtonSearchBar,
      },
      {
        id: "button-stat",
        name: "Button stat",
        about: "A clickable statistic with a label, value and optional detail.",
        Story: BaseButtonStat,
      },
      {
        id: "checkbox",
        name: "Checkbox",
        about: "A checkbox with checked, indeterminate and disabled states.",
        Story: BaseCheckbox,
      },
      {
        id: "dialog",
        name: "Dialog",
        about: "A titled panel with a close button and optional footer.",
        Story: BaseDialog,
      },
      {
        id: "highlight",
        name: "Highlight",
        about: "Text with the matching search words marked.",
        Story: BaseHighlight,
      },
      {
        id: "markdown",
        name: "Markdown",
        about: "Rendered markdown for trusted content.",
        Story: BaseMarkdown,
      },
      {
        id: "markdown-image",
        name: "Markdown image",
        about:
          "An annex image as shown in markdown: sizes, annotations, clickable and missing states.",
        Story: BaseMarkdownImage,
      },
      {
        id: "modal",
        name: "Modal",
        about: "A dimmed overlay that shows whatever it wraps.",
        Story: BaseModal,
      },
      {
        id: "nested-checkbox-select",
        name: "Nested checkbox select",
        about:
          "Parent checkboxes that expand to their children, with a mixed state.",
        Story: BaseNestedCheckboxSelect,
      },
      {
        id: "slider-with-input",
        name: "Slider with input",
        about: "A number field and a range slider kept in sync.",
        Story: BaseSliderWithInput,
      },
      {
        id: "theme-toggle",
        name: "Theme toggle",
        about: "The light and dark switch.",
        Story: BaseThemeToggle,
      },
      {
        id: "toaster",
        name: "Toaster",
        about: "A short message that appears at the bottom and clears itself.",
        Story: BaseToaster,
      },
      {
        id: "tooltip",
        name: "Tooltip",
        about:
          "A label that shows on hover or keyboard focus, with an optional shortcut.",
        Story: BaseTooltip,
      },
    ],
  },
  {
    title: "Elements",
    stories: [
      {
        id: "chapter-selection",
        name: "Chapter selection",
        about:
          "Chapters, possibly nested, as cards that lead to their questions.",
        Story: ElementsChapterSelection,
      },
      {
        id: "learning-objectives-table",
        name: "Learning objectives table",
        about: "Learning objectives as a collapsible, searchable tree.",
        Story: ElementsLearningObjectivesTable,
      },
      {
        id: "questions-table",
        name: "Questions table",
        about: "Questions with censorable answers, highlight and filtering.",
        Story: ElementsQuestionsTable,
      },
      {
        id: "question-annex-viewer",
        name: "Question annex viewer",
        about: "The annex viewer: fit, zoom and drawing tools.",
        Story: ElementsQuestionAnnexViewer,
      },
      {
        id: "question-bank-preview-card",
        name: "Question bank preview card",
        about: "A question bank as a link card with its outline.",
        Story: ElementsQuestionBankPreviewCard,
      },
      {
        id: "question-multiple-choice",
        name: "Question multiple choice",
        about: "A question with options; pick one to see the result.",
        Story: ElementsQuestionMultipleChoice,
      },
      {
        id: "question-preview-card",
        name: "Question preview card",
        about: "A question as a link card with its variant count.",
        Story: ElementsQuestionPreviewCard,
      },
      {
        id: "question-viewer",
        name: "Question viewer",
        about: "A question with optional navigation, explanation and variants.",
        Story: ElementsQuestionViewer,
      },
      {
        id: "search",
        name: "Search",
        about: "A search bar with a lead, and grouped result rows.",
        Story: ElementsSearch,
      },
      {
        id: "title-page",
        name: "Title page",
        about: "A page heading with a parent link, caption and items.",
        Story: ElementsTitlePage,
      },
      {
        id: "typical",
        name: "Typical",
        about: "The typewriter headline.",
        Story: ElementsTypical,
      },
    ],
  },
  {
    title: "Containers",
    stories: [
      {
        id: "app",
        name: "App",
        about:
          "The sidebar, header and scrolling main area around every module.",
        Story: ContainersApp,
      },
      {
        id: "public",
        name: "Public",
        about:
          "The header, scrolling main area and footer of the public pages.",
        Story: ContainersPublic,
      },
      {
        id: "landing-page",
        name: "Landing page",
        about: "Title hero, explore prompt and full-height sections.",
        Story: ContainersLandingPage,
      },
    ],
  },
  {
    title: "Tests",
    stories: [
      {
        id: "test-maker",
        name: "Test maker",
        about:
          "The form that configures a new test: mode, subject, chapters, size.",
        Story: TestsTestMaker,
      },
      {
        id: "test-not-found",
        name: "Test not found",
        about: "Shown when the stored test is missing or mismatched.",
        Story: TestsTestNotFound,
      },
      {
        id: "test-viewer",
        name: "Test viewer",
        about: "A study or exam session with question flags and progress.",
        Story: TestsTestViewer,
      },
      {
        id: "test-reviewer",
        name: "Test reviewer",
        about: "The results and question filters of a finished test.",
        Story: TestsTestReviewer,
      },
    ],
  },
  {
    title: "SVG",
    stories: [
      {
        id: "icons",
        name: "SVG Icons",
        about: "UI icons at their default 16 × 16 px size.",
        Story: GraphicsSvgIcons,
      },
      {
        id: "outlines",
        name: "SVG Airplanes",
        about: "Line drawings of Airbus, Boeing, Cessna and Tecnam aircraft.",
        Story: OutlinesSvgAirplanes,
      },
      {
        id: "graphics",
        name: "SVG Graphics",
        about: "Line drawings of engines, wings and controls.",
        Story: OutlinesSvgGraphics,
      },
      {
        id: "subject-icons",
        name: "SVG Subject",
        about: "Outline icons for the 13 ATPL subjects.",
        Story: OutlinesSvgSubject,
      },
    ],
  },
  {
    title: "Backgrounds",
    stories: [
      {
        id: "background-airbus-320",
        name: "Airbus A320",
        about: "Pattern and aircraft behind the Airbus A320 pages.",
        Story: BackgroundsAirbus320,
      },
      {
        id: "background-boeing-737",
        name: "Boeing 737",
        about: "Pattern and aircraft behind the Boeing 737 pages.",
        Story: BackgroundsBoeing737,
      },
      {
        id: "background-atpl",
        name: "ATPL",
        about: "Pattern and aircraft behind the ATPL pages.",
        Story: BackgroundsAtpl,
      },
      {
        id: "background-ppl",
        name: "PPL",
        about: "Pattern and aircraft behind the PPL pages.",
        Story: BackgroundsPpl,
      },
      {
        id: "background-public",
        name: "Public",
        about: "Pattern and aircraft behind the Public pages.",
        Story: BackgroundsPublic,
      },
    ],
  },
];

const COLLAPSED_GROUPS_KEY = "design-system-collapsed-groups";

const STORIES = GROUPS.flatMap((group) => group.stories);

const DesignSystemPage: FC = () => {
  const { story: storyId } = Route.useParams();
  const currentStory = STORIES.find(({ id }) => id === storyId) ?? STORIES[0];
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [collapsedGroupsLoaded, setCollapsedGroupsLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COLLAPSED_GROUPS_KEY);
      if (stored) setCollapsedGroups(JSON.parse(stored));
    } catch {
      setCollapsedGroups([]);
    }
    setCollapsedGroupsLoaded(true);
  }, []);

  useEffect(() => {
    if (!collapsedGroupsLoaded) return;
    try {
      localStorage.setItem(
        COLLAPSED_GROUPS_KEY,
        JSON.stringify(collapsedGroups),
      );
    } catch {
      return;
    }
  }, [collapsedGroups, collapsedGroupsLoaded]);

  const toggleGroup = (title: string) => {
    setCollapsedGroups((previous) =>
      previous.includes(title)
        ? previous.filter((collapsed) => collapsed !== title)
        : [...previous, title],
    );
  };

  if (storyId && !STORIES.some(({ id }) => id === storyId)) {
    return <Navigate to="/design-system/{-$story}" replace />;
  }

  return (
    <div
      className={cn(
        "grid min-h-dvh max-md:content-start bg-canvas text-ink md:h-dvh",
        "md:grid-cols-[240px_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)]",
        "md:overflow-hidden",
      )}
    >
      <aside
        className={cn(
          "relative z-10 border-b border-rule bg-paper p-4 md:overscroll-none",
          "max-md:max-h-[40dvh] overflow-y-auto md:max-h-none",
          "md:border-r md:border-b-0",
        )}
      >
        <div className="flex items-center justify-between gap-2 md:mb-4">
          <Link
            to="/design-system/{-$story}"
            className={cn(
              "flex items-center gap-2 text-[15px] font-bold text-ink",
              "no-underline",
            )}
          >
            <Logo className="size-5" />
            Design system
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              aria-label="Menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((previous) => !previous)}
              className={cn(
                "inline-flex size-8 cursor-pointer items-center",
                "justify-center border-0 bg-transparent p-0 text-ink md:hidden",
              )}
            >
              {menuOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>
        <nav
          className={cn(
            "flex flex-col gap-4",
            menuOpen
              ? cn(
                  "max-md:fixed max-md:inset-x-0 max-md:top-15 max-md:bottom-0",
                  "max-md:overflow-y-auto max-md:bg-paper max-md:p-4",
                )
              : "max-md:hidden",
          )}
        >
          {GROUPS.map((group) => {
            const collapsed = collapsedGroups.includes(group.title);

            return (
              <div
                key={group.title}
                className={
                  group.dividerBefore ? "border-t border-rule pt-4" : undefined
                }
              >
                <h2 className="m-0 mb-1.5">
                  <button
                    type="button"
                    aria-expanded={!collapsed}
                    onClick={() => toggleGroup(group.title)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-1",
                      "border-0 bg-transparent p-0 text-left text-[11px]",
                      "font-semibold tracking-[.06em] text-muted uppercase",
                      "hover:text-ink",
                    )}
                  >
                    <ChevronRightIcon
                      className={cn(
                        "size-3 transition-transform",
                        collapsed ? "" : "rotate-90",
                      )}
                    />
                    {group.title}
                  </button>
                </h2>
                {collapsed ? null : (
                  <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
                    {group.stories.map(({ id, name }) => (
                      <li key={id}>
                        <Link
                          to="/design-system/{-$story}"
                          params={{ story: id }}
                          onClick={() => setMenuOpen(false)}
                          className={
                            id === currentStory.id
                              ? cn(
                                  "block rounded-md bg-accent-soft px-2.5",
                                  "py-1.5 text-[13px] font-semibold",
                                  "text-accent no-underline",
                                )
                              : cn(
                                  "block rounded-md px-2.5 py-1.5 text-[13px]",
                                  "font-semibold text-muted no-underline",
                                  "hover:text-ink",
                                )
                          }
                        >
                          {name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
      <main
        data-scroll-reset
        className="md:overflow-y-auto md:overscroll-y-contain"
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
          <header>
            <h1 className="m-0 text-2xl font-bold">{currentStory.name}</h1>
            <p className="mt-1 mb-0 text-sm text-muted">{currentStory.about}</p>
          </header>
          <currentStory.Story />
        </div>
      </main>
    </div>
  );
};

export const Route = createFileRoute(
  "/(design-system)/design-system/{-$story}",
)({
  head: () => ({
    meta: [{ title: "Design system" }, { name: "robots", content: "noindex" }],
  }),
  component: DesignSystemPage,
});
