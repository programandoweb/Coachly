import type { WorkoutResult } from './results';
import styles from './resultado.module.css';
import { ExportButton } from './ExportButton';


const nf = new Intl.NumberFormat('es-CO');

function Body({ back }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 60 130" className={styles.body} aria-hidden>
      <circle cx="30" cy="9" r="7" fill="#e9edf2" />
      <path d="M17 20h26l6 8-3 30H14l-3-30z" fill="#e9edf2" />
      <path d="M8 26l7 2-5 30-6-2zM52 26l-7 2 5 30 6-2z" fill="#cfd6df" />
      <path d="M17 58h26l1 14H16z" fill="#e9edf2" />
      <path d="M17 72h12l-2 40h-8zM31 72h12l-2 40h-8z" fill="#17c3a5" />
      <path d="M19 112h8l-1 14h-8zM33 112h8l1 14h-8z" fill="#e9edf2" />
      {back ? <path d="M21 30h18l-2 22H23z" fill="#2c6fe0" opacity=".85" /> : null}
    </svg>
  );
}

function Column() {
  return (
    <svg viewBox="0 0 70 130" className={styles.column} aria-hidden>
      <defs>
        <linearGradient id="col" x1="0" x2="1">
          <stop offset="0" stopColor="#8a6a4a" />
          <stop offset=".45" stopColor="#f3c58a" />
          <stop offset="1" stopColor="#7a5a3c" />
        </linearGradient>
      </defs>
      <rect x="4" y="6" width="62" height="10" rx="2" fill="#d9b183" />
      <rect x="12" y="16" width="46" height="6" fill="#b88d62" />
      <path d="M17 22h36l-3 92H20z" fill="url(#col)" />
      {[27, 35, 43].map((x) => (
        <path key={x} d={`M${x} 22l-1 92`} stroke="#00000033" strokeWidth="1.2" />
      ))}
      <rect x="10" y="114" width="50" height="8" fill="#b88d62" />
      <rect x="4" y="122" width="62" height="6" rx="2" fill="#d9b183" />
    </svg>
  );
}

function Chart({ points }: { points: { label: string; kg: number }[] }) {
  const W = 190;
  const H = 90;
  const min = 40;
  const max = 100;
  const x = (i: number) => 12 + (i * (W - 24)) / (points.length - 1);
  const y = (kg: number) => H - 8 - ((kg - min) / (max - min)) * (H - 16);
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)} ${y(p.kg)}`).join(' ');
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H + 14}`} className={styles.chart} aria-hidden>
      {[40, 60, 80, 100].map((v) => (
        <g key={v}>
          <line x1="0" x2={W} y1={y(v)} y2={y(v)} stroke="#ffffff22" strokeWidth=".6" />
          <text x="0" y={y(v) - 2} fill="#ffffffaa" fontSize="6">{v} kg</text>
        </g>
      ))}
      <path d={path} fill="none" stroke="#17c3a5" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx={x(0)} cy={y(points[0].kg)} r="2.2" fill="#fff" />
      <circle cx={x(points.length - 1)} cy={y(last.kg)} r="2.6" fill="#fff" />
      {points.map((p, i) =>
        p.label ? (
          <text key={i} x={x(i)} y={H + 8} fill="#ffffffaa" fontSize="6" textAnchor="middle">{p.label}</text>
        ) : null
      )}
    </svg>
  );
}

export function ResultView({ result, video, slug }: { result: WorkoutResult; video?: string; slug: string }) {
  const { exercise } = result;

  return (
    <div className={styles.page}>
      <div className={styles.stage} style={{ backgroundImage: `url(${result.background})` }}>
        {video ? (
          <video
            className={styles.video}
            src={video}
            poster={result.background}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : null}
        <div className={styles.shade} />
        <p className={styles.athlete}>{result.athlete}</p>

        <div className={styles.panel}>
          <section className={styles.center}>
            <h1 className={styles.title}>{result.routine}</h1>
            <p className={styles.sub}>Levantaste un total de</p>
            <div className={styles.totalRow}>
              <Column />
              <p className={styles.total}>
                {nf.format(result.totalKg)}
                <span> kg</span>
              </p>
            </div>
            <p className={styles.compare}>{result.comparison}</p>
          </section>

          <div className={styles.grid}>
            <aside className={styles.left}>
              <h2>{result.routine}</h2>
              <div className={styles.bodies}>
                <Body />
                <Body back />
              </div>
              <dl className={styles.stats}>
                <div><dd>{result.duration}</dd><dt>MIN</dt></div>
                <div><dd>{nf.format(result.totalKg)}</dd><dt>KG</dt></div>
                <div><dd className={styles.record}>{result.records} 🏅</dd><dt>RÉCORD</dt></div>
              </dl>
            </aside>

            <aside className={styles.right}>
              <h2>{exercise.name}</h2>
              <Chart points={exercise.points} />
              <p className={styles.delta}>
                {exercise.from} kg → <b>{exercise.to} kg</b>
              </p>
              <p className={styles.progress}>{exercise.progress}</p>
            </aside>
          </div>
        </div>
        <ExportButton result={result} video={video} slug={slug} />
      </div>
    </div>
  );
}
