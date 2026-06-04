'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { createNetworkConfig } from '@mysten/dapp-kit';
import type { Theme } from '@mysten/dapp-kit';
import { useState } from 'react';

// Import dapp-kit styles (required for ConnectButton + wallet selection modal to render and respond to clicks)
import '@mysten/dapp-kit/dist/index.css';

// Dark theme for the dapp-kit wallet modal / connect UI to match our Leo × Saturn dark design
const darkTheme: Theme = {
  blurs: {
    modalOverlay: 'blur(4px)',
  },
  backgroundColors: {
    primaryButton: '#D4A017', // gold
    primaryButtonHover: '#8B6914',
    outlineButtonHover: '#1A1A1E',
    modalOverlay: 'rgba(10, 10, 11, 0.85)',
    modalPrimary: '#111113',
    modalSecondary: '#1A1A1E',
    iconButton: 'transparent',
    iconButtonHover: '#222228',
    dropdownMenu: '#111113',
    dropdownMenuSeparator: '#2A2A30',
    walletItemSelected: '#1A1A1E',
    walletItemHover: '#222228',
  },
  borderColors: {
    outlineButton: '#2A2A30',
  },
  colors: {
    primaryButton: '#0A0A0B',
    outlineButton: '#F5F0E8',
    iconButton: '#F5F0E8',
    body: '#F5F0E8',
    bodyMuted: '#9A9080',
    bodyDanger: '#FF794B',
  },
  radii: {
    small: '6px',
    medium: '8px',
    large: '12px',
    xlarge: '16px',
  },
  shadows: {
    primaryButton: '0 4px 12px rgba(212, 160, 23, 0.15)',
    walletItemSelected: '0 2px 6px rgba(0, 0, 0, 0.4)',
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    bold: '600',
  },
  fontSizes: {
    small: '14px',
    medium: '16px',
    large: '18px',
    xlarge: '20px',
  },
  typography: {
    fontFamily: 'var(--font-body)',
    fontStyle: 'normal',
    lineHeight: '1.3',
    letterSpacing: '0.02em',
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  const { networkConfig } = createNetworkConfig({
    mainnet: {
      url: process.env.NEXT_PUBLIC_SUI_MAINNET_RPC || 'https://sui-mainnet.gateway.tatum.io',
      network: 'mainnet',
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider autoConnect storageKey="promptvault-wallet" theme={darkTheme}>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
