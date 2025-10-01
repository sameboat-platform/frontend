import type { FocusEventHandler, ChangeEventHandler } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
}

export function FormField({ label, name, type = 'text', required, value, onChange, onFocus, placeholder, autoComplete, disabled }: FormFieldProps) {
  const id = name;
  return (
    <div>
      <label className="block text-sm font-medium mb-1" htmlFor={id}>{label}{required && <span className="text-red-600">*</span>}</label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/50 disabled:opacity-50"
      />
    </div>
  );
}
