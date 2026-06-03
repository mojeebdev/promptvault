'use client';

import { Logo } from './Logo';

export function Footer() {
  return (
    <footer
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px clamp(24px, 6vw, 80px)',
        borderTop: '1px solid var(--void-border)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <Logo size="sm" />

      <div style={{ display: 'flex', gap: '24px' }}>
        {[
          { label: 'X', href: 'https://x.com/PVonSui' },
          { label: 'GitHub', href: 'https://github.com/mojeebdev/promptvault' },
          { label: 'Docs', href: '/docs' },
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              letterSpacing: '0.06em',
              color: 'var(--ink-muted)',
              textDecoration: 'none',
            }}
          >
            {link.label}
          </a>
        ))}
      </div>

      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          color: 'var(--ink-muted)',
        }}
      >
        © 2026 PromptVault · Built on Sui × Walrus
      </span>
    </footer>
  );
}
