"use client";

import React from "react";

export default function Alert({
  type = "info",
  children,
  role,
}: {
  type?: "info" | "success" | "error" | "warning";
  children: React.ReactNode;
  role?: "status" | "alert";
}) {
  const styles: Record<string, string> = {
    info: "bg-blue-50 border-blue-200 text-blue-900",
    success: "bg-green-50 border-green-200 text-green-900",
    error: "bg-red-50 border-red-200 text-red-900",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
  };
  return (
    <div
      role={role || (type === "error" ? "alert" : "status")}
      className={`border rounded-md p-3 ${styles[type]}`}
    >
      {children}
    </div>
  );
}
