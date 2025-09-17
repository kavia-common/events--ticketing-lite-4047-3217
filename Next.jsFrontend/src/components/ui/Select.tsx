"use client";

import React from "react";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  hint?: string;
  id?: string;
};

export default function Select({
  label,
  error,
  hint,
  id,
  className,
  children,
  ...rest
}: Props) {
  const autoId = React.useId();
  const selId = id ?? autoId;
  const hintId = hint ? `${selId}-hint` : undefined;
  const errId = error ? `${selId}-error` : undefined;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={selId} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={selId}
        aria-describedby={[hintId, errId].filter(Boolean).join(" ") || undefined}
        aria-invalid={!!error}
        className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 ${className ?? ""}`}
        {...rest}
      >
        {children}
      </select>
      {hint && (
        <p id={hintId} className="text-xs text-gray-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
