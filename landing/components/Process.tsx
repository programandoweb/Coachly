const STEPS = [
  {
    num: "01",
    title: "Diagnóstico inicial",
    desc: "Hablamos de tu objetivo, tu historial y tu disponibilidad real de tiempo.",
  },
  {
    num: "02",
    title: "Plan a tu medida",
    desc: "Bryan diseña tu programa de entrenamiento según tu punto de partida.",
  },
  {
    num: "03",
    title: "Ejecución y registro",
    desc: "Entrenas — presencial u online — y cada sesión queda registrada.",
  },
  {
    num: "04",
    title: "Ajuste semanal",
    desc: "La carga y el volumen se revisan cada semana según tu progreso real.",
  },
];

export default function Process() {
  return (
    <section id="proceso" className="relative z-10 py-20">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="mb-[52px] max-w-[620px]">
          <span className="mb-2.5 block text-[12.5px] font-bold uppercase tracking-wider text-blue">
            Cómo funciona
          </span>
          <h2 className="font-display text-[36px] font-bold">
            De la primera conversación al primer ajuste de carga
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="rounded-2xl border border-border bg-bg-panel p-6"
            >
              <div className="mb-4 flex h-[30px] w-[30px] items-center justify-center rounded-full border border-border bg-bg-card font-mono text-xs text-lime">
                {step.num}
              </div>
              <h4 className="mb-2 text-[15.5px] font-semibold">{step.title}</h4>
              <p className="text-[13.5px] text-text-2">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
