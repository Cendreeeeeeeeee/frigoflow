'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const supabase = createClient();

      // 1) session/user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }

      // 2) membre de famille ?
      const { data: member, error } = await supabase
        .from('members')
        .select('family_id')
        .eq('uid', user.id)
        .maybeSingle();

      if (error) {
        console.error(error);
        router.replace('/login'); // fallback safe
        return;
      }

      if (!member?.family_id) {
        router.replace('/onboarding');
        return;
      }

      // 3) ok → app
      router.replace('/app');
    })();
  }, [router]);

  return null; // simple redirector
}
