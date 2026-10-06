'use client';

import { useRouter } from 'next/navigation';

export default function RoutineBackButton() {
  const router = useRouter();

  return (
    <button type="button" className="btn btn-soft routine-back-button" onClick={() => router.back()}>
      Volver
    </button>
  );
}
