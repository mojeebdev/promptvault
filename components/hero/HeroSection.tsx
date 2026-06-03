'use client';

import Link from 'next/link';
import { HeroVideo } from './HeroVideo';

export function HeroSection() {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 clamp(20px, 5vw, 80px)',
        overflow: 'hidden',
        paddingTop: 'var(--nav-height)',
        paddingBottom: '60px',
      }}
      className="bg-glint"
    >
      <HeroVideo />

      {/* Content layer */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '820px' }}>
        {/* Eyebrow */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            marginBottom: '24px',
          }}
        >
          Decentralized · Immutable · On-Chain
        </p>

        {/* Headline */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(42px, 7.5vw, 72px)',
            fontWeight: 700,
            letterSpacing: '0.01em',
            lineHeight: 1.05,
            color: 'var(--ink-primary)',
            marginBottom: '18px',
          }}
        >
          Your Prompts.<br />
          <span style={{ color: 'var(--gold)' }}>Stored Forever.</span>
        </h1>

        {/* Subheadline */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(14px, 1.7vw, 16px)',
            fontWeight: 300,
            lineHeight: 1.6,
            color: 'var(--ink-secondary)',
            maxWidth: '620px',
            margin: '0 auto 24px',
          }}
        >
          The first decentralized prompt registry built on Sui.
          Store, discover, and fork AI prompts as Walrus blobs —
          immutable, citable, and owned by no one but the chain.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/submit" className="btn-primary">
            Publish Your First Prompt
          </Link>
          <Link href="/vault" className="btn-ghost">
            Explore the Vault
          </Link>
        </div>

        {/* Trust bar */}
        <p
          style={{
            marginTop: '28px',
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            letterSpacing: '0.08em',
            color: 'var(--ink-muted)',
          }}
        >
          Powered by{' '}
          <span style={{ color: 'var(--gold)' }}>Walrus</span> ·{' '}
          <span style={{ color: 'var(--gold)' }}>Tatum RPC</span> ·{' '}
          <span style={{ color: 'var(--gold)' }}>Sui Mainnet</span>
        </p>
      </div>

      {/* Scroll indicator - hidden on very small screens to avoid overlap */}
      <div
        className="hidden sm:block"
        style={{
          position: 'absolute',
          bottom: '32px',
          fontSize: '11px',
          letterSpacing: '0.12em',
          color: 'var(--ink-muted)',
          zIndex: 2,
        }}
      >
        ↓ What lives in the vault?
      </div>
    </section>
  );
}
