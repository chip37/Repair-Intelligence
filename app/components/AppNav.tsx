"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/repairs/new", label: "Record Repair" },
  { href: "/repairs", label: "Repair History" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/repairs") {
    return (
      pathname === "/repairs" ||
      (pathname.startsWith("/repairs/") && !pathname.startsWith("/repairs/new"))
    );
  }

  return pathname === href;
}

export default function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="inline-flex flex-col">
          <span className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Repair Intelligence
          </span>
          <span className="text-xs text-slate-500">
            Troubleshooting workspace
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="flex flex-wrap gap-2">
          {links.map((link) => {
            const active = isActive(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-10 items-center justify-center rounded px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  active
                    ? "bg-blue-700 text-white shadow-sm hover:bg-blue-800"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
