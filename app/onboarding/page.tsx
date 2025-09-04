"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteCode = searchParams.get("invite")

  const [displayName, setDisplayName] = useState("")
  const [familyName, setFamilyName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      // Check if user is already a member
      const { data: member } = await supabase.from("members").select("family_id").eq("id", user.id).single()

      if (member) {
        router.push("/app")
      }
    }

    checkAuth()
  }, [router])

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim() || !inviteCode) return

    setLoading(true)
    setError("")

    try {
      const supabase = createClient()

      const { error } = await supabase.rpc("accept_invite", {
        inv_code: inviteCode,
        display_name: displayName.trim(),
      })

      if (error) throw error
      router.push("/app")
    } catch (err) {
      setError("Code d'invitation invalide ou déjà utilisé")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim() || !familyName.trim()) return

    setLoading(true)
    setError("")

    try {
      const supabase = createClient()

      const { error } = await supabase.rpc("create_family_and_self", {
        family_name: familyName.trim(),
        display_name: displayName.trim(),
      })

      if (error) throw error
      router.push("/app")
    } catch (err) {
      setError("Erreur lors de la création de la famille")
    } finally {
      setLoading(false)
    }
  }

  if (inviteCode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <UserPlus className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <CardTitle>Rejoindre une famille</CardTitle>
            <p className="text-muted-foreground">Vous avez été invité à rejoindre une famille</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAcceptInvite} className="space-y-4">
              <div>
                <Input
                  placeholder="Votre prénom"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? "Rejoindre..." : "Rejoindre la famille"}
              </Button>
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Users className="h-12 w-12 text-green-600 mx-auto mb-2" />
          <CardTitle>Créer votre famille</CardTitle>
          <p className="text-muted-foreground">Commencez à gérer vos courses en famille</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateFamily} className="space-y-4">
            <div>
              <Input
                placeholder="Nom de famille (ex: Famille Martin)"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                placeholder="Votre prénom"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? "Création..." : "Créer la famille"}
            </Button>
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
