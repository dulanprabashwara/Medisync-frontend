import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";

export const inputBaseStyles = "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:opacity-60 disabled:cursor-not-allowed";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => {
    return <input ref={ref} className={`${inputBaseStyles} ${className}`} {...props} />;
  }
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = "", ...props }, ref) => {
    return <textarea ref={ref} className={`${inputBaseStyles} min-h-25 ${className}`} {...props} />;
  }
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <select ref={ref} className={`${inputBaseStyles} appearance-none bg-no-repeat pr-10 ${className}`} style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }} {...props}>
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export function Label({ children, className = "", htmlFor }: { children: React.ReactNode; className?: string; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-slate-700 ${className}`}>
      {children}
    </label>
  );
}

export function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="mt-1 text-sm text-rose-600">{error}</p>;
}

export function FieldHelper({ text }: { text?: string }) {
  if (!text) return null;
  return <p className="mt-1 text-sm text-slate-500">{text}</p>;
}
