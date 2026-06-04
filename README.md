# PromptVault

**Your Prompts. Stored Forever.**

The first decentralized AI prompt registry built on Sui.

Store, discover, and fork AI prompts as Walrus blobs — immutable, citable, and owned by no one but the chain.

**Live:** [https://promptvault.mojeeb.xyz](https://promptvault.mojeeb.xyz)

**GitHub:** [https://github.com/mojeebdev/promptvault](https://github.com/mojeebdev/promptvault)

**X:** [@PVonSui](https://x.com/PVonSui)

> Built for the Tatum × Walrus × Sui Hackathon by Mojeeb Titilayo (BlindspotLab)

---

## Why PromptVault Wins

- **Walrus is the core mechanic** — not an add-on. Every prompt + its AI evaluation is stored as real immutable Walrus blobs (permanent, decentralized, publicly verifiable).
- **AI meta-layer** — Every submission is scored and improved by Gemini 2.5 Flash Lite (via OpenRouter) before storage. The evaluation is also a first-class Walrus blob.
- **Wallet provenance** — Author address from connected Sui mainnet wallet is saved in Firestore metadata (no smart contract required).
- **Fork tracking** — Forks link back to parents via metadata for provenance.
- Resilient networking (retries, IPv4 preference, OpenRouter fallbacks + default eval) so submits succeed even on flaky local networks.
- Hits **Best Walrus Integration** + **Best Use of Tatum Tools** (for wallet RPC) simultaneously.

---

## How It Works

1. **Submit** a prompt with title, tags, and target model (while connected to a Sui mainnet wallet).
2. **AI Evaluation** — PromptVault's evaluator (Gemini 2.5 Flash Lite via OpenRouter) scores clarity, structure, model-fit and returns an improved version. The full evaluation JSON is stored as a second Walrus blob.
3. **Walrus Storage** — Both the original prompt (with metadata) and the AI evaluation become permanent, immutable, publicly retrievable blobs on Walrus mainnet.
4. **Metadata Index** — Title, blob IDs, tags, target model, author wallet address, and fork parent are saved to Firebase Firestore for fast public querying and the vault feed.
5. **Vault & Fork** — Anyone can browse the public feed (no wallet needed). Connected users can fork any prompt — the fork links back to the parent via metadata.

---

## Tech Stack

| Layer            | Tool                                      |
|------------------|-------------------------------------------|
| Framework        | Next.js 16 (App Router)                   |
| Language         | TypeScript                                |
| Styling          | Tailwind CSS + CSS Variables (Leo × Saturn palette) |
| Blockchain       | Sui Mainnet (via Tatum RPC)               |
| Storage          | Walrus Mainnet                            |
| AI Evaluator     | Gemini 2.5 Flash Lite via OpenRouter      |
| Wallet           | @mysten/dapp-kit (Sui mainnet only)       |
| Deploy           | Vercel                                    |

---

## Local Development

```bash
# 1. Clone
git clone https://github.com/mojeebdev/promptvault.git
cd promptvault

# 2. Install
npm install

# 3. Environment
cp .env.local.example .env.local
# Add your keys. See .env.local.example for details.

# 4. Run
npm run dev
```

Visit http://localhost:3000

### Wallet Connection for Submitting Prompts

We use **@mysten/dapp-kit** (official Mysten Labs React SDK for Sui) + @tanstack/react-query.

- Connect wallet button in the Navbar.
- **Required** to submit/publish a prompt (the wallet address is saved as `author` in Firestore).
- **Not required** to browse the vault (public read-only access).
- Restricted to **Sui Mainnet** only (`sui:mainnet`).
- Supports Sui Wallet, Suiet, Slush, and other Sui-compatible wallets.
- On local `http://localhost` you will see a "Your connection is not secure" warning from the wallet extension (normal for non-HTTPS during dev). Approve it for testing. No warning on the live HTTPS site.

Full details and implementation notes in the in-app **Docs** (`/docs` → "Wallet Connection").

Providers are in `app/providers.tsx` (mainnet config using Tatum RPC).

No Move contract or deployment is required — only Walrus blobs + Firestore metadata.

Visit http://localhost:3000 to test locally.

### Required Keys (for full functionality)

- `TATUM_API_KEY` — https://dashboard.tatum.io (for Sui RPC, optional for core flow)

**Common gotcha on Windows:** Walrus blob storage (publisher.walrus.space) sometimes has DNS resolution problems (`EAI_AGAIN` / `ENOTFOUND`) from the Next.js dev server. The app now forces IPv4 + retries. If you see it, run `ipconfig /flushdns`, test with `nslookup publisher.walrus.space 8.8.8.8`, then restart `npm run dev`. Changing your network DNS to 8.8.8.8 + 1.1.1.1 almost always fixes it.
- `OPENROUTER_API_KEY` — https://openrouter.ai (for AI evaluation with gemini-2.5-flash-lite free tier + fallbacks)
- Firebase config keys (see `.env.local.example`) for Firestore metadata index. Add `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (GA4 Measurement ID from Firebase console) to enable Google Analytics via the Firebase SDK (in addition to Vercel Analytics).
- Vercel Analytics is enabled via `@vercel/analytics` in `app/layout.tsx` (automatic on Vercel, no extra env).

No private keys or contract deployment required — author address comes from connected wallet.

**Analytics**: Both Vercel Analytics and Firebase/Google Analytics (via measurementId) are active. See `lib/firebase.ts` for Firebase init.

### Firebase Firestore Rules (example - user to add in console)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /prompts/{promptId} {
      allow read: if true;  // Public for vault
      allow write: if request.auth != null;
    }
  }
}
```
Secure further for production (e.g. validate writes, add auth).


---

## Wallet Connection

See the in-app **Docs** page (`/docs` → "Wallet Connection") for full details on @mysten/dapp-kit setup, mainnet restriction, and how the author address is saved to Firestore on submit.

Connect button lives in the Navbar. Required only for writes (submit); reads (vault) are public.

---

## Project Structure

```
app/
├── layout.tsx          # Metadata, OG, fonts, Navbar + Footer
├── page.tsx            # Landing / Hero
├── vault/page.tsx      # Public feed
├── submit/page.tsx     # Submit form (wallet required) + AI eval + Walrus + Firestore
├── prompt/[blobId]/page.tsx
└── api/
    ├── store/route.ts  # AI evaluation (OpenRouter) + dual Walrus blob storage + Firestore metadata
    └── prompts/route.ts # Public feed from Firestore (with demo seeds fallback)

components/
├── ui/                 # Navbar, Footer, Logo, ScoreBadge
├── hero/               # HeroSection + HeroVideo
├── vault/              # PromptCard, PromptFeed, ForkButton
└── submit/             # SubmitForm, EvaluationPanel

lib/
├── walrus.ts           # storeBlob / retrieveBlob (mainnet publisher/aggregator)
├── openrouter.ts       # AI Evaluator with full master system prompt + fallbacks
└── firebase.ts         # Firestore client (metadata index + optional Analytics)
public/
├── logo.png
├── og-image.jpg
└── videos/...
```

---

## Logo, Branding & Assets

- Custom SVG logo in `components/ui/Logo.tsx` (scalable for web)
- Raster version of the exact same logo (for X profile pic, favicon): `public/logo.jpg`
- X/Twitter header banner: `public/x-header.jpg` (exactly 1500x500 pixels, 3:1 ratio)
- Brand colors: `--gold: #D4A017`, `--void: #0A0A0B`
- Fonts: Teko (display), Ubuntu (body)
- OpenGraph image: `public/og-image.jpg`

---

## Social & Links

- **Website**: https://promptvault.mojeeb.xyz
- **Docs**: https://promptvault.mojeeb.xyz/docs
- **GitHub**: https://github.com/mojeebdev/promptvault
- **X**: https://x.com/PVonSui
- **Builder**: Mojeeb Titilayo / BlindspotLab
**Builder X**: https://x.com/mojeebeth
---

## Future Improvements

- Better error handling and loading states
- Search and filtering in the vault
- User profiles / more social features

---

## License & Credits

Built with ❤️ for the Sui ecosystem.

Wallet connections use **Sui Mainnet** (via Tatum RPC). Storage and evaluation use Walrus mainnet + OpenRouter (no Move smart contract).

---

**Built by Mojeeb Titilayo** — June 2026
