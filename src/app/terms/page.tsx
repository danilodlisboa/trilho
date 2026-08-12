import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/login" className="text-indigo-400 hover:underline text-sm flex items-center gap-1">
          &larr; Back to Login
        </Link>
        
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Terms of Service</h1>
          <p className="text-slate-400 text-sm mt-1">Last updated: August 11, 2026</p>
        </div>

        <section className="space-y-6 text-slate-300">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3">
            <h2 className="text-xl font-semibold text-white">1. Service Usage & Account Security</h2>
            <p className="text-sm leading-relaxed">
              Trilho provides a Kanban project management platform. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3">
            <h2 className="text-xl font-semibold text-white">2. Acceptable Conduct</h2>
            <p className="text-sm leading-relaxed">
              You agree not to use Trilho for illegal activities, transmitting malicious code, attempting unauthorized access to other workspaces, or violating third-party privacy rights.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3">
            <h2 className="text-xl font-semibold text-white">3. Data Ownership & Governance</h2>
            <p className="text-sm leading-relaxed">
              You retain all ownership rights to the content, boards, and cards you create on Trilho. You may export or request deletion of your data at any time in accordance with our <Link href="/privacy" className="text-indigo-400 underline">Privacy Policy</Link>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
