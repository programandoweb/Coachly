type Testimonial = {
  initials: string;
  avatarClass: string;
  quote: string;
  name: string;
  meta: string;
  resultLabel: string;
  resultValue: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    initials: "MJ",
    avatarClass: "bg-gradient-to-br from-lime to-[#5FA81C]",
    quote:
      "Empecé sin saber ni agarrar una barra bien. En 4 meses subí mi sentadilla de 40 a 70 kg y por fin entiendo por qué hago cada ejercicio.",
    name: "María J.",
    meta: "Plan Online · 6 meses",
    resultLabel: "Sentadilla",
    resultValue: "+30 kg",
  },
  {
    initials: "CR",
    avatarClass: "bg-gradient-to-br from-blue to-[#1D4ED8]",
    quote:
      "Lo que más valoro es que ajusta el plan cada semana según cómo me sentí, no según una hoja de cálculo genérica.",
    name: "Camilo R.",
    meta: "Plan Personal · 8 meses",
    resultLabel: "Peso corporal",
    resultValue: "-9 kg",
  },
  {
    initials: "DL",
    avatarClass: "bg-gradient-to-br from-[#F5C542] to-[#C7941E]",
    quote:
      "Entreno online desde otra ciudad y el seguimiento es igual de cercano que cuando entrenaba presencial con él.",
    name: "Daniela L.",
    meta: "Plan Online · 3 meses",
    resultLabel: "Press banca",
    resultValue: "+15 kg",
  },
];

export default function Testimonials() {
  return (
    <section id="resultados" className="relative z-10 py-20">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="mb-[52px] max-w-[620px]">
          <span className="mb-2.5 block text-[12.5px] font-bold uppercase tracking-wider text-blue">
            Resultados
          </span>
          <h2 className="mb-3.5 font-display text-[36px] font-bold">
            Lo que dicen quienes ya entrenan con Bryan
          </h2>
          <p className="text-base text-text-2">
            Progreso real, registrado sesión a sesión — no promesas.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5.5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-[18px] border border-border bg-bg-panel p-6.5"
            >
              <div className="mb-3.5 tracking-[2px] text-lime">★★★★★</div>
              <p className="mb-5.5 text-[14.5px] leading-[1.6] text-text-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-[#08110A] ${t.avatarClass}`}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-text-3">{t.meta}</div>
                </div>
              </div>
              <div className="mt-4 flex justify-between border-t border-border-soft pt-3.5 text-xs text-text-2">
                <span>{t.resultLabel}</span>
                <b className="font-mono text-lime">{t.resultValue}</b>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
