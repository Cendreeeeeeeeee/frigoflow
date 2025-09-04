import { createClient } from "./supabase"

export async function createInvite(familyId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("create_invite", {
    family_id: familyId,
  })

  if (error) throw error
  return data
}

export async function acceptInvite(inviteCode: string, displayName: string) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("accept_invite", {
    inv_code: inviteCode,
    display_name: displayName,
  })

  if (error) throw error
  return data
}
