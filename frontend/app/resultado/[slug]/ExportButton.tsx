'use client';

import { useEffect, useRef, useState } from 'react';
import type { WorkoutResult } from './results';
import { drawResult } from './drawResult';
import styles from './resultado.module.css';

type Props = { result: WorkoutResult; video?: string; slug: string };

type Output = { url: string; filename: string; type: string };

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo cargar la imagen.'));
    img.src = src;
  });
}

function loadVideo(src: string) {
  return new Promise<HTMLVideoElement>((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.onloadeddata = () => resolve(video);
    video.onerror = () => reject(new Error('No se pudo cargar el video.'));
    video.src = src;
  });
}

function pickMimeType() {
  const options = [
    'video/mp4;codecs=avc1.42E01E',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  return options.find((type) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) ?? '';
}

async function exportImage(result: WorkoutResult, slug: string): Promise<Output> {
  const img = await loadImage(result.background);
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 2340;
  const ctx = canvas.getContext('2d')!;
  drawResult(ctx, canvas.width, canvas.height, { source: img, width: img.naturalWidth, height: img.naturalHeight }, result);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('No se pudo generar la imagen.');
  return { url: URL.createObjectURL(blob), filename: `resultado-${slug}.png`, type: 'image/png' };
}

async function exportVideo(
  result: WorkoutResult,
  videoSrc: string,
  slug: string,
  onProgress: (value: number) => void
): Promise<Output> {
  const mimeType = pickMimeType();
  if (!mimeType) throw new Error('Este navegador no permite grabar video.');

  const video = await loadVideo(videoSrc);
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 1560;
  const ctx = canvas.getContext('2d')!;
  const frame = { source: video, width: video.videoWidth, height: video.videoHeight };

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };
  const stopped = new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
  });

  const render = () => {
    drawResult(ctx, canvas.width, canvas.height, frame, result);
    onProgress(Math.min(1, video.currentTime / (video.duration || 1)));
  };

  video.currentTime = 0;
  drawResult(ctx, canvas.width, canvas.height, frame, result);
  recorder.start(250);
  await video.play();
  // Un temporizador (no requestAnimationFrame) mantiene el ritmo aunque el navegador pause el render.
  const timer = window.setInterval(render, 1000 / 30);

  await new Promise<void>((resolve) => {
    video.onended = () => resolve();
  });
  window.clearInterval(timer);
  drawResult(ctx, canvas.width, canvas.height, frame, result);
  recorder.stop();
  await stopped;

  const type = mimeType.split(';')[0];
  const blob = new Blob(chunks, { type });
  const ext = type === 'video/mp4' ? 'mp4' : 'webm';
  return { url: URL.createObjectURL(blob), filename: `resultado-${slug}.${ext}`, type };
}

export function ExportButton({ result, video, slug }: Props) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [output, setOutput] = useState<Output | null>(null);
  const [canShare, setCanShare] = useState(false);
  const outputRef = useRef<Output | null>(null);

  useEffect(() => {
    outputRef.current = output;
  }, [output]);

  useEffect(() => () => {
    if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
  }, []);

  async function run() {
    setBusy(true);
    setError('');
    setProgress(0);
    if (output) URL.revokeObjectURL(output.url);
    setOutput(null);

    try {
      const next = video ? await exportVideo(result, video, slug, setProgress) : await exportImage(result, slug);
      setOutput(next);
      const file = new File([await (await fetch(next.url)).blob()], next.filename, { type: next.type });
      setCanShare(Boolean(navigator.canShare?.({ files: [file] })));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo exportar.');
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    if (!output) return;
    try {
      const file = new File([await (await fetch(output.url)).blob()], output.filename, { type: output.type });
      await navigator.share({ files: [file] });
    } catch {
      // El usuario canceló.
    }
  }

  const label = video ? 'Exportar video' : 'Exportar imagen';

  return (
    <div className={styles.exporter}>
      {error ? <p className={styles.exportError}>{error}</p> : null}
      {output ? (
        <>
          <a className={styles.exportBtn} href={output.url} download={output.filename}>
            Descargar {output.filename.split('.').pop()?.toUpperCase()}
          </a>
          {canShare ? (
            <button type="button" className={styles.exportBtn} onClick={share}>Compartir</button>
          ) : null}
        </>
      ) : null}
      <button type="button" className={styles.exportBtn} onClick={run} disabled={busy}>
        {busy ? (video ? `Grabando… ${Math.round(progress * 100)}%` : 'Generando…') : output ? 'Volver a exportar' : label}
      </button>
    </div>
  );
}
