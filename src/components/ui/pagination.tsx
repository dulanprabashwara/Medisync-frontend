import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className = "",
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className={`flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 ${className}`} aria-label="Pagination">
      <div className="hidden sm:block">
        <p className="text-sm text-slate-700">
          Page <span className="font-medium text-slate-950">{page + 1}</span> of <span className="font-medium text-slate-950">{totalPages}</span>
        </p>
      </div>
      <div className="flex flex-1 justify-between sm:justify-end gap-3">
        <Button
          variant="secondary"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-2 text-sm h-9"
        >
          <ChevronLeft className="size-4 mr-1" aria-hidden="true" />
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-2 text-sm h-9"
        >
          Next
          <ChevronRight className="size-4 ml-1" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
