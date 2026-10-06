export type WorkoutResult = {
  athlete: string;
  routine: string;
  background: string;
  video?: string;
  duration: string;
  totalKg: number;
  records: number;
  comparison: string;
  exercise: {
    name: string;
    from: number;
    to: number;
    progress: string;
    points: { label: string; kg: number }[];
  };
};

// Resultados públicos por atleta. Por ahora son datos fijos; luego se pueden
// alimentar desde la API de Laravel.
export const RESULTS: Record<string, WorkoutResult> = {
  bryan: {
    athlete: 'Bryan',
    routine: 'Legs 1',
    background: '/images/atleta-programandoweb.jpg',
    video: '/images/programandoweb-fitness.mp4',
    duration: '1h 26',
    totalKg: 10991,
    records: 1,
    comparison: '¡el peso de una columna del Partenón!',
    exercise: {
      name: 'Prensa pendular',
      from: 40,
      to: 90,
      progress: '+125% en 6 semanas',
      points: [
        { label: '16 jul', kg: 40 },
        { label: '4 ago', kg: 80 },
        { label: '', kg: 80 },
        { label: '', kg: 90 },
        { label: '27 ago', kg: 90 },
      ],
    },
  },
};
