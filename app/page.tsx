import { HeroSection } from '@/components/hero/HeroSection';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <>
      <HeroSection />

      {/* How it Works / Features — from build.md copy */}
      <section className="bg-dot-grid py-[var(--section-pad)] px-6" style={{ position: 'relative', zIndex: 1 }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <div className="text-[11px] tracking-[0.16em] uppercase text-[var(--gold)] mb-3">HOW IT WORKS</div>
            <h2 className="text-5xl md:text-6xl font-semibold tracking-[-0.01em]">Every prompt becomes permanent.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="card p-8">
              <div className="text-[var(--gold)] text-sm tracking-widest mb-2">01 — STORE</div>
              <h3 className="text-2xl mb-3">Every Prompt, a Walrus Blob</h3>
              <p className="text-[var(--ink-secondary)] leading-relaxed">
                Submit your AI prompt and it gets stored as a decentralized blob on Walrus.
                Immutable. Permanent. The blob ID on Walrus is the proof of existence.
                No platform can delete it.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-8">
              <div className="text-[var(--gold)] text-sm tracking-widest mb-2">02 — EVALUATE</div>
              <h3 className="text-2xl mb-3">AI Scores Before You Ship</h3>
              <p className="text-[var(--ink-secondary)] leading-relaxed">
                Before storing, your prompt runs through PromptVault&apos;s AI Evaluator.
                It scores clarity, structure, and model-fit — then suggests an improved version.
                The evaluation itself gets stored as a second Walrus blob alongside your prompt.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-8">
              <div className="text-[var(--gold)] text-sm tracking-widest mb-2">03 — FORK</div>
              <h3 className="text-2xl mb-3">Build on What Exists</h3>
              <p className="text-[var(--ink-secondary)] leading-relaxed">
                Every prompt in the vault is forkable. Modify it, improve it, publish the new version.
                The fork links back to the original blob ID. An immutable provenance chain of AI intelligence.
              </p>
            </div>
          </div>

          {/* Stats row (live-ish) */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {[
              { label: 'Prompts Stored', value: '128' },
              { label: 'Forks On-Chain', value: '47' },
              { label: 'Models Supported', value: '4' },
            ].map((s, i) => (
              <div key={i} className="surface py-6 rounded-xl border border-[var(--void-border)]">
                <div className="text-4xl font-semibold text-[var(--gold)]">{s.value}</div>
                <div className="text-xs tracking-widest text-[var(--ink-muted)] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ready CTA */}
      <section className="py-20 px-6 border-t border-[var(--void-border)]" style={{ backgroundColor: 'rgba(10,10,11,0.05)' }}>
        <div className="max-w-[720px] mx-auto text-center">
          <div className="text-[11px] tracking-[0.16em] uppercase text-[var(--gold)] mb-3">READY TO CONTRIBUTE?</div>
          <h2 className="text-5xl font-semibold mb-3">The vault is open.</h2>
          <p className="text-lg text-[var(--ink-secondary)] mb-8">Every prompt you store makes the registry smarter.</p>
          <Link href="/submit" className="btn-primary text-base">→ Publish to the Vault</Link>
        </div>
      </section>
    </>
  );
}
