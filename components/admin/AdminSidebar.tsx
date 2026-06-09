'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard, Mountain, CalendarCheck, Users, Briefcase, MessageSquare, Menu, X, LogOut, UserCheck
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/retreats', label: 'Retreats', icon: Mountain },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/admin/waitlist', label: 'Waitlist', icon: Users },
  { href: '/admin/members', label: 'Members', icon: UserCheck },
  { href: '/admin/corporate', label: 'Corporate', icon: Briefcase },
  { href: '/admin/contact', label: 'Messages', icon: MessageSquare },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname?.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-dark-border">
        <Link href="/" className="font-heading text-lg text-off-white tracking-widest hover:text-burnt-orange transition-colors">
          ALPHA RETREATS
        </Link>
        <p className="text-gray-600 font-body text-xs mt-1">Admin Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded font-body text-sm transition-colors ${
              isActive(href, exact)
                ? 'bg-burnt-orange/20 text-burnt-orange border border-burnt-orange/30'
                : 'text-gray-400 hover:text-off-white hover:bg-dark-card'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-dark-border">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-3 px-4 py-2.5 rounded font-body text-sm text-gray-500 hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {signingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-dark-card border border-dark-border p-2 rounded"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-dark-card border-r border-dark-border z-40 transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-dark-card border-r border-dark-border flex-col">
        <SidebarContent />
      </div>
    </>
  );
}
