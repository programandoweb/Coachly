const CHIPS = [
  "Planificación por bloques",
  "Seguimiento semanal",
  "Ajuste continuo de carga",
  "Acompañamiento nutricional básico",
];

export default function About() {
  return (
    <section id="sobre-mi" className="relative z-10 py-20">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-14 px-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="relative order-first flex aspect-[16/9] items-end overflow-hidden rounded-[20px] border border-border bg-gradient-to-br from-[#141B24] to-[#0C1116] p-6 lg:order-none lg:aspect-[4/5]">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 100% at 30% 0%, rgba(154,255,61,0.16), transparent 55%), radial-gradient(120% 100% at 80% 100%, rgba(59,130,246,0.16), transparent 55%)",
            }}
          />
          <div className="relative rounded-xl border border-border bg-bg-void/70 px-4 py-3.5 text-[13px] text-text-2 backdrop-blur-sm">
            <b className="mb-0.5 block font-display text-[15px] text-lime">
              Bryan David Henao
            </b>
            Entrenador personal & online
          </div>
        </div>

        <div>
          <span className="mb-2.5 block text-[12.5px] font-bold uppercase tracking-wider text-blue">
            Sobre el coach
          </span>
          <h2 className="mb-[18px] font-display text-[32px] font-bold">
            Entrenamiento con criterio, no con plantillas
          </h2>
          <p className="mb-4 text-[15.5px] text-text-2">
            Bryan diseña cada programa a partir de tu punto de partida real: movilidad,
            historial de lesiones, disponibilidad de tiempo y objetivo concreto. Nada de
            rutinas genéricas descargadas de internet.
          </p>
          <p className="mb-4 text-[15.5px] text-text-2">
            Cada sesión queda registrada — peso, repeticiones, esfuerzo percibido y
            descanso — para ajustar la carga semana a semana y asegurar que el progreso
            sea medible, no una sensación.
          </p>

          <div className="mt-[22px] flex flex-wrap gap-2.5">
            {CHIPS.map((chip) => (
              <div
                key={chip}
                className="flex items-center gap-2 rounded-[10px] border border-border px-3.5 py-2 text-[13px] text-text-1"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                {chip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
