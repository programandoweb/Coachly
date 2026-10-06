const STATS = [
  { value: "+200", label: "Personas entrenadas" },
  { value: "+5", label: "Años de experiencia" },
  { value: "92%", label: "Continúan tras el 1er mes" },
  { value: "24/7", label: "Soporte por chat" },
];

export default function StatsBar() {
  return (
    <section className="relative z-10 py-0">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="grid grid-cols-2 overflow-hidden rounded-[18px] border border-border bg-bg-panel md:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`border-border px-5 py-7 ${
                i % 2 === 0 ? "border-r" : "md:border-r"
              } ${i === STATS.length - 1 ? "md:border-r-0" : ""} ${
                i === 1 ? "border-r-0 md:border-r" : ""
              }`}
            >
              <b className="block font-display text-[30px] text-lime">{stat.value}</b>
              <span className="text-[12.5px] text-text-2">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
