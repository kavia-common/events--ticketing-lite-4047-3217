"use client";

import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

const base =
  "inline-flex items-center gap-2 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed";
const variants: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600 ring-offset-white",
  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400 ring-offset-white",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 ring-offset-white",
  ghost:
    "bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-gray-400 ring-offset-white",
};

export default function Button({
  variant = "primary",
  className,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={`${base} ${variants[variant]} ${className ?? ""}`}
    />
  );
}
