import Link from "next/link";

export default function FinalCta() {
  return (
    <section id="contacto" className="relative z-10 py-20">
      <div className="mx-auto max-w-[1180px] px-6">
        <div
          className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[#141B24] to-[#0C1116] px-6 py-11 text-center sm:px-12 sm:py-16"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(500px 260px at 50% 0%, rgba(154,255,61,0.14), transparent 70%)",
            }}
          />
          <h2 className="relative mb-3.5 font-display text-[28px] font-bold sm:text-[34px]">
            Tu próxima serie empieza con un mensaje
          </h2>
          <p className="relative mx-auto mb-[30px] max-w-[480px] text-[15.5px] text-text-2">
            Cuéntale a Bryan tu objetivo y recibe una propuesta de plan — personal u
            online — en menos de 24 horas.
          </p>
          <div className="relative flex flex-wrap justify-center gap-3.5">
            <Link
              href="https://wa.me/573115000926"
              target="_blank"
              rel="noopener"
              className="rounded-[11px] bg-lime px-5 py-[11px] text-sm font-semibold text-[#08110A] transition-transform hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(154,255,61,0.28)]"
            >
              Escribir por WhatsApp
            </Link>
            <Link
              href="https://www.instagram.com/bryandavid12coach__/"
              target="_blank"
              rel="noopener"
              className="rounded-[11px] border border-border px-5 py-[11px] text-sm font-semibold text-text-1 hover:border-text-2"
            >
              Ver Instagram
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
