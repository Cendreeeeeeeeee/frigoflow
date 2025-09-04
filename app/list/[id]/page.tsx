"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRealtimeList } from "@/hooks/useRealtimeList"
import { lookupProduct } from "@/lib/off"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Users, Share2, ArrowLeft, Camera, Percent } from "lucide-react"

interface ShoppingList {
  id: string
  name: string
  family_id: string
  created_by: string
  created_at: string
}

export default function ListDetailPage() {
  const router = useRouter()
  const params = useParams()
  const listId = params.id as string

  const [list, setList] = useState<ShoppingList | null>(null)
  const [newItemName, setNewItemName] = useState("")
  const [newItemQty, setNewItemQty] = useState(1)
  const [newItemUnit, setNewItemUnit] = useState("pcs")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [familyMembers, setFamilyMembers] = useState(0)

  const { items, loading: itemsLoading } = useRealtimeList(listId)
  const supabase = createClient()

  useEffect(() => {
    loadListInfo()
  }, [listId])

  const loadListInfo = async () => {
    try {
      // Load list details
      const { data: listData, error: listError } = await supabase
        .from("shopping_lists")
        .select("*")
        .eq("id", listId)
        .single()

      if (listError || !listData) {
        router.push("/app")
        return
      }

      setList(listData)

      // Load family member count
      const { data: members } = await supabase.from("members").select("id").eq("family_id", listData.family_id)

      setFamilyMembers(members?.length || 0)
    } catch (error) {
      console.error("Error loading list:", error)
      router.push("/app")
    } finally {
      setLoading(false)
    }
  }

  const addItem = async () => {
    if (!newItemName.trim()) return

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("list_items").insert({
      list_id: listId,
      label: newItemName.trim(),
      qty: newItemQty,
      unit: newItemUnit,
      added_by: user.id,
    })

    if (!error) {
      setNewItemName("")
      setNewItemQty(1)
      setNewItemUnit("pcs")
      setShowAddDialog(false)
    }
  }

  const toggleItem = async (itemId: string, checked: boolean) => {
    await supabase.from("list_items").update({ checked: !checked }).eq("id", itemId)
  }

  const deleteItem = async (itemId: string) => {
    await supabase.from("list_items").delete().eq("id", itemId)
  }

  const simulateBarcodeScan = async () => {
    setScanning(true)

    // Simulate scanning delay
    setTimeout(async () => {
      const mockEan = "3274080005003" // Mock EAN for demonstration
      const productInfo = await lookupProduct(mockEan)

      if (productInfo?.product_name) {
        setNewItemName(productInfo.product_name)
        setShowAddDialog(true)
      } else {
        setNewItemName("Produit scanné")
        setShowAddDialog(true)
      }

      setScanning(false)
    }, 2000)
  }

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      return total + (item.price || 0) * item.qty
    }, 0)
  }

  const formatPrice = (price: number) => `CHF ${price.toFixed(2)}`

  const checkedItems = items.filter((item) => item.checked).length
  const progressPercentage = items.length > 0 ? (checkedItems / items.length) * 100 : 0

  if (loading || itemsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Liste introuvable</h2>
          <Button onClick={() => router.push("/app")}>Retour aux listes</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-md mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/app")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold flex-1">{list.name}</h1>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* List Stats */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{items.length} articles</span>
                <span>{checkedItems} cochés</span>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{familyMembers}</span>
                </div>
              </div>
              <span className="font-medium text-green-600">{formatPrice(calculateTotal())}</span>
            </div>

            {items.length > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {checkedItems}/{items.length} cochés
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

        {/* Promo Banner */}
        <Card className="mb-4 bg-orange-50 border-orange-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                <Percent className="h-3 w-3 mr-1" />
                -15%
              </Badge>
              <span className="text-sm">Promotion sur les produits laitiers chez Coop</span>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <div className="space-y-2 mb-20">
          {items.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <h3 className="font-medium mb-2">Liste vide</h3>
                <p className="text-sm text-muted-foreground mb-4">Ajoutez des articles à votre liste</p>
                <Button onClick={() => setShowAddDialog(true)} className="bg-green-600 hover:bg-green-700">
                  Ajouter un article
                </Button>
              </CardContent>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.id} className={item.checked ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={item.checked} onCheckedChange={() => toggleItem(item.id, item.checked)} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={item.checked ? "line-through" : ""}>{item.label}</span>
                        <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          {item.qty} {item.unit}
                        </span>
                        {item.price && (
                          <span className="font-medium text-green-600">{formatPrice(item.price * item.qty)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          <Button
            onClick={simulateBarcodeScan}
            className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
            size="icon"
            disabled={scanning}
          >
            {scanning ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Camera className="h-5 w-5 text-white" />
            )}
          </Button>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg" size="icon">
                <Plus className="h-6 w-6 text-white" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un article</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nom de l'article"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Quantité"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Number(e.target.value))}
                    className="w-24"
                  />
                  <Select value={newItemUnit} onValueChange={setNewItemUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">pcs</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="paquet">paquet</SelectItem>
                      <SelectItem value="boîte">boîte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addItem} className="w-full bg-green-600 hover:bg-green-700">
                  Ajouter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
