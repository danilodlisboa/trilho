import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/login" className="text-indigo-400 hover:underline text-sm flex items-center gap-1">
          &larr; Back to Login
        </Link>
        
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Privacy Policy (LGPD Compliance)</h1>
          <p className="text-slate-400 text-sm mt-1">Last updated: August 11, 2026</p>
        </div>

        <section className="space-y-6 text-slate-300">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3">
            <h2 className="text-xl font-semibold text-white">1. Data Controller</h2>
            <p className="text-sm leading-relaxed">
              Trilho is the Data Controller responsible for processing your personal data under the Brazilian General Data Protection Law (LGPD - Law No. 13.709/2018).
              For any privacy inquiries or data subject requests, contact our DPO channel at <code className="text-indigo-300 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">privacy@trilho.online</code>.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3">
            <h2 className="text-xl font-semibold text-white">2. Personal Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
              <li><strong>Account Registration Data:</strong> Full Name, Email Address, and encrypted Password Hash (bcryptjs).</li>
              <li><strong>Avatar Preferences:</strong> Avatar URL and seed generated via DiceBear SVG API.</li>
              <li><strong>Workspace Content:</strong> Boards, columns, cards, and custom field definitions created or assigned to your account.</li>
            </ul>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3">
            <h2 className="text-xl font-semibold text-white">3. Legal Bases for Processing</h2>
            <p className="text-sm leading-relaxed">
              We process personal data based on <strong>LGPD Art. 7, I (Consent)</strong> upon user registration and <strong>LGPD Art. 7, V (Execution of Contract)</strong> to provide Kanban project management features and services.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3">
            <h2 className="text-xl font-semibold text-white">4. Third-Party Data Processors</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
              <li><strong>DiceBear API:</strong> Renders SVG user avatars (<code className="text-indigo-300 font-mono">https://api.dicebear.com</code>).</li>
              <li><strong>Resend API / SMTP:</strong> Transmits transactional emails for account verification and password recovery.</li>
            </ul>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3">
            <h2 className="text-xl font-semibold text-white">5. Your Rights as a Data Subject (LGPD Art. 18)</h2>
            <p className="text-sm leading-relaxed mb-2">
              Under LGPD Art. 18, you have full self-service rights directly accessible in your Account Settings:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-300">
              <li><strong>Confirmation & Access (Art. 18, I & II):</strong> View account and workspace data anytime.</li>
              <li><strong>Correction & Rectification (Art. 18, III):</strong> Update name and avatar in Account Settings.</li>
              <li><strong>Data Portability (Art. 18, V):</strong> Export all personal data in structured JSON format.</li>
              <li><strong>Account Erasure (Art. 18, VI):</strong> Permanently delete your account and personal data ("Right to be Forgotten").</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
