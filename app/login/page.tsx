'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    // URL de redirection pour le lien magique (prod → Vercel, sinon origine courante)
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '');

    // On utilise la route /auth/callback prévue dans ton projet
    const redirectTo = `${base}/auth/callback`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Connexion</h1>

      {sent ? (
        <p>Un lien magique vient d’être envoyé à <b>{email}</b>. Vérifie ta boîte mail ✉️</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full border rounded p-2"
            type="email"
            placeholder="email@exemple.ch"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            disabled={loading}
            className="w-full rounded bg-black text-white p-2 disabled:opacity-50"
          >
            {loading ? 'Envoi...' : 'Recevoir le lien'}
          </button>
        </form>
      )}
    </main>
  );
}
