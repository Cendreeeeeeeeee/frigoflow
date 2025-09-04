"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, ScanLine, Store, Percent, Users, Plus, Settings } from "lucide-react"
import { ShoppingListManager } from "@/components/shopping-list-manager"
import { BarcodeScanner } from "@/components/barcode-scanner"
import { StoreMode } from "@/components/store-mode"
import { PromoManager } from "@/components/promo-manager"
import { QuickAddModal } from "@/components/quick-add-modal"

type View = "home" | "lists" | "scanner" | "store" | "promos"

interface ShoppingList {
  id: string
  name: string
  family_id: string
  created_by: string
  created_at: string
  items?: number
  checkedItems?: number
}

export default function AppPage() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<View>("home")
  const [familyInfo, setFamilyInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lists, setLists] = useState<ShoppingList[]>([])
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      const supabase = createClient()

      // Check authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push("/login")
        return
      }

      // Check if user is a member of a family
      const { data: member, error: memberError } = await supabase
        .from("members")
        .select("family_id, display_name")
        .eq("id", user.id)
        .single()

      if (memberError || !member) {
        router.push("/onboarding")
        return
      }

      // Load family info
      const { data: family } = await supabase.from("families").select("name").eq("id", member.family_id).single()

      const { data: members } = await supabase.from("members").select("display_name").eq("family_id", member.family_id)

      setFamilyInfo({
        name: family?.name,
        memberCount: members?.length || 0,
      })

      // Load shopping lists with item counts
      const { data: shoppingLists } = await supabase
        .from("shopping_lists")
        .select(`
          id,
          name,
          family_id,
          created_by,
          created_at
        `)
        .eq("family_id", member.family_id)
        .order("created_at", { ascending: false })

      if (shoppingLists) {
        // Get item counts for each list
        const listsWithCounts = await Promise.all(
          shoppingLists.map(async (list) => {
            const { data: items } = await supabase.from("list_items").select("id, checked").eq("list_id", list.id)

            const totalItems = items?.length || 0
            const checkedItems = items?.filter((item) => item.checked).length || 0

            return {
              ...list,
              items: totalItems,
              checkedItems: checkedItems,
            }
          }),
        )

        setLists(listsWithCounts)
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const createNewList = async (name: string) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !familyInfo) return

    const { data: member } = await supabase.from("members").select("family_id").eq("id", user.id).single()

    if (!member) return

    const { data, error } = await supabase
      .from("shopping_lists")
      .insert({
        name,
        family_id: member.family_id,
        created_by: user.id,
      })
      .select()
      .single()

    if (!error && data) {
      setLists((prev) => [
        {
          ...data,
          items: 0,
          checkedItems: 0,
        },
        ...prev,
      ])
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  const renderView = () => {
    switch (currentView) {
      case "lists":
        return <ShoppingListManager lists={lists} setLists={setLists} onCreateList={createNewList} />
      case "scanner":
        return <BarcodeScanner />
      case "store":
        return <StoreMode />
      case "promos":
        return <PromoManager />
      default:
        return (
          <div className="space-y-6">
            {familyInfo && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-green-800">{familyInfo.name}</h2>
                      <p className="text-sm text-green-600">
                        {familyInfo.memberCount} membre{familyInfo.memberCount > 1 ? "s" : ""} actif
                        {familyInfo.memberCount > 1 ? "s" : ""}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push("/settings")}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-green-600">FrigoFlow</h1>
              <p className="text-muted-foreground">Votre assistant courses familial</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setCurrentView("lists")}
                className="h-20 flex-col gap-2 bg-green-600 hover:bg-green-700"
              >
                <ShoppingCart className="h-6 w-6" />
                Mes listes
              </Button>
              <Button onClick={() => setCurrentView("scanner")} variant="outline" className="h-20 flex-col gap-2">
                <ScanLine className="h-6 w-6" />
                Scanner
              </Button>
              <Button onClick={() => setCurrentView("store")} variant="outline" className="h-20 flex-col gap-2">
                <Store className="h-6 w-6" />
                Mode magasin
              </Button>
              <Button onClick={() => setCurrentView("promos")} variant="outline" className="h-20 flex-col gap-2">
                <Percent className="h-6 w-6" />
                Promos
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Listes récentes</h2>
                <Button onClick={() => setCurrentView("lists")} variant="outline" size="sm">
                  Voir tout
                </Button>
              </div>

              {lists.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">Aucune liste de courses</h3>
                    <p className="text-sm text-muted-foreground mb-4">Créez votre première liste pour commencer</p>
                    <Button onClick={() => setCurrentView("lists")} className="bg-green-600 hover:bg-green-700">
                      Créer une liste
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                lists.slice(0, 3).map((list) => {
                  const progressPercentage = list.items && list.items > 0 ? (list.checkedItems! / list.items) * 100 : 0

                  return (
                    <Card
                      key={list.id}
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => router.push(`/list/${list.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium">{list.name}</h3>
                            <p className="text-sm text-muted-foreground">{list.items || 0} articles</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{familyInfo?.memberCount || 1}</span>
                            </div>
                            <Badge variant="secondary">{list.items || 0}</Badge>
                          </div>
                        </div>
                        {list.items && list.items > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>
                                {list.checkedItems}/{list.items} cochés
                              </span>
                              <span>{Math.round(progressPercentage)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-md mx-auto p-4">
        {currentView !== "home" && (
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView("home")}>
              ← Retour
            </Button>
            <h1 className="text-xl font-semibold capitalize">{currentView}</h1>
          </div>
        )}

        {renderView()}

        <Button
          onClick={() => setShowQuickAdd(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg"
          size="icon"
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>

        <QuickAddModal open={showQuickAdd} onOpenChange={setShowQuickAdd} lists={lists} />
      </div>
    </div>
  )
}
