'use client';

import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
}

export function Logo({ size = 'md', withText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 18, text: 16 },
    md: { icon: 22, text: 18 },
    lg: { icon: 32, text: 28 },
  };

  const { icon, text } = sizes[size];

  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 group"
      style={{ textDecoration: 'none' }}
    >
      {/* Vault / Prompt Icon */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform group-hover:scale-105"
      >
        {/* Outer vault arch */}
        <path
          d="M6 26V12C6 7.58172 9.58172 4 14 4H18C22.4183 4 26 7.58172 26 12V26"
          stroke="var(--gold)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Inner glow / runes */}
        <path
          d="M9 22V14C9 11.2386 11.2386 9 14 9H18C20.7614 9 23 11.2386 23 14V22"
          stroke="var(--gold)"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />
        {/* Prompt symbol inside */}
        <path
          d="M12 16L16 13L12 19"
          stroke="var(--gold-sun)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="19" cy="16" r="1.2" fill="var(--gold)" />
      </svg>

      {withText && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: `${text}px`,
            fontWeight: 700,
            letterSpacing: '0.02em',
            color: 'var(--ink-primary)',
          }}
        >
          Prompt<span style={{ color: 'var(--gold)' }}>Vault</span>
        </span>
      )}
    </Link>
  );
}
