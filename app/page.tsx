'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }

      const { data: member, error } = await supabase
        .from('members')
        .select('family_id')
        .eq('uid', user.id)
        .maybeSingle();

      if (error) { console.error(error); router.replace('/login'); return; }
      if (!member?.family_id) { router.replace('/onboarding'); return; }

      router.replace('/app');
    })();
  }, [router]);

  return null;
}
