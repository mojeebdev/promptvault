'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { ConnectButton } from '@mysten/dapp-kit';

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = (href: string) =>
    `nav-link ${pathname === href ? 'text-ink-primary' : ''}`;

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--nav-height)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        padding: '0 clamp(16px, 5vw, 80px)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        backgroundColor: 'var(--nav-bg)',
        borderBottom: '1px solid var(--void-border)',
      }}
    >
      {/* Logo wrapper to prevent it from pushing the hamburger off-screen on small mobile */}
      <div style={{ flex: '1 1 auto', minWidth: 0, overflow: 'hidden' }}>
        <Logo size="md" />
      </div>

      {/* Right actions container - ensures hamburger is always accessible on mobile */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', flexShrink: 0, gap: '16px' }}>
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center" style={{ gap: '32px' }}>
          <Link href="/vault" className={linkClass('/vault')}>
            Explore
          </Link>
          <Link href="/submit" className={linkClass('/submit')}>
            Submit
          </Link>
        </div>

        {/* Wallet Connect - visible on desktop (top right). On mobile it is inside the hamburger menu (see docs). */}
        <div className="wallet-connect hidden md:block">
          <ConnectButton />
        </div>

        {/* Mobile Hamburger - only visible on mobile */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex p-3 -mr-1 text-[var(--ink-primary)]"
          aria-label="Toggle menu"
          style={{ 
            zIndex: 110, 
            cursor: 'pointer',
            background: 'transparent',
            border: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '44px',
            minHeight: '44px',
            touchAction: 'manipulation'
          }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed',
            top: 'var(--nav-height)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--nav-dropdown-bg)',
            borderBottom: '1px solid var(--void-border)',
            padding: '16px clamp(16px, 5vw, 80px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            zIndex: 110,
          }}
        >
          <Link
            href="/vault"
            className={linkClass('/vault')}
            onClick={closeMobile}
            style={{ padding: '8px 0', fontSize: '15px' }}
          >
            Explore
          </Link>
          <Link
            href="/submit"
            className={linkClass('/submit')}
            onClick={closeMobile}
            style={{ padding: '8px 0', fontSize: '15px' }}
          >
            Submit
          </Link>

          {/* Wallet connect inside mobile hamburger menu (as documented) */}
          <div onClick={closeMobile} className="wallet-connect pt-1">
            <ConnectButton />
          </div>
        </div>
      )}
    </nav>
  );
}
