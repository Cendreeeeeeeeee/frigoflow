'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AppPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // Vérifie si l’utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      // Vérifie si l’utilisateur a une famille associée
      const { data: member, error } = await supabase
        .from('members')
        .select('family_id')
        .eq('uid', user.id)
        .maybeSingle();

      if (error) {
        console.error(error);
        router.replace('/login');
        return;
      }

      if (!member?.family_id) {
        router.replace('/onboarding');
        return;
      }

      // Si tout est OK, envoie l’utilisateur vers la vraie app
      router.replace('/app');
    })();
  }, [router]);

  return <p>Chargement...</p>;
}
