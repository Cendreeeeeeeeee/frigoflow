'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function HomeRedirect() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }
      const { data: member } = await supabase
        .from('members')
        .select('family_id')
        .eq('uid', user.id)
        .maybeSingle();
      if (!member?.family_id) { router.replace('/onboarding'); return; }
      router.replace('/app');
    })();
  }, [router]);
  return null;
}
