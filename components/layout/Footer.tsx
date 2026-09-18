import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-dark-card border-t border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link href="/" className="font-heading text-2xl text-off-white tracking-widest hover:text-burnt-orange transition-colors">
              ALPHA RETREATS
            </Link>
            <p className="mt-4 text-gray-400 font-body text-sm leading-relaxed max-w-xs">
              Built for Men. Forged in the Wild. Premium men&apos;s retreat experiences across the globe — for those who refuse to be ordinary.
            </p>
            <div className="flex items-center gap-4 mt-6">
              {['Instagram', 'LinkedIn', 'YouTube'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-gray-500 hover:text-burnt-orange font-body text-sm transition-colors"
                  aria-label={social}
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading text-lg text-off-white tracking-wider mb-4">EXPLORE</h4>
            <ul className="space-y-3">
              {[
                { href: '/retreats', label: 'All Retreats' },
                { href: '/corporate', label: 'Corporate' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
                { href: '/members', label: 'Members Area' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-off-white font-body text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg text-off-white tracking-wider mb-4">LEGAL</h4>
            <ul className="space-y-3">
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms & Conditions' },
                { href: '/refunds', label: 'Refund Policy' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-off-white font-body text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <p className="text-gray-500 font-body text-xs">hello@alpha-retreats.com</p>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 font-body text-xs">
            &copy; {new Date().getFullYear()} Alpha Retreats. All rights reserved.
          </p>
          <p className="text-gray-600 font-body text-xs">
            Built for Men. Forged in the Wild.
          </p>
        </div>
      </div>
    </footer>
  );
}
