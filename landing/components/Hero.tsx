import Link from "next/link";

type SetRowProps = {
  num: number;
  numColor: "lime" | "blue";
  peso: string;
  reps: string;
  esfuerzo: string;
  done: boolean;
};

function SetRow({ num, numColor, peso, reps, esfuerzo, done }: SetRowProps) {
  return (
    <div className="grid grid-cols-[32px_1fr_1fr_1fr_32px] items-center gap-2.5 border-b border-border-soft py-2.5 text-[13px] last:border-b-0">
      <div
        className={`flex h-[26px] w-[26px] items-center justify-center rounded-full font-mono text-[12px] font-bold ${
          numColor === "lime" ? "bg-lime text-[#08110A]" : "bg-blue text-white"
        }`}
      >
        {num}
      </div>
      <div>
        <div className="font-mono text-[12.5px] text-text-1">{peso}</div>
        <div className="text-[10.5px] uppercase text-text-3">Peso</div>
      </div>
      <div>
        <div className="font-mono text-[12.5px] text-text-1">{reps}</div>
        <div className="text-[10.5px] uppercase text-text-3">Reps</div>
      </div>
      <div>
        <div className="font-mono text-[12.5px] text-text-1">{esfuerzo}</div>
        <div className="text-[10.5px] uppercase text-text-3">Esfuerzo</div>
      </div>
      <div
        className={`flex h-[22px] w-[22px] items-center justify-center rounded-full text-[12px] font-bold ${
          done ? "bg-lime text-[#08110A]" : "bg-border text-text-3"
        }`}
      >
        {done ? "✓" : "·"}
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative z-10 py-[88px] pb-[60px]">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-[22px] inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-[12.5px] font-semibold text-lime">
            <span className="h-[7px] w-[7px] rounded-full bg-lime shadow-[0_0_8px_#9AFF3D]" />
            Cupos abiertos · Julio 2026
          </div>

          <h1 className="mb-5 font-display text-[38px] font-bold leading-[1.05] sm:text-[52px]">
            Cada serie cuenta.
            <br />
            Cada <span className="text-lime">repetición</span> te acerca.
          </h1>

          <p className="mb-8 max-w-[480px] text-[17px] text-text-2">
            Entrenamiento personal y online con Bryan David Henao. Rutinas medidas,
            progreso registrado y un plan hecho a tu medida — sin fórmulas genéricas.
          </p>

          <div className="mb-9 flex flex-wrap gap-3.5">
            <Link
              href="#planes"
              className="inline-flex items-center gap-2 rounded-[11px] bg-lime px-5 py-[11px] text-sm font-semibold text-[#08110A] transition-transform hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(154,255,61,0.28)]"
            >
              Ver planes de entrenamiento
            </Link>
            <Link
              href="https://www.instagram.com/bryandavid12coach__/"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-[11px] border border-border px-5 py-[11px] text-sm font-semibold text-text-1 hover:border-text-2"
            >
              @bryandavid12coach__
            </Link>
          </div>

          <div className="flex flex-wrap gap-7">
            <div>
              <b className="block font-display text-2xl">+200</b>
              <span className="text-[12.5px] text-text-3">Clientes activos</span>
            </div>
            <div>
              <b className="block font-display text-2xl">100%</b>
              <span className="text-[12.5px] text-text-3">Rutinas personalizadas</span>
            </div>
            <div>
              <b className="block font-display text-2xl">1:1</b>
              <span className="text-[12.5px] text-text-3">Seguimiento directo</span>
            </div>
          </div>
        </div>

        <div className="relative rounded-[20px] border border-border bg-bg-panel p-5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
          <div className="mb-4.5 flex items-start justify-between">
            <div>
              <div className="font-display text-[17px] font-semibold">
                Fuerza · Tren superior
              </div>
              <div className="mt-1 text-[13px] text-text-2">
                4 series · objetivo 8–10 reps · descanso 01:15
              </div>
            </div>
            <div className="rounded-lg bg-lime/10 px-2.5 py-1.5 text-[11px] font-bold tracking-wide text-lime">
              HOY
            </div>
          </div>

          <SetRow num={1} numColor="lime" peso="40 kg" reps="10" esfuerzo="RPE 7" done />
          <SetRow num={2} numColor="lime" peso="42 kg" reps="9" esfuerzo="RPE 8" done />
          <SetRow num={3} numColor="blue" peso="42 kg" reps="9" esfuerzo="RPE 8" done={false} />

          <div className="mt-4 flex justify-between border-t border-border-soft pt-3.5 text-[11.5px] text-text-3">
            <span>
              Volumen semanal <b className="font-mono text-lime">+12%</b>
            </span>
            <span>
              Coach <b className="font-mono text-lime">Bryan D. Henao</b>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
