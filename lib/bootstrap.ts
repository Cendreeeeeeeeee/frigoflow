import { createClient } from "./supabase"

export async function ensureFamilyAndMembership() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { needsAuth: true }

  const { data: member } = await supabase
    .from("members")
    .select("id, family_id, display_name")
    .eq("user_id", user.id)
    .single()

  if (!member) {
    return { needsOnboarding: true }
  }

  return { member, familyId: member.family_id }
}
