import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export const metadata = {
  title: "Docs",
  description: "Documentation for PromptVault — how it works, technical details, and how to contribute.",
};

export default function DocsPage() {
  return (
    <div className="bg-dot-grid min-h-[calc(100vh-var(--nav-height))]" style={{ position: 'relative', zIndex: 1 }}>
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-20 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink-primary)]">
            ← Back to PromptVault
          </Link>
          <div className="mt-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-6xl font-semibold tracking-[-1px] mt-3">Docs</h1>
          <p className="mt-3 text-xl text-[var(--ink-secondary)]">
            Everything you need to know about PromptVault.
          </p>
        </div>

        {/* Overview */}
        <section className="mb-14">
          <h2 className="text-3xl font-semibold mb-4">Overview</h2>
          <div className="prose prose-invert text-[var(--ink-secondary)] max-w-none">
            <p>
              PromptVault is the first decentralized AI prompt registry built on Sui. 
              Users can submit AI prompts that are stored as immutable Walrus blobs, 
              evaluated by AI (Gemini via OpenRouter), and indexed in Firestore with wallet author provenance.
            </p>
            <p>
              Every prompt is paired with an AI-generated evaluation (clarity, structure, model-fit, improved version) 
              that is also stored permanently on Walrus.
            </p>
          </div>
        </section>

        {/* How it Works */}
        <section className="mb-14">
          <h2 className="text-3xl font-semibold mb-4">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="font-semibold text-[var(--gold)] mb-2">1. Submit</div>
              <p className="text-[var(--ink-secondary)]">
                Enter a title, your prompt, tags, and the target model. 
                The form sends everything to our backend.
              </p>
            </div>
            <div className="card p-6">
              <div className="font-semibold text-[var(--gold)] mb-2">2. AI Evaluation</div>
              <p className="text-[var(--ink-secondary)]">
                Our evaluator (powered by Gemini 2.5 Flash Lite via OpenRouter) scores your prompt 
                across clarity, model fit, and structure. It also returns an improved version.
              </p>
            </div>
            <div className="card p-6">
              <div className="font-semibold text-[var(--gold)] mb-2">3. Walrus Storage</div>
              <p className="text-[var(--ink-secondary)]">
                Both your original prompt and the full AI evaluation are stored as separate 
                immutable blobs on Walrus mainnet.
              </p>
            </div>
            <div className="card p-6">
              <div className="font-semibold text-[var(--gold)] mb-2">4. Metadata Index (Firestore)</div>
              <p className="text-[var(--ink-secondary)]">
                Title, blob IDs, tags, target model, author wallet address, and fork parent are saved to Firebase Firestore 
                for fast public vault queries and provenance.
              </p>
            </div>
          </div>
        </section>

        {/* For Users */}
        <section className="mb-14">
          <h2 className="text-3xl font-semibold mb-4">For Users</h2>
          <ul className="space-y-3 text-[var(--ink-secondary)]">
            <li>• <strong>Submit a prompt</strong> — Go to /submit (wallet connection required via @mysten/dapp-kit). Fill title, prompt, tags, and target model.</li>
            <li>• <strong>Browse the Vault</strong> — Visit /vault to explore all published prompts.</li>
            <li>• <strong>View details</strong> — Click any prompt card to see the full text, evaluation scores, and improved version.</li>
            <li>• <strong>Fork</strong> — Use the "Fork this prompt" button on any detail page. It pre-fills the submit form with the original content and tracks the parent via Firestore metadata.</li>
          </ul>
        </section>

        {/* Technical Details */}
        <section className="mb-14">
          <h2 className="text-3xl font-semibold mb-4">Technical Details</h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2">Storage (Walrus Mainnet + Firestore fallback)</h3>
            <p className="text-[var(--ink-secondary)]">
              We attempt to store prompts + AI evaluations as immutable blobs on Walrus mainnet via the HTTP publisher API.
              We use the only available zero-cost option: community-operated publishers (Staketab primary + others) with very aggressive
              retry cycling (12+ attempts), outer retries, and client-side auto-retry. Reads use multiple public aggregators with fallbacks.
            </p>
            <p className="text-[var(--ink-secondary)] mt-2">
              When community publishers are unreachable (a known, documented reality on mainnet), the submit still succeeds:
              the full prompt text and full evaluation are saved to Firestore as a reliable fallback. The vault and detail pages
              show the content from metadata with a clear "metadata fallback" indicator. Real Walrus blobs are attached whenever the
              write succeeds.
            </p>
            <p className="text-[var(--ink-secondary)] mt-2 text-xs">
              <strong>Official reality:</strong> There are no public unauthenticated publishers on mainnet (see operators.json, public-aggregators-and-publishers, and the Mainnet Publisher Production Guide).
              Running our own would require funding real SUI/WAL + hosting. This hybrid (best-effort Walrus + Firestore safety net) is the pragmatic zero-cost way to deliver a working public demo while still showcasing real Walrus integration.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2">Wallet &amp; RPC (Sui Mainnet via Tatum)</h3>
            <p className="text-[var(--ink-secondary)] mb-2">
              Wallet connection uses @mysten/dapp-kit with Sui mainnet only (via Tatum&apos;s mainnet gateway). 
              The connected address is saved as the <code>author</code> in Firestore metadata. 
              No smart contract or on-chain PromptRecord is used — storage is purely Walrus + Firestore indexing.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">AI Evaluator</h3>
            <p className="text-[var(--ink-secondary)]">
              We use OpenRouter with Google Gemini 2.5 Flash Lite (free tier) as primary, 
              with current free fallbacks (Gemma 4, Llama 3.3, Nemotron, DeepSeek). 
              The master system prompt forces structured JSON output (clarity, model_fit, structure, improved_prompt, etc.).
              The store route includes retries, timeouts, and a default evaluation fallback so submits succeed even if OpenRouter is temporarily unavailable.
            </p>
          </div>
        </section>

        {/* Wallet Connection */}
        <section className="mb-14">
          <h2 className="text-3xl font-semibold mb-4">Wallet Connection (Sui Mainnet)</h2>
          <div className="card p-6 text-sm">
            <p className="mb-3 text-[var(--ink-secondary)]">
              We use <strong>@mysten/dapp-kit</strong> (official Mysten Labs React SDK for Sui) for wallet connections.
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-4 text-[var(--ink-secondary)]">
              <li>Connect wallet button is in the Navbar (top right on desktop; inside mobile hamburger menu).</li>
              <li><strong>Required to submit/publish</strong> a prompt — the connected wallet address is saved as <code>author</code> in Firestore.</li>
              <li><strong>Not required to browse</strong> the vault feed (public reads only; writes are authenticated).</li>
              <li>Restricted to <strong>Sui Mainnet only</strong> (chainId: <code>sui:mainnet</code>).</li>
              <li>Supports Sui Wallet, Suiet, Slush, and any Sui-compatible wallet (via the kit's auto-detection).</li>
            </ul>

            <p className="mb-2"><strong>Implementation notes:</strong></p>
            <pre className="bg-[var(--void-02)] p-3 rounded text-xs overflow-auto mb-3">
{`// In submit page / form:
const account = useCurrentAccount();
if (!account) {
  // show "Connect your wallet to submit"
}

// Pass to form:
<SubmitForm author={account?.address} ... />

// In /api/store:
body: { ..., author }

// Saved to Firestore as:
{ ..., author: '0x1234...' }`}
            </pre>

            <p className="mt-2 text-[var(--ink-muted)]">
              Providers are set up in <code>app/providers.tsx</code> (QueryClient + SuiClientProvider + WalletProvider with mainnet only).
            </p>

            <p className="mt-3 text-[var(--ink-muted)] text-xs">
              <strong>Local development note:</strong> On <code>http://localhost:3000</code> (or any non-HTTPS origin), Sui wallets (Sui Wallet, etc.) will display a "Your connection is not secure" warning before allowing the connection. This is standard security behavior by the wallet extension to protect users. It is safe to approve during local testing. The warning does <strong>not</strong> appear on the production HTTPS site.
            </p>

            <p className="mt-2 text-[var(--ink-muted)] text-xs">
              <strong>Walrus reachability errors (502, DNS, etc.):</strong> Per official docs there are no public unauth mainnet publishers (https://docs.wal.app/operators.json + public-aggregators-and-publishers). We rely on community endpoints (Staketab primary). The code does 5 retries + endpoint fallbacks for both store and retrieve. On transient failure the API returns a short "Temporary issue reaching Walrus storage. Please try again in a few minutes." message. This is expected behavior for a demo using volunteer infrastructure.
            </p>
          </div>
        </section>

        {/* Development */}
        <section className="mb-14">
          <h2 className="text-3xl font-semibold mb-4">Development</h2>
          <div className="text-[var(--ink-secondary)]">
            <p className="mb-2">Run locally:</p>
            <pre className="bg-[var(--void-02)] p-4 rounded text-sm overflow-auto">
              cp .env.local.example .env.local<br />
              npm install<br />
              npm run dev
            </pre>
            <p className="text-xs mt-1 text-[var(--ink-muted)]">
              For local wallet testing without the "not secure" warning, try <code>next dev --experimental-https</code> (self-signed cert) or a HTTPS tunnel (ngrok, cloudflared, etc.).
            </p>
            <p className="mt-2">
              Wallet: <code>npm install @mysten/dapp-kit @tanstack/react-query</code> (already done).
            </p>
            <p className="mt-2">
              Dark theme only (Leo × Saturn palette). CSS custom properties defined in <code>globals.css</code> under <code>:root</code>.
            </p>
            <p className="mt-4">
              All code is open source. See the GitHub repo for contribution guidelines.
            </p>
          </div>
        </section>

        {/* Analytics */}
        <section className="mb-14">
          <h2 className="text-3xl font-semibold mb-4">Analytics</h2>
          <div className="text-[var(--ink-secondary)]">
            <p className="mb-2">Two analytics systems are active:</p>
            <ul className="list-disc pl-5 mb-3">
              <li><strong>Vercel Analytics</strong>: Automatic when deployed to Vercel (added via <code>@vercel/analytics</code> in <code>app/layout.tsx</code>).</li>
              <li><strong>Firebase Analytics (Google Analytics 4)</strong>: Enabled via Firebase SDK. Add <code>NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID</code> (your GA4 Measurement ID from Firebase console) to <code>.env.local</code>. See <code>lib/firebase.ts</code> for initialization (uses <code>getAnalytics</code>).</li>
            </ul>
            <p>Both will send data to Google (via Firebase) and Vercel dashboards. Measurement ID is passed via <code>NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID</code> in the Firebase config.</p>
          </div>
        </section>

        {/* Firebase Rules */}
        <section className="mb-14">
          <h2 className="text-3xl font-semibold mb-4">Firebase Firestore Rules</h2>
          <div className="text-[var(--ink-secondary)]">
            <p className="mb-2">Recommended rules (paste into Firebase Console &gt; Firestore &gt; Rules):</p>
            <pre className="bg-[var(--void-02)] p-3 rounded text-xs overflow-auto">
rules_version = '2';
service cloud.firestore {'{'}
  match /databases/{'{'}database{'}'}/documents {'{'}
    match /prompts/{'{'}promptId{'}'} {'{'}
      allow read: if true;   // Public vault feed
      allow write: if true;  // Public submissions. The backend writes from Next.js API routes (no Firebase Auth).
                             // For production add App Check or rate limiting.
    {'}'}
  {'}'}
{'}'}
            </pre>
            <p className="mt-2 text-xs">
              <strong>Important:</strong> Rules with <code>request.auth != null</code> will cause <code>PERMISSION_DENIED</code> errors on server writes (as seen in logs).
              Use the open-write version above so the fallback path works when Walrus publishers are down.
            </p>
            <p className="mt-2 text-xs">
              We have prepared <code>firestore.rules</code>, <code>firestore.indexes.json</code>, <code>firebase.json</code>, and <code>.firebaserc</code> in the repo root.
              Use <code>npm run deploy:firestore</code> (after <code>npx firebase login</code>) to deploy.
            </p>
            <p className="mt-2 text-xs">
              <strong>Post-deploy index step (required for real vault feed):</strong> The main query orders by <code>createdAt</code> descending. If the Vault shows only demo seeds after deploy, create the single-field index:
              <br />Firebase Console → Firestore → Indexes → <strong>Single field indexes</strong> → ensure <code>prompts</code> collection has a descending index on <code>createdAt</code>, or click the "Create index" link shown in logs when loading the feed (it autofills the exact index needed). The index builds in ~1-5 min.
            </p>
          </div>
        </section>

        {/* Links */}
        <section>
          <h2 className="text-3xl font-semibold mb-4">Links</h2>
          <div className="flex flex-wrap gap-4">
            <a href="https://github.com/mojeebdev/promptvault" target="_blank" rel="noopener noreferrer" className="btn-ghost">
              GitHub
            </a>
            <a href="https://x.com/PVonSui" target="_blank" rel="noopener noreferrer" className="btn-ghost">
              X / Twitter (@PVonSui)
            </a>
            <Link href="/" className="btn-ghost">
              Back to App
            </Link>
          </div>
        </section>

        <div className="mt-16 text-center text-xs text-[var(--ink-muted)]">
          PromptVault · Built on Sui Mainnet × Walrus · June 2026
        </div>
      </div>
    </div>
  );
}
