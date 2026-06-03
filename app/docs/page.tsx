import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export const metadata = {
  title: "Docs",
  description: "Documentation for PromptVault — how it works, technical details, and how to contribute.",
};

export default function DocsPage() {
  return (
    <div className="bg-dot-grid min-h-[calc(100vh-var(--nav-height))]">
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
              evaluated by AI, and anchored on-chain with full provenance for forks.
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
              <div className="font-semibold text-[var(--gold)] mb-2">4. On-Chain Record</div>
              <p className="text-[var(--ink-secondary)]">
                Optionally, a Sui transaction creates a PromptRecord that points to the two blob IDs. 
                Forks link back to the original on-chain.
              </p>
            </div>
          </div>
        </section>

        {/* For Users */}
        <section className="mb-14">
          <h2 className="text-3xl font-semibold mb-4">For Users</h2>
          <ul className="space-y-3 text-[var(--ink-secondary)]">
            <li>• <strong>Submit a prompt</strong> — Go to /submit and fill out the form.</li>
            <li>• <strong>Browse the Vault</strong> — Visit /vault to explore all published prompts.</li>
            <li>• <strong>View details</strong> — Click any prompt card to see the full text, evaluation scores, and improved version.</li>
            <li>• <strong>Fork</strong> — Use the "Fork this prompt" button on any detail page. It pre-fills the submit form with the original content and tracks the parent on-chain.</li>
          </ul>
        </section>

        {/* Technical Details */}
        <section className="mb-14">
          <h2 className="text-3xl font-semibold mb-4">Technical Details</h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2">Storage (Walrus Mainnet)</h3>
            <p className="text-[var(--ink-secondary)]">
              We use the official Walrus publisher and aggregator endpoints on mainnet. 
              All blobs are permanent and publicly retrievable via blob ID.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2">On-Chain (Sui Mainnet via Tatum)</h3>
            <p className="text-[var(--ink-secondary)] mb-2">
              All RPC calls go through Tatum&apos;s mainnet gateway. 
              When a package is deployed, real PromptRecord objects and events are created.
            </p>
            <p className="text-sm text-[var(--ink-muted)]">
              Contract source: <code>contracts/promptvault.move</code>
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">AI Evaluator</h3>
            <p className="text-[var(--ink-secondary)]">
              We use OpenRouter with Gemini 2.5 Flash Lite (free tier) as primary, 
              with Llama and Mistral fallbacks. The full system prompt is designed to 
              return structured JSON only.
            </p>
          </div>
        </section>

        {/* Deploying the Contract */}
        <section className="mb-14">
          <h2 className="text-3xl font-semibold mb-4">Deploying the Contract (Mainnet)</h2>
          <div className="card p-6 text-sm">
            <p className="mb-3 text-[var(--ink-secondary)]">
              <strong>Without installing the Sui CLI locally</strong> (recommended for most people):
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-4 text-[var(--ink-secondary)]">
              <li>Use <strong>Gitpod</strong> (easiest): Visit <a href="https://gitpod.io/#https://github.com/mojeebdev/promptvault" target="_blank" className="text-[var(--gold)] underline">gitpod.io/#https://github.com/mojeebdev/promptvault</a> — full VS Code in browser.</li>
              <li>Or use <strong>GitHub Codespaces</strong>: In the repo, click Code → Codespaces → Create.</li>
              <li>In the browser terminal, install Sui CLI once: <code>curl -fLSs https://sui.io/install.sh | sh</code></li>
              <li>Then: <code>cd contracts && sui client publish --gas-budget 100000000</code></li>
            </ul>

            <p className="mb-2">Classic CLI way (if you have it installed):</p>
            <ol className="list-decimal pl-5 space-y-2 text-[var(--ink-secondary)] mb-4">
              <li>Have mainnet SUI in your wallet (no faucet on mainnet)</li>
              <li>
                <code>cd contracts</code><br />
                <code>sui client publish --gas-budget 100000000</code>
              </li>
              <li>Copy the Package ID from the output</li>
            </ol>

            <p className="mb-2">After getting the Package ID:</p>
            <ul className="list-disc pl-5 text-[var(--ink-secondary)]">
              <li>Set <code>NEXT_PUBLIC_PROMPTVAULT_PACKAGE_ID=0x...</code> in your <code>.env.local</code></li>
              <li>Restart the app</li>
            </ul>

            <p className="mt-4 text-[var(--ink-muted)]">
              See <code>scripts/publish-contract.ts</code> for a programmatic publish option using the SDK (after you have the compiled bytecode from a build).
            </p>
            <p className="mt-2 text-[var(--ink-muted)]">
              Once deployed, users can publish real on-chain records instead of demo entries.
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
            <p className="mt-4">
              All code is open source. See the GitHub repo for contribution guidelines.
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
