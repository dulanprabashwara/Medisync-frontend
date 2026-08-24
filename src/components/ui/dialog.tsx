"use client";

import { useEffect, useRef, useId, type ReactNode } from "react";
import { X } from "lucide-react";

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      document.body.style.overflow = "hidden";
      dialog.showModal();
    } else {
      document.body.style.overflow = "";
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="m-0 h-full w-full max-w-none bg-transparent p-0 backdrop:bg-slate-950/20 backdrop:backdrop-blur-sm open:flex open:items-center open:justify-center"
    >
      <div
        className={`relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl text-left ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Close dialog"
        >
          <X className="size-5" />
        </button>
        <h2 id={titleId} className="text-lg font-semibold text-slate-950">{title}</h2>
        {description && (
          <p id={descriptionId} className="mt-2 text-sm text-slate-500">{description}</p>
        )}
        <div className="mt-6">{children}</div>
      </div>
    </dialog>
  );
}
