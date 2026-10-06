import Link from "next/link";

type Plan = {
  name: string;
  tag: string;
  tagColor: "presencial" | "online";
  desc: string;
  price: string;
  period: string;
  features: string[];
  ctaLabel: string;
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Personal",
    tag: "Presencial",
    tagColor: "presencial",
    desc: "Sesiones cara a cara. Corrección técnica en vivo y ajuste de carga en el mismo entrenamiento.",
    price: "$280.000",
    period: "/ mes · 3 sesiones semanales",
    features: [
      "Evaluación física inicial",
      "Rutina 100% personalizada",
      "Corrección técnica en tiempo real",
      "Registro de cargas por sesión",
      "Ajuste semanal del plan",
    ],
    ctaLabel: "Reservar sesión presencial",
  },
  {
    name: "Online",
    tag: "Más elegido",
    tagColor: "online",
    desc: "Rutina y seguimiento a distancia, con la misma exigencia que un entrenamiento presencial.",
    price: "$150.000",
    period: "/ mes · acceso continuo",
    features: [
      "Rutina personalizada mensual",
      "Videos de ejecución de cada ejercicio",
      "Seguimiento semanal por chat",
      "Ajuste de carga según tu registro",
      "Videollamada de revisión mensual",
    ],
    ctaLabel: "Empezar plan online",
    featured: true,
  },
];

export default function Plans() {
  return (
    <section id="planes" className="relative z-10 py-20">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="mb-[52px] max-w-[620px]">
          <span className="mb-2.5 block text-[12.5px] font-bold uppercase tracking-wider text-blue">
            Planes
          </span>
          <h2 className="mb-3.5 font-display text-[36px] font-bold">
            Dos formas de entrenar. Un solo estándar.
          </h2>
          <p className="text-base text-text-2">
            Elige presencial si quieres a Bryan a tu lado en cada serie, u online si
            necesitas flexibilidad sin perder seguimiento real.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-[20px] border bg-bg-panel p-8 transition-transform hover:-translate-y-1 ${
                plan.featured
                  ? "border-lime/50 shadow-[0_0_0_1px_rgba(154,255,61,0.15),0_30px_60px_-30px_rgba(154,255,61,0.25)]"
                  : "border-border"
              }`}
            >
              <div className="mb-1.5 flex items-start justify-between">
                <div className="font-display text-[22px] font-semibold">{plan.name}</div>
                <div
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide ${
                    plan.tagColor === "presencial"
                      ? "bg-blue/15 text-blue"
                      : "bg-lime/15 text-lime"
                  }`}
                >
                  {plan.tag}
                </div>
              </div>

              <p className="mb-[22px] text-sm text-text-2">{plan.desc}</p>

              <div className="mb-6 flex items-baseline gap-2">
                <b className="font-mono text-[30px]">{plan.price}</b>
                <span className="text-[13px] text-text-3">{plan.period}</span>
              </div>

              <ul className="mb-7 flex-1 list-none">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2.5 border-b border-border-soft py-2.5 text-sm text-text-1 last:border-b-0"
                  >
                    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-lime text-[10px] font-bold text-[#08110A]">
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="#contacto"
                className={`w-full rounded-[11px] px-5 py-[11px] text-center text-sm font-semibold transition-transform hover:-translate-y-px ${
                  plan.featured
                    ? "bg-lime text-[#08110A] hover:shadow-[0_6px_24px_rgba(154,255,61,0.28)]"
                    : "border border-border text-text-1 hover:border-text-2"
                }`}
              >
                {plan.ctaLabel}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
