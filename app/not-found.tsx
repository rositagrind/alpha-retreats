import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Lost in the Wild | Alpha Retreats',
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-dark-bg">
      <div className="text-center px-4">
        <p className="font-heading text-9xl text-dark-border mb-4">404</p>
        <h1 className="heading-lg mb-4">LOST IN THE WILD.</h1>
        <p className="text-gray-400 font-body text-lg max-w-sm mx-auto mb-10">
          The page you are looking for does not exist. Even the best trackers lose the trail sometimes.
        </p>
        <Link href="/" className="btn-primary inline-flex">
          Back To Base Camp
        </Link>
      </div>
    </main>
  );
}
