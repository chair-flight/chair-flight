import { useEffect, useRef } from "react";
import { cn } from "../../utils/cn";
import type { FC, ReactNode } from "react";

export const Modal: FC<{
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}> = ({ open, onClose, children }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      dialog.close();
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onPointerDown={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className={cn(
        "m-auto w-fit overflow-hidden rounded-xl border border-rule bg-paper",
        "max-h-[calc(100dvh-1rem)] max-w-[calc(100vw-1rem)] p-0 text-ink",
        "backdrop:bg-black/60",
      )}
    >
      {open && children}
    </dialog>
  );
};
