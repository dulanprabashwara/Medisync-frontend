import { Search, X } from "lucide-react";

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="size-5 text-slate-400" aria-hidden="true" />
      </div>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
        >
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">Clear search</span>
        </button>
      )}
    </div>
  );
}
