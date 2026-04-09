'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const MountainIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-burnt-orange">
    <path d="M14 6l-1-2H5v17h2v-7h5l1 2h7V6h-6zm4 8h-4l-1-2H7V6h5l1 2h5v6z" />
    <path d="M8.5 13l2-4 2 4z" />
    <path d="M13 10l3 6H10z" />
  </svg>
);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { href: '/retreats', label: 'Retreats' },
    { href: '/corporate', label: 'Corporate' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark-bg/95 backdrop-blur-sm border-b border-dark-border' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <MountainIcon />
            <span className="font-heading text-2xl text-off-white tracking-widest group-hover:text-burnt-orange transition-colors">
              ALPHA RETREATS
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-body text-sm uppercase tracking-widest transition-colors hover:text-burnt-orange ${
                  pathname?.startsWith(link.href) ? 'text-burnt-orange' : 'text-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/members"
              className="font-body text-sm uppercase tracking-widest text-gray-300 hover:text-off-white transition-colors"
            >
              Members
            </Link>
            <Link
              href="/#waitlist"
              className="bg-burnt-orange text-white font-body font-semibold text-sm uppercase tracking-widest px-6 py-2.5 rounded hover:bg-orange-700 transition-colors"
            >
              Join Waitlist
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-off-white p-2"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-dark-bg border-t border-dark-border">
          <div className="px-4 py-6 space-y-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block font-body text-base uppercase tracking-widest text-gray-300 hover:text-burnt-orange transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/members"
              onClick={() => setMenuOpen(false)}
              className="block font-body text-base uppercase tracking-widest text-gray-300 hover:text-off-white transition-colors"
            >
              Members
            </Link>
            <Link
              href="/#waitlist"
              onClick={() => setMenuOpen(false)}
              className="inline-block bg-burnt-orange text-white font-body font-semibold text-sm uppercase tracking-widest px-6 py-3 rounded hover:bg-orange-700 transition-colors"
            >
              Join Waitlist
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
