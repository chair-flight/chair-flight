import { useCallback, useMemo, useState } from "react";
import { parseAnnexHref } from "../../libs/core/question-templates/parse-annotated-annex-href";
import { useDisclose } from "../../libs/ui/hooks/use-disclose";

export const useTestAnnex = () => {
  const { isOpen, open, close } = useDisclose();
  const [href, setHref] = useState("");

  const onAnnexClick = useCallback(
    (nextHref: string) => {
      setHref(nextHref);
      open();
    },
    [open],
  );

  const annexModal = useMemo(
    () => ({ open: isOpen, onClose: close }),
    [close, isOpen],
  );
  const annexViewer = useMemo(
    () => ({ ...parseAnnexHref(href), onClose: close }),
    [close, href],
  );

  return { annexModal, annexViewer, onAnnexClick };
};
