import Link from 'next/link';

export default function MembersPendingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-dark-bg">
      <div className="w-full max-w-md px-4 text-center">
        <Link href="/" className="font-heading text-2xl text-off-white tracking-widest hover:text-burnt-orange transition-colors">
          ALPHA RETREATS
        </Link>
        <div className="bg-dark-card border border-dark-border rounded-lg p-10 mt-8">
          <p className="font-heading text-2xl text-burnt-orange mb-4">APPLICATION UNDER REVIEW</p>
          <p className="text-gray-400 font-body text-sm leading-relaxed">
            Your application is under review. We&apos;ll be in touch once it has been assessed.
          </p>
        </div>
        <p className="text-center text-gray-600 font-body text-xs mt-6">
          Wrong account?{' '}
          <Link href="/members/login" className="text-burnt-orange hover:text-orange-400 transition-colors">
            Sign in with a different email
          </Link>
        </p>
      </div>
    </main>
  );
}
