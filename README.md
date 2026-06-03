# PromptVault

**Your Prompts. Stored Forever.**

The first decentralized AI prompt registry built on Sui.

Store, discover, and fork AI prompts as Walrus blobs — immutable, citable, and owned by no one but the chain.

**Live:** [https://promptvault.mojeeb.xyz](https://promptvault.mojeeb.xyz)

**GitHub:** [https://github.com/mojeebdev/promptvault](https://github.com/mojeebdev/promptvault)

**X:** [@mojeebeth](https://x.com/mojeebeth)

> Built for the Tatum × Walrus × Sui Hackathon by Mojeeb Titilayo (BlindspotLab)

---

## Why PromptVault Wins

- **Walrus is the core mechanic** — not an add-on. Every prompt + its AI evaluation is stored as real immutable Walrus blobs.
- **True on-chain provenance** — PromptRecord objects + PromptPublished events on Sui mainnet.
- **AI meta-layer** — Every submission is scored and improved by Gemini 2.5 Flash Lite (via OpenRouter) before storage.
- Hits **Best Walrus Integration** + **Best Use of Tatum Tools** simultaneously.

---

## How It Works

1. **Submit** a prompt with title, tags, and target model.
2. **AI Evaluation** — PromptVault's evaluator (Gemini) scores clarity, structure, model-fit and returns an improved version. The full evaluation is stored as a second Walrus blob.
3. **Walrus Storage** — Both the original prompt and the evaluation become permanent, decentralized blobs.
4. **On-chain Record** (optional but powerful) — A Sui transaction creates a `PromptRecord` pointing to the two blob IDs + links forks to their parent.
5. **Vault & Fork** — Anyone can browse the public feed and fork existing prompts. Forks carry on-chain provenance.

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
| Client TX        | @mysten/sui                               |
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

### Publishing the Move contract without installing Sui CLI locally

Use a browser-based environment:

- **Gitpod** (recommended, one-click): https://gitpod.io/#https://github.com/mojeebdev/promptvault
- **GitHub Codespaces**: In the repo → Code → Codespaces → Create

In the browser terminal you get full access to run `sui client publish` after a one-time install of the Sui CLI.

See the detailed guide (including a SDK publish script) in the in-app **Docs** page at `/docs`.

Open [http://localhost:3000](http://localhost:3000)

### Required Keys (for full functionality)

- `TATUM_API_KEY` — https://dashboard.tatum.io (for Sui RPC)
- `OPENROUTER_API_KEY` — https://openrouter.ai (for AI evaluation)
- Walrus mainnet endpoints are public (no key needed)

---

## On-Chain Contract (Optional but Recommended)

The Move contract lives in `contracts/promptvault.move`.

To deploy on **Sui Mainnet**:

```bash
cd contracts
sui client publish --gas-budget 100000000
```

Copy the published **Package ID** and set it:

```env
NEXT_PUBLIC_PROMPTVAULT_PACKAGE_ID=0x...
```

Then restart the app. You can now uncheck "Demo mode" in the submit flow and publish real on-chain records using a mainnet private key.

> ⚠️ Mainnet = real SUI gas and permanent objects.

---

## Project Structure

```
app/
├── layout.tsx          # Metadata, OG, fonts, Navbar + Footer
├── page.tsx            # Landing / Hero
├── vault/page.tsx      # Public feed
├── submit/page.tsx     # Submit + AI eval + on-chain publish
├── prompt/[blobId]/page.tsx
└── api/
    ├── store/route.ts  # Walrus + AI evaluation
    └── prompts/route.ts # Feed (on-chain events or demo seeds)

components/
├── ui/                 # Navbar, Footer, Logo, ScoreBadge
├── hero/               # HeroSection + HeroVideo
├── vault/              # PromptCard, PromptFeed, ForkButton
└── submit/             # SubmitForm, EvaluationPanel

lib/
├── walrus.ts           # storeBlob / retrieveBlob (mainnet)
├── sui.ts              # Client tx builder + event queries (mainnet only)
├── tatum.ts            # Sui RPC via Tatum (mainnet)
└── openrouter.ts       # AI Evaluator with full system prompt

contracts/promptvault.move   # The on-chain PromptRecord module
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
- **X**: https://x.com/mojeebeth
- **Builder**: Mojeeb Titilayo / BlindspotLab

---

## Future Improvements (Post-Hackathon)

- Deploy real Move package on mainnet + indexer for clean feed
- Project-specific X account (@PromptVault or similar)
- Better wallet connect (dapp-kit)
- On-chain fork linking in the Move module
- Dark/light theme toggle (current is pure void)

---

## License & Credits

Built with ❤️ for the Sui ecosystem.

All on-chain activity is on **Sui Mainnet**.

---

**Built by Mojeeb Titilayo** — June 2026
