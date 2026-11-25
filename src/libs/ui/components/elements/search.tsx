import { Link } from "@tanstack/react-router";
import { createContext, useContext } from "react";
import { SearchIcon } from "../../icons/search-icon";
import { cn } from "../../utils/cn";
import type { LinkProps } from "@tanstack/react-router";
import type { FC, ReactNode } from "react";

const SearchContext = createContext({ active: false });

const useSearch = () => useContext(SearchContext);

const Root: FC<{
  active: boolean;
  children: ReactNode;
}> = ({ active, children }) => (
  <SearchContext value={{ active }}>
    <div
      className={cn(
        "mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-4 px-4",
        "transition-[padding] duration-250 ease-out sm:px-8",
        active ? "pt-4" : "pt-[16vh]",
      )}
    >
      {children}
    </div>
  </SearchContext>
);

const SearchLead: FC<{ children: ReactNode }> = ({ children }) => {
  const { active } = useSearch();

  return active ? null : children;
};

const SearchBar: FC<{
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}> = ({ value, placeholder, onChange }) => (
  <label
    className={cn(
      "flex h-12 flex-none items-center gap-3 rounded-lg border",
      "border-rule bg-paper px-4 focus-within:border-accent",
    )}
  >
    <SearchIcon size={20} className="flex-none text-muted" />
    <input
      // biome-ignore lint/a11y/noAutofocus: opened from a search link
      autoFocus
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => event.key === "Escape" && onChange("")}
      placeholder={placeholder}
      aria-label="Search"
      className={cn(
        "min-w-0 flex-1 border-0 bg-transparent text-base text-ink",
        "outline-none",
      )}
    />
    {value && (
      <button
        type="button"
        aria-label="Clear search"
        className={cn(
          "cursor-pointer rounded-md border border-rule bg-transparent",
          "px-2 py-0.5 font-mono text-xs font-semibold text-muted",
        )}
        onClick={() => onChange("")}
      >
        esc
      </button>
    )}
  </label>
);

const SearchResults: FC<{ children: ReactNode }> = ({ children }) => (
  <div
    className={cn(
      "-mx-4 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4",
      "pb-4 overscroll-contain sm:-mx-8 sm:px-8",
    )}
  >
    {children}
  </div>
);

const SearchGroup: FC<{
  title: string;
  children: ReactNode;
}> = ({ title, children }) => (
  <section className="flex flex-col gap-2">
    <h2
      className={cn(
        "m-0 text-xs font-semibold tracking-wider text-muted uppercase",
      )}
    >
      {title}
    </h2>
    <div
      className={cn(
        "flex flex-col divide-y divide-rule overflow-hidden rounded-lg",
        "border border-rule bg-paper",
      )}
    >
      {children}
    </div>
  </section>
);

const SearchItem: FC<{
  link: LinkProps;
  className?: string;
  children: ReactNode;
}> = ({ link, className, children }) => (
  <Link
    {...link}
    className={cn(
      "flex px-4 py-3 text-sm text-ink no-underline transition-colors",
      "hover:bg-accent/5",
      className,
    )}
  >
    {children}
  </Link>
);

const SearchEmpty: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="m-0 p-6 text-center text-sm text-muted">{children}</p>
);

export const Search = Object.assign(Root, {
  Lead: SearchLead,
  Bar: SearchBar,
  Results: SearchResults,
  Group: SearchGroup,
  Item: SearchItem,
  Empty: SearchEmpty,
});
