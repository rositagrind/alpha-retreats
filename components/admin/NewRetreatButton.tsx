'use client';

import { useRouter } from 'next/navigation';

export default function NewRetreatButton() {
  const router = useRouter();
  return (
    <button className="btn-primary" onClick={() => router.push('/admin/retreats/new')}>
      + New Retreat
    </button>
  );
}
