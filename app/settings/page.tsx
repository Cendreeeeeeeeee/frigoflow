"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Copy, UserPlus, Users, ArrowLeft, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter()
  const [familyInfo, setFamilyInfo] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [inviteLink, setInviteLink] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadFamilyInfo()
  }, [])

  const loadFamilyInfo = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Get user's family info
      const { data: member } = await supabase.from("members").select("family_id").eq("id", user.id).single()

      if (member) {
        // Get family details
        const { data: family } = await supabase.from("families").select("name").eq("id", member.family_id).single()

        setFamilyInfo(family)

        // Get family members
        const { data: familyMembers } = await supabase
          .from("members")
          .select("display_name, created_at")
          .eq("family_id", member.family_id)

        setMembers(familyMembers || [])
      }
    }
  }

  const handleGenerateInvite = async () => {
    if (!familyInfo) return

    setLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: member } = await supabase.from("members").select("family_id").eq("id", user.id).single()

      if (member) {
        const { data: inviteCode, error } = await supabase.rpc("create_invite", {
          family_id: member.family_id,
        })

        if (!error && inviteCode) {
          const link = `${window.location.origin}/onboarding?invite=${inviteCode}`
          setInviteLink(link)
        }
      }
    } catch (error) {
      console.error("Erreur génération invitation:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-md mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">Paramètres</h1>
        </div>

        <div className="space-y-6">
          {familyInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {familyInfo.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {members.length} membre{members.length > 1 ? "s" : ""}
                </p>
                <div className="space-y-2">
                  {members.map((member, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{member.display_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(member.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Inviter un membre
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleGenerateInvite}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? "Génération..." : "Générer un lien d'invitation"}
              </Button>

              {inviteLink && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Partagez ce lien :</p>
                  <div className="flex gap-2">
                    <Input value={inviteLink} readOnly className="text-xs" />
                    <Button variant="outline" size="sm" onClick={copyInviteLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Se déconnecter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
