import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-border-soft py-9">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-2.5 font-display text-[17px] font-bold">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-lime to-lime-dim text-[13px] font-bold text-[#08110A]">
            BH
          </div>
          BRYAN HENAO COACH
        </div>

        <div className="flex flex-wrap gap-5.5 text-[13px] text-text-2">
          <Link href="#sobre-mi" className="hover:text-text-1">
            Sobre mí
          </Link>
          <Link href="#planes" className="hover:text-text-1">
            Planes
          </Link>
          <Link href="#resultados" className="hover:text-text-1">
            Resultados
          </Link>
          <Link
            href="https://www.instagram.com/bryandavid12coach__/"
            target="_blank"
            rel="noopener"
            className="hover:text-text-1"
          >
            Instagram
          </Link>
        </div>

        <div className="text-[12.5px] text-text-3">
          © 2026 Bryan David Henao · Entrenamiento personal & online
        </div>
      </div>
    </footer>
  );
}
