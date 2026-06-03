# PromptVault — Complete Build Reference
> Tatum × Walrus × Sui Hackathon · Deadline: June 6, 2026 · Built by Mojeeb Titilayo / BlindspotLab

---

## TABLE OF CONTENTS

1. [Project Brief](#1-project-brief)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Design System](#4-design-system)
5. [AI System Prompt (Master)](#5-ai-system-prompt-master)
6. [Landing Page Copy](#6-landing-page-copy)
7. [Hero Video — Grok Imagine Prompts](#7-hero-video--grok-imagine-prompts)
8. [Video Integration Code](#8-video-integration-code)
9. [Environment Variables](#9-environment-variables)
10. [Core Walrus + Tatum Logic](#10-core-walrus--tatum-logic)
11. [Judging Criteria Checklist](#11-judging-criteria-checklist)
12. [Submission Checklist](#12-submission-checklist)

---

## 1. PROJECT BRIEF

**PromptVault** — The first decentralized AI prompt registry built on Sui.

One-liner: *Store, discover, and fork AI prompts as Walrus blobs — immutable, citable, and owned by no one but the chain.*

### What it does
- User submits an AI prompt with title, tags, and target model
- Prompt is stored as a **Walrus blob** via Tatum's Sui RPC
- The blob ID is written **on-chain** to Sui as an immutable record
- AI Evaluator (Gemini 2.5 Flash Lite via OpenRouter) scores and improves the prompt before storage
- AI evaluation output is stored as a **second Walrus blob** alongside the prompt
- Public feed shows all stored prompts with Walrus blob IDs + Sui tx hashes
- Anyone can **fork** a prompt — fork links back to original blob ID on-chain

### Why it wins
- Walrus is the CORE mechanic, not an add-on
- Hits **Best Walrus Integration** + **Best Use of Tatum Tools** bonus prizes simultaneously
- Prompt engineering as a first-class on-chain artifact — nobody else is doing this
- Builder IS the user — authentic domain expertise visible in every decision

---

## 2. TECH STACK

| Layer | Tool |
|---|---|
| Framework | Next.js 15 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS Variables |
| Blockchain | Sui Mainnet (via Tatum RPC) |
| Storage | Walrus decentralized blob storage |
| AI Evaluator | Gemini 2.5 Flash Lite via OpenRouter (free tier) |
| Deploy | Vercel |
| RPC Mainnet | `https://sui-mainnet.gateway.tatum.io` |
| RPC Testnet | `https://sui-testnet.gateway.tatum.io` |

### OpenRouter Free Models (fallback order)
1. `google/gemini-2.5-flash-lite` — primary
2. `meta-llama/llama-3.1-8b-instruct:free` — fallback
3. `mistralai/mistral-7b-instruct:free` — fallback

---

## 3. FOLDER STRUCTURE

```
promptvault/
├── app/
│   ├── layout.tsx               # Root layout + fonts
│   ├── page.tsx                 # Landing page (Hero)
│   ├── vault/
│   │   └── page.tsx             # Public prompt feed
│   ├── submit/
│   │   └── page.tsx             # Submit a prompt
│   ├── prompt/
│   │   └── [blobId]/
│   │       └── page.tsx         # Single prompt detail
│   └── api/
│       ├── evaluate/
│       │   └── route.ts         # AI evaluation endpoint
│       ├── store/
│       │   └── route.ts         # Walrus blob upload + Sui write
│       └── prompts/
│           └── route.ts         # Fetch all prompts from Sui
├── components/
│   ├── hero/
│   │   ├── HeroSection.tsx
│   │   └── HeroVideo.tsx
│   ├── vault/
│   │   ├── PromptCard.tsx
│   │   ├── PromptFeed.tsx
│   │   └── ForkButton.tsx
│   ├── submit/
│   │   ├── SubmitForm.tsx
│   │   └── EvaluationPanel.tsx
│   └── ui/
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       └── ScoreBadge.tsx
├── lib/
│   ├── walrus.ts                # Walrus blob upload/read helpers
│   ├── tatum.ts                 # Tatum Sui RPC helpers
│   ├── openrouter.ts            # OpenRouter AI call helper
│   └── sui.ts                   # Sui transaction helpers
├── public/
│   └── videos/
│       ├── hero-bg-video-desktop.mp4
│       └── hero-bg-video-mobile.mp4
├── styles/
│   └── globals.css              # CSS variables + base styles
└── .env.local
```

---

## 4. DESIGN SYSTEM

### Palette — Leo × Saturn
**Concept:** Leo ruled by the Sun, Saturday ruled by Saturn. Solar gold against obsidian void. Not flashy — *earned* gold.

```css
/* styles/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Ubuntu:wght@300;400;500;700&display=swap');

:root {
  /* FONTS */
  --font-display: 'Teko', sans-serif;     /* hero titles, stat numbers, nav mark */
  --font-body:    'Ubuntu', sans-serif;   /* body copy, descriptions, UI text */

  /* LEO × SATURN PALETTE */
  --void:          #0A0A0B;   /* page background */
  --void-02:       #111113;   /* card / surface */
  --void-03:       #1A1A1E;   /* elevated surface */
  --void-04:       #222228;   /* hover surface */
  --void-border:   #2A2A30;   /* dividers */

  --gold:          #D4A017;               /* PRIMARY accent — antique solar gold */
  --gold-deep:     #8B6914;               /* secondary — borders, hover states */
  --gold-sun:      #FFD700;               /* SPARINGLY — glints only */
  --gold-dim:      rgba(212,160,23,0.12); /* bg tints */
  --gold-border:   rgba(212,160,23,0.25); /* card borders */
  --gold-glow:     rgba(212,160,23,0.08); /* subtle glow fills */

  --ink-primary:   #F5F0E8;   /* warm white — headings */
  --ink-secondary: #9A9080;   /* body / subtext */
  --ink-muted:     #4A4540;   /* disabled / hints */
  --ink-accent:    #D4A017;   /* inline accent text */

  /* SPACING */
  --nav-height:    64px;
  --section-pad:   clamp(80px, 10vw, 140px);
  --content-max:   1200px;
  --text-max:      720px;

  /* TRANSITIONS */
  --ease-out:      cubic-bezier(0.16, 1, 0.3, 1);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background-color: var(--void);
  color: var(--ink-primary);
  font-family: var(--font-body);
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.1;
}
```

### Background — Glint Gradient (Hero) + Dot Grid (Vault feed)

```css
/* Hero page */
.bg-glint {
  background:
    radial-gradient(
      ellipse 60% 40% at 50% -5%,
      rgba(212, 160, 23, 0.10),
      transparent 70%
    ),
    var(--void);
}

/* Vault/feed page */
.bg-dot-grid {
  background-color: var(--void);
  background-image: radial-gradient(circle, var(--void-border) 1px, transparent 1px);
  background-size: 28px 28px;
}
.bg-dot-grid::after {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(
    ellipse 80% 60% at 50% 50%,
    transparent 40%,
    var(--void) 100%
  );
  pointer-events: none;
  z-index: 0;
}
```

### Navbar — Ghost Blur

```tsx
// components/ui/Navbar.tsx
export function Navbar() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: 'var(--nav-height)', zIndex: 100,
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 clamp(24px, 6vw, 80px)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      backgroundColor: 'rgba(10,10,11,0.7)',
      borderBottom: '1px solid var(--void-border)',
    }}>
      <a href="/" style={{
        fontFamily: 'var(--font-display)',
        fontSize: '22px', fontWeight: 700,
        letterSpacing: '0.02em',
        color: 'var(--ink-primary)',
        textDecoration: 'none',
      }}>
        Prompt<span style={{ color: 'var(--gold)' }}>Vault</span>
      </a>
      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        <a href="/vault" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--ink-secondary)', textDecoration: 'none' }}>Explore</a>
        <a href="/submit" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--ink-secondary)', textDecoration: 'none' }}>Submit</a>
        <a href="/submit" style={{
          fontFamily: 'var(--font-body)', fontSize: '13px',
          fontWeight: 500, color: 'var(--void)',
          background: 'var(--gold)', padding: '8px 20px',
          borderRadius: '6px', textDecoration: 'none',
          letterSpacing: '0.02em',
        }}>Publish Prompt →</a>
      </div>
    </nav>
  )
}
```

### Footer — Minimal One-Line

```tsx
// components/ui/Footer.tsx
export function Footer() {
  return (
    <footer style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px clamp(24px, 6vw, 80px)',
      borderTop: '1px solid var(--void-border)',
    }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--ink-primary)' }}>
        Prompt<span style={{ color: 'var(--gold)' }}>Vault</span>
      </span>
      <div style={{ display: 'flex', gap: '24px' }}>
        {['X', 'GitHub', 'Docs'].map(link => (
          <a key={link} href="#" style={{ fontFamily: 'var(--font-body)', fontSize: '12px', letterSpacing: '0.06em', color: 'var(--ink-muted)', textDecoration: 'none' }}>{link}</a>
        ))}
      </div>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--ink-muted)' }}>
        © 2026 PromptVault · Built on Sui × Walrus
      </span>
    </footer>
  )
}
```

### CTA Buttons

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-decoration: none;
  padding: 14px 32px;
  background: var(--gold);
  color: var(--void);
  border: 1px solid var(--gold);
  border-radius: 8px;
  transition: opacity 0.2s, transform 0.15s;
  cursor: pointer;
}
.btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }

.btn-ghost {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-body);
  font-size: 14px;
  letter-spacing: 0.02em;
  text-decoration: none;
  padding: 14px 32px;
  color: var(--ink-secondary);
  border: 1px solid var(--void-border);
  border-radius: 8px;
  transition: color 0.2s, border-color 0.2s;
}
.btn-ghost:hover { color: var(--ink-primary); border-color: var(--gold-border); }
```

---

## 5. AI SYSTEM PROMPT (MASTER)

Use this as the `system` message in every OpenRouter API call.
Replace `{{TARGET_MODEL}}` dynamically from the user's model selection in the UI.

```
You are PromptVault's AI Evaluator — a senior prompt engineer with deep expertise 
in crafting high-performance prompts for large language models including Gemini, 
Claude, GPT-4o, and Llama variants.

Your job is to receive a raw AI prompt submitted by a user and return a structured 
evaluation JSON. You do NOT chat. You do NOT add preamble. You return ONLY valid JSON.

Evaluate the prompt across these dimensions:

1. clarity (0-100): Is the instruction unambiguous and specific?
2. model_fit (0-100): Is it well-suited to the stated target model?
3. structure (0-100): Does it have proper context, instruction, and output format?
4. prompt_type: one of ["system", "user", "chain", "meta", "tool-call", "zero-shot", "few-shot"]
5. recommended_models: array of 1-3 model names this prompt performs best on
6. weaknesses: array of 2-3 short strings identifying what's missing or weak
7. improved_prompt: a rewritten version of the prompt that scores higher across all dimensions
8. score_overall: weighted average score (clarity 40%, model_fit 30%, structure 30%)
9. one_line_verdict: a single sentence summarizing the prompt's quality and purpose

Return format — strictly this JSON shape, nothing else, no markdown, no backticks:
{
  "clarity": 0,
  "model_fit": 0,
  "structure": 0,
  "prompt_type": "",
  "recommended_models": [],
  "weaknesses": [],
  "improved_prompt": "",
  "score_overall": 0,
  "one_line_verdict": ""
}

Target model for this session: {{TARGET_MODEL}}
```

### OpenRouter API call (lib/openrouter.ts)

```typescript
// lib/openrouter.ts
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

export async function evaluatePrompt(rawPrompt: string, targetModel: string) {
  const systemPrompt = `You are PromptVault's AI Evaluator...` // paste full system prompt above

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://promptvault.vercel.app',
      'X-Title': 'PromptVault',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-lite',  // free tier
      messages: [
        { role: 'system', content: systemPrompt.replace('{{TARGET_MODEL}}', targetModel) },
        { role: 'user', content: rawPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })
  })

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content || ''

  try {
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    throw new Error('AI evaluation failed to return valid JSON')
  }
}
```

---

## 6. LANDING PAGE COPY

### Hero Section

```
EYEBROW (small caps, gold):
DECENTRALIZED · IMMUTABLE · ON-CHAIN

HEADLINE (Teko, large):
Your Prompts.
Stored Forever.

SUBHEADLINE (Ubuntu, body):
PromptVault is the first decentralized prompt registry built on Sui.
Store, discover, and fork AI prompts as Walrus blobs — immutable,
citable, and owned by no one but the chain.

PRIMARY CTA (gold button):
→ Publish Your First Prompt

SECONDARY CTA (ghost button):
Explore the Vault

TRUST BAR (below CTAs, small mono):
Powered by  [Walrus]  ·  [Tatum RPC]  ·  [Sui Mainnet]

STATS ROW:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Prompts     │  │  Forks       │  │  Models      │
│  Stored      │  │  On-Chain    │  │  Supported   │
│  (live count)│  │  (live count)│  │      4       │
└──────────────┘  └──────────────┘  └──────────────┘

SCROLL INDICATOR:
↓  What lives in the vault?
```

### Features Section Copy

```
SECTION LABEL: HOW IT WORKS

FEATURE 1 — STORE
Title: Every Prompt, a Walrus Blob
Body: Submit your AI prompt and it gets stored as a decentralized blob 
on Walrus. Immutable. Permanent. The blob ID is written to Sui mainnet 
as proof of existence. No platform can delete it.

FEATURE 2 — EVALUATE  
Title: AI Scores Before You Ship
Body: Before storing, your prompt runs through PromptVault's AI Evaluator. 
It scores clarity, structure, and model-fit — then suggests an improved 
version. The evaluation itself gets stored on-chain alongside your prompt.

FEATURE 3 — FORK
Title: Build on What Exists
Body: Every prompt in the vault is forkable. Modify it, improve it, 
publish the new version. The fork links back to the original blob ID 
on-chain. An immutable provenance chain of AI intelligence.
```

### Footer CTA Copy

```
EYEBROW: READY TO CONTRIBUTE?
HEADLINE: The vault is open.
SUBLINE: Every prompt you store makes the registry smarter.
CTA: → Publish to the Vault
```

---

## 7. HERO VIDEO — GROK IMAGINE PROMPTS

Generate these separately in Grok Imagine. Save outputs to:
- `public/videos/hero-bg-video-desktop.mp4`
- `public/videos/hero-bg-video-mobile.mp4`

### Desktop Prompt (16:9 landscape)

```
Cinematic looping background video, 16:9 landscape format, 10-15 seconds 
seamless loop. A cosmic vault floating in deep space — ancient stone archway 
with glowing golden runes, digital prompt text streams flowing like liquid gold 
through the air and dissolving into glowing orbs that drift into the vault 
opening. Background: deep obsidian void with slow rotating star clusters. 
Subtle solar flare pulses every 3 seconds from behind the vault. 
Color palette strictly gold (#D4A017), amber (#8B6914), and near-black (#0A0A0B). 
No people. No text overlays. Photorealistic with slight ethereal glow. 
Camera: slow dolly zoom into vault entrance, seamless loop. 
Mood: sacred, intelligent, ancient-meets-protocol.
```

### Mobile Prompt (9:16 portrait)

```
Cinematic looping background video, 9:16 portrait format, 10-15 seconds 
seamless loop. Vertical composition: top half shows deep cosmic void with 
slow drifting golden particle constellations forming prompt symbols and 
code brackets. Bottom half: a glowing golden vault door set in obsidian stone, 
ancient runes pulsing softly. Digital text fragments — prompts, brackets, 
quotation marks — float upward and dissolve into light. 
Color palette: obsidian black (#0A0A0B), antique gold (#D4A017), amber (#8B6914). 
No faces, no text overlays. Seamless loop. 
Mood: arcane intelligence, sacred storage, Leo solar power. 
Slight film grain overlay for texture.
```

---

## 8. VIDEO INTEGRATION CODE

### HeroVideo.tsx

```tsx
// components/hero/HeroVideo.tsx
'use client'

export function HeroVideo() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      overflow: 'hidden',
    }}>
      {/* Desktop */}
      <video
        className="hero-video-desktop"
        autoPlay
        muted
        loop
        playsInline
        src="/videos/hero-bg-video-desktop.mp4"
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          opacity: 0.35,
        }}
      />
      {/* Mobile */}
      <video
        className="hero-video-mobile"
        autoPlay
        muted
        loop
        playsInline
        src="/videos/hero-bg-video-mobile.mp4"
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          opacity: 0.35,
          display: 'none',
        }}
      />
      {/* Overlay gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(
          to bottom,
          rgba(10,10,11,0.3) 0%,
          rgba(10,10,11,0.1) 40%,
          rgba(10,10,11,0.88) 100%
        )`,
      }} />
    </div>
  )
}
```

### CSS for video switching (in globals.css)

```css
@media (max-width: 768px) {
  .hero-video-desktop { display: none !important; }
  .hero-video-mobile  { display: block !important; }
}
```

### HeroSection.tsx

```tsx
// components/hero/HeroSection.tsx
import { HeroVideo } from './HeroVideo'

export function HeroSection() {
  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '0 clamp(24px, 6vw, 80px)',
      overflow: 'hidden',
    }}>
      <HeroVideo />

      {/* Content layer */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '820px' }}>
        {/* Eyebrow */}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          marginBottom: '24px',
        }}>
          Decentralized · Immutable · On-Chain
        </p>

        {/* Headline */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(64px, 10vw, 140px)',
          fontWeight: 700,
          letterSpacing: '0.01em',
          lineHeight: 1.0,
          color: 'var(--ink-primary)',
          marginBottom: '28px',
        }}>
          Your Prompts.<br />
          <span style={{ color: 'var(--gold)' }}>Stored Forever.</span>
        </h1>

        {/* Subheadline */}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(15px, 2vw, 18px)',
          fontWeight: 300,
          lineHeight: 1.7,
          color: 'var(--ink-secondary)',
          maxWidth: '600px',
          margin: '0 auto 40px',
        }}>
          The first decentralized prompt registry built on Sui.
          Store, discover, and fork AI prompts as Walrus blobs —
          immutable, citable, and owned by no one but the chain.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/submit" className="btn-primary">→ Publish Your First Prompt</a>
          <a href="/vault" className="btn-ghost">Explore the Vault</a>
        </div>

        {/* Trust bar */}
        <p style={{
          marginTop: '48px',
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          letterSpacing: '0.08em',
          color: 'var(--ink-muted)',
        }}>
          Powered by{' '}
          <span style={{ color: 'var(--gold)' }}>Walrus</span> ·{' '}
          <span style={{ color: 'var(--gold)' }}>Tatum RPC</span> ·{' '}
          <span style={{ color: 'var(--gold)' }}>Sui Mainnet</span>
        </p>
      </div>
    </section>
  )
}
```

---

## 9. ENVIRONMENT VARIABLES

```bash
# .env.local

# Tatum — get free key at dashboard.tatum.io
TATUM_API_KEY=your_tatum_api_key_here

# Tatum Sui RPC Endpoints
NEXT_PUBLIC_SUI_MAINNET_RPC=https://sui-mainnet.gateway.tatum.io
NEXT_PUBLIC_SUI_TESTNET_RPC=https://sui-testnet.gateway.tatum.io

# OpenRouter — get free key at openrouter.ai
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Walrus — publisher and aggregator endpoints
NEXT_PUBLIC_WALRUS_PUBLISHER=https://publisher.walrus-testnet.walrus.space
NEXT_PUBLIC_WALRUS_AGGREGATOR=https://aggregator.walrus-testnet.walrus.space

# App
NEXT_PUBLIC_APP_URL=https://promptvault.vercel.app
```

---

## 10. CORE WALRUS + TATUM LOGIC

### lib/walrus.ts — Store and retrieve blobs

```typescript
// lib/walrus.ts

const PUBLISHER  = process.env.NEXT_PUBLIC_WALRUS_PUBLISHER!
const AGGREGATOR = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR!

export async function storeBlob(data: string): Promise<string> {
  // Store a string as a Walrus blob, returns blobId
  const response = await fetch(`${PUBLISHER}/v1/blobs`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: new TextEncoder().encode(data),
  })

  if (!response.ok) throw new Error(`Walrus store failed: ${response.statusText}`)

  const result = await response.json()

  // Response contains either newlyCreated or alreadyCertified
  const blobId =
    result.newlyCreated?.blobObject?.blobId ||
    result.alreadyCertified?.blobId

  if (!blobId) throw new Error('No blobId returned from Walrus')
  return blobId
}

export async function retrieveBlob(blobId: string): Promise<string> {
  const response = await fetch(`${AGGREGATOR}/v1/blobs/${blobId}`)
  if (!response.ok) throw new Error(`Walrus retrieve failed: ${response.statusText}`)
  const buffer = await response.arrayBuffer()
  return new TextDecoder().decode(buffer)
}
```

### lib/tatum.ts — Sui RPC via Tatum

```typescript
// lib/tatum.ts

const RPC = process.env.NEXT_PUBLIC_SUI_MAINNET_RPC!
const API_KEY = process.env.TATUM_API_KEY!

export async function suiRpcCall(method: string, params: unknown[]) {
  const response = await fetch(RPC, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  })

  const data = await response.json()
  if (data.error) throw new Error(`Sui RPC error: ${data.error.message}`)
  return data.result
}

// Get latest prompts stored on-chain (from your deployed contract or indexer)
export async function fetchPromptRecords(packageId: string) {
  return suiRpcCall('suix_getOwnedObjects', [
    packageId,
    { filter: { StructType: `${packageId}::promptvault::PromptRecord` } },
  ])
}
```

### app/api/store/route.ts — Full store endpoint

```typescript
// app/api/store/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { storeBlob } from '@/lib/walrus'
import { evaluatePrompt } from '@/lib/openrouter'

export async function POST(req: NextRequest) {
  try {
    const { title, prompt, tags, targetModel } = await req.json()

    if (!prompt || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Evaluate prompt with AI
    const evaluation = await evaluatePrompt(prompt, targetModel || 'gemini-2.5-flash')

    // 2. Store original prompt as Walrus blob
    const promptPayload = JSON.stringify({ title, prompt, tags, targetModel, createdAt: Date.now() })
    const promptBlobId = await storeBlob(promptPayload)

    // 3. Store AI evaluation as second Walrus blob
    const evalPayload = JSON.stringify({ ...evaluation, promptBlobId, evaluatedAt: Date.now() })
    const evalBlobId = await storeBlob(evalPayload)

    // 4. Return blob IDs (frontend writes to Sui chain after receiving these)
    return NextResponse.json({
      success: true,
      promptBlobId,
      evalBlobId,
      evaluation,
    })

  } catch (error) {
    console.error('Store error:', error)
    return NextResponse.json({ error: 'Failed to store prompt' }, { status: 500 })
  }
}
```

---

## 11. JUDGING CRITERIA CHECKLIST

| Criteria | Weight | PromptVault implementation | Status |
|---|---|---|---|
| Walrus + Tatum Integration | 30% | Prompts + evaluations both stored as Walrus blobs. Every read/write goes through Tatum RPC | ✅ Core |
| Technical Quality | 30% | Next.js 15, typed TS, clean API routes, Sui integration | ✅ Build |
| Creativity | 20% | AI meta-prompt scoring stored on-chain — nobody has done this | ✅ Unique |
| Presentation | 20% | 2-min demo: store a prompt → show blob ID → verify on SuiScan | ✅ Plan |
| **Best Walrus Integration bonus** | +$200 | Prompts are Walrus blobs by design, not optional | ✅ Target |
| **Best Use of Tatum Tools bonus** | +$200 | All Sui RPC via Tatum gateway | ✅ Target |

**Potential max: $600 (1st) + $200 + $200 = $1,000**

---

## 12. SUBMISSION CHECKLIST

```
[ ] Tatum API key obtained — dashboard.tatum.io
[ ] OpenRouter API key obtained — openrouter.ai (free)
[ ] .env.local configured with all variables
[ ] Walrus blob upload working (test with a simple string)
[ ] Tatum Sui RPC responding (test suix_getLatestCheckpointSequenceNumber)
[ ] AI evaluator returning valid JSON
[ ] Submit form: stores prompt → gets blob ID → shows evaluation
[ ] Vault feed: lists stored prompts with blob IDs
[ ] Single prompt page: retrieves blob, shows evaluation, fork button
[ ] Fork mechanic: links back to original blobId
[ ] Hero video generated and placed in public/videos/
[ ] Deployed to Vercel with all env vars set
[ ] Demo URL publicly accessible
[ ] GitHub repo with clean README
[ ] 2-3 min demo video recorded and uploaded
[ ] X/LinkedIn post tagging @Tatum_io @WalrusFoundation @SuiNetwork
[ ] Submission form filled — deadline June 6, 17:00 UTC
```

---

> Built by **Mojeeb Titilayo** · BlindspotLab · blindspotlab.xyz  
> Stack: Next.js 16+ · TypeScript · Walrus · Tatum Sui RPC · OpenRouter (Gemini 2.5 Flash Lite)  
> Hackathon: Tatum × Build on Sui with Walrus · June 6, 2026