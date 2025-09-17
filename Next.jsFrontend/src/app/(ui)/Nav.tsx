"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function Nav() {
  const path = usePathname();
  const items = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
  ];
  return (
    <nav className="border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex gap-4">
        {items.map((it) => {
          const active = path === it.href || (it.href !== "/" && path?.startsWith(it.href));
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`px-2 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                active ? "font-semibold underline" : ""
              }`}
            >
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
