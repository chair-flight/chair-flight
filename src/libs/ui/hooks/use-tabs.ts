import { useCallback, useState } from "react";

export const useTabs = <T extends string>(defaultTab: T) => {
  const [currentTab, setCurrentTab] = useState<T>(defaultTab);
  const switchTo = useCallback((tab: T) => setCurrentTab(tab), []);

  return { currentTab, switchTo };
};
