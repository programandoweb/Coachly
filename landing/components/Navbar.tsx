"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "#sobre-mi", label: "Sobre mí" },
  { href: "#planes", label: "Planes" },
  { href: "#resultados", label: "Resultados" },
  { href: "#proceso", label: "Cómo funciona" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border-soft bg-bg-void/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5 font-display text-[17px] font-bold">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-gradient-to-br from-lime to-lime-dim font-display text-base font-bold text-[#08110A] shadow-[0_0_22px_rgba(154,255,61,0.35)]">
            BH
          </div>
          BRYAN HENAO <span className="font-medium text-text-3">COACH</span>
        </div>

        <nav className="hidden gap-8 text-sm font-medium text-text-2 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-text-1">
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="#planes"
          className="hidden rounded-[11px] bg-lime px-5 py-[11px] text-sm font-semibold text-[#08110A] transition-transform hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(154,255,61,0.28)] md:inline-flex"
        >
          Empezar ahora
        </Link>

        <button
          aria-label="Menú"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex rounded-[9px] border border-border px-2.5 py-2 text-text-1 md:hidden"
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-4 border-t border-border-soft px-6 py-5 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm text-text-2 hover:text-text-1"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#planes"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-[11px] bg-lime px-5 py-[11px] text-center text-sm font-semibold text-[#08110A]"
          >
            Empezar ahora
          </Link>
        </div>
      )}
    </header>
  );
}
