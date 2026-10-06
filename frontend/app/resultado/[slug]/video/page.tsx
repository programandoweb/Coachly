import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RESULTS } from '../results';
import { ResultView } from '../ResultView';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = RESULTS[slug];
  if (!result) return { title: 'Resultado no encontrado' };
  return { title: `${result.athlete} · ${result.routine} (video)` };
}

export default async function ResultadoVideoPage({ params }: Props) {
  const { slug } = await params;
  const result = RESULTS[slug];
  if (!result?.video) notFound();

  return <ResultView result={result} video={result.video} slug={slug} />;
}
