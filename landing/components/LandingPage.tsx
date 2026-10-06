"use client";

import { motion } from "motion/react";

const WHATSAPP =
  "https://wa.me/573046092197?text=Hola%20Bryan%2C%20quiero%20agendar%20una%20asesor%C3%ADa%20y%20conocer%20tu%20entrenamiento%20personalizado.";
const INSTAGRAM = "https://www.instagram.com/bryandavid12coach__/";
const APP = "https://app.brycoach.pro/login";

const specialties = [
  ["🏋🏻‍♂️", "Hipertrofia", "Desarrollo muscular con técnica, volumen y progresión medibles."],
  ["🔥", "Pérdida de grasa", "Entrenamiento estructurado para mejorar composición corporal y rendimiento."],
  ["⚖️", "Recomposición corporal", "Estrategia para ganar músculo y reducir grasa según tu contexto."],
  ["🧠", "Biomecánica", "Mejor ejecución, selección de ejercicios y control del movimiento."],
  ["📈", "Progresión", "Planificación con criterios claros para evitar entrenar sin dirección."],
  ["🛡️", "Prevención de lesiones", "Técnica y ajustes para reducir riesgos derivados de una mala ejecución."],
  ["🎯", "Entrenamiento personalizado", "Un proceso diseñado desde tu nivel, objetivos y capacidades."],
];

const method = [
  ["01", "Evaluar", "Punto de partida, técnica, capacidades, historial y objetivos."],
  ["02", "Planificar", "Selección de ejercicios, frecuencia, volumen e intensidad con propósito."],
  ["03", "Ejecutar", "Técnica, control y estímulo correcto en cada repetición."],
  ["04", "Progresar", "Seguimiento y ajustes para que el entrenamiento siga generando resultados."],
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55 },
};

function Arrow() {
  return <span aria-hidden>↗</span>;
}

export default function LandingPage() {
  return (
    <main className="overflow-hidden bg-[#0b1207]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#0b1207]/75 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#inicio" className="flex items-center gap-3 font-bold">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#9cff00] text-[#101807]">BH</span>
            <span className="hidden sm:block">BRYAN HENAO <span className="text-[#9cff00]">COACH</span></span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-white/65 md:flex">
            <a href="#metodo" className="hover:text-white">Método</a>
            <a href="#servicios" className="hover:text-white">Servicios</a>
            <a href="#sobre-mi" className="hover:text-white">Sobre mí</a>
          </nav>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#9cff00] px-4 py-2.5 text-sm font-extrabold text-[#101807]">
            Agenda tu asesoría
          </a>
        </div>
      </header>

      <section id="inicio" className="relative min-h-screen pt-32">
        <div className="grid-bg absolute inset-0 opacity-70" />
        <div className="absolute right-[-10rem] top-16 h-[34rem] w-[34rem] rounded-full bg-[#9cff00]/10 blur-[120px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-16 lg:grid-cols-[1.12fr_.88fr] lg:px-8">
          <motion.div {...fadeUp}>
            <p className="mb-5 text-xs font-black uppercase tracking-[.28em] text-[#9cff00]">
              Entrenador personal · Hipertrofia · Recomposición corporal
            </p>
            <h1 className="max-w-4xl font-[var(--font-space-grotesk)] text-5xl font-black leading-[.95] tracking-[-.055em] sm:text-7xl xl:text-[88px]">
              Entrena mejor. <span className="text-gradient">Transforma tu físico.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
              Soy Bryan Henao. Te ayudo a construir un físico más fuerte y funcional mediante biomecánica, técnica, planificación y progresión.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <motion.a whileHover={{ y: -3, scale: 1.015 }} href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-[#9cff00] px-6 py-4 font-black text-[#101807] shadow-[0_16px_50px_rgba(156,255,0,.18)]">
                Quiero entrenar contigo <Arrow />
              </motion.a>
              <motion.a whileHover={{ y: -3 }} href="#servicios" className="rounded-2xl border border-white/15 px-6 py-4 font-bold text-white">
                Ver mis servicios →
              </motion.a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/45">
              <span>✓ Plan personalizado</span><span>✓ Seguimiento</span><span>✓ Técnica y biomecánica</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: .94, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: .7 }}
            className="relative mx-auto w-full max-w-xl"
          >
            <div className="absolute -inset-4 rounded-[2.3rem] bg-[#9cff00]/10 blur-2xl" />
            <div className="glass relative overflow-hidden rounded-[2rem] p-3 shadow-2xl">
              <img src="https://app.brycoach.pro/og-bryancoach-programandoweb.jpg" alt="Bryan Henao, entrenador personal" className="aspect-[4/5] w-full rounded-[1.45rem] object-cover object-center" />
              <div className="absolute inset-x-7 bottom-7 rounded-2xl border border-white/10 bg-black/55 p-5 backdrop-blur-xl">
                <p className="text-xs font-black uppercase tracking-[.2em] text-[#9cff00]">Bryan Henao</p>
                <p className="mt-1 text-xl font-extrabold">Biomecánica · Hipertrofia · Pérdida de grasa</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="sobre-mi" className="border-y border-white/5 bg-white/[.018] py-24">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-2 lg:px-8">
          <motion.div {...fadeUp}>
            <p className="text-sm font-black uppercase tracking-[.22em] text-[#9cff00]">Entrenamiento con propósito</p>
            <h2 className="mt-4 font-[var(--font-space-grotesk)] text-4xl font-black tracking-[-.04em] sm:text-5xl">Más que una rutina.</h2>
          </motion.div>
          <motion.div {...fadeUp} className="space-y-5 text-[17px] leading-8 text-white/65">
            <p>Analizo el movimiento, la técnica, la ejecución y las necesidades individuales de cada persona para construir un entrenamiento que tenga propósito, progresión y resultados.</p>
            <p>Mi enfoque utiliza principios de entrenamiento y biomecánica para mejorar cada ejercicio, optimizar el estímulo muscular y reducir factores de riesgo asociados a una mala técnica.</p>
            <p className="font-bold text-white">No se trata simplemente de entrenar más. Se trata de aprender a entrenar mejor.</p>
          </motion.div>
        </div>
      </section>

      <section id="metodo" className="py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <motion.div {...fadeUp} className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[.22em] text-[#9cff00]">Mi método</p>
            <h2 className="mt-4 font-[var(--font-space-grotesk)] text-4xl font-black tracking-[-.04em] sm:text-6xl">
              Evaluar → Planificar → Ejecutar → Progresar
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/55">Cada persona parte de un punto diferente. Por eso adapto el entrenamiento a su nivel, objetivos, capacidades y contexto.</p>
          </motion.div>
          <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {method.map(([n, title, copy], i) => (
              <motion.article key={title} {...fadeUp} transition={{ duration: .5, delay: i * .07 }} className="glass rounded-3xl p-7">
                <span className="font-mono text-sm font-bold text-[#9cff00]">{n}</span>
                <h3 className="mt-12 text-2xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-white/55">{copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="servicios" className="border-y border-white/5 bg-white/[.018] py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <motion.div {...fadeUp} className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[.22em] text-[#9cff00]">Trabajo especialmente en</p>
            <h2 className="mt-4 font-[var(--font-space-grotesk)] text-4xl font-black tracking-[-.04em] sm:text-6xl">Tu objetivo necesita estrategia.</h2>
          </motion.div>
          <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {specialties.map(([icon, title, copy], i) => (
              <motion.article key={`specialty-${i}-${title}`} whileHover={{ y: -7 }} {...fadeUp} transition={{ duration: .45, delay: (i % 3) * .05 }} className="glass rounded-3xl p-7">
                <div className="text-3xl">{icon}</div>
                <h3 className="mt-7 text-xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-white/55">{copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
          <motion.div {...fadeUp}>
            <p className="text-sm font-black uppercase tracking-[.22em] text-[#9cff00]">Entrenamiento personal</p>
            <h2 className="mt-4 font-[var(--font-space-grotesk)] text-4xl font-black tracking-[-.04em] sm:text-5xl">Deja de improvisar en el gimnasio.</h2>
          </motion.div>
          <motion.div {...fadeUp} className="glass rounded-[2rem] p-8 sm:p-10">
            <p className="text-xl leading-9 text-white/70">Diseño procesos personalizados para personas que quieren entrenar con estructura, intención y estrategia. Cada decisión del programa debe responder a tu objetivo y a tu capacidad real de progresar.</p>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex rounded-2xl bg-[#9cff00] px-6 py-4 font-black text-[#101807]">Entrena conmigo <Arrow /></a>
          </motion.div>
        </div>
      </section>

      <section className="px-5 pb-24 lg:px-8">
        <motion.div {...fadeUp} className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.2rem] border border-[#9cff00]/20 bg-[#101807] px-6 py-16 text-center sm:px-12 sm:py-24">
          <div className="absolute left-1/2 top-[-14rem] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[#9cff00]/15 blur-[110px]" />
          <p className="relative text-sm font-black uppercase tracking-[.24em] text-[#9cff00]">Tu siguiente nivel empieza aquí</p>
          <h2 className="relative mx-auto mt-5 max-w-4xl font-[var(--font-space-grotesk)] text-4xl font-black tracking-[-.045em] sm:text-6xl">
            ¿Listo para llevar tu físico al siguiente nivel?
          </h2>
          <p className="relative mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/60">Agenda tu asesoría y construyamos un plan enfocado en tus objetivos, tu técnica y tu progreso.</p>
          <motion.a whileHover={{ scale: 1.03 }} href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="relative mt-9 inline-flex rounded-2xl bg-[#9cff00] px-7 py-4 text-lg font-black text-[#101807]">
            Agenda tu asesoría <Arrow />
          </motion.a>
        </motion.div>
      </section>

      <footer className="border-t border-white/5 px-5 py-10 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
          <div><strong className="text-white">Bryan Henao Coach</strong><br />Hipertrofia · Recomposición corporal · Biomecánica</div>
          <div className="flex flex-wrap gap-5">
            <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="hover:text-[#9cff00]">Instagram</a>
            <a href={APP} target="_blank" rel="noopener noreferrer" className="hover:text-[#9cff00]">Acceso clientes</a>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="hover:text-[#9cff00]">WhatsApp</a>
          </div>
          <div>© 2026 Bryan Henao Martínez</div>
        </div>
      </footer>

      <motion.a
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: .8, type: "spring" }}
        href={WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-2xl shadow-2xl"
      >
        ✆
      </motion.a>
    </main>
  );
}
