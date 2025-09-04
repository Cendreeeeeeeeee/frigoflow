"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, CheckCircle } from "lucide-react"

interface StoreItem {
  id: string
  name: string
  quantity: number
  unit: string
  category: string
  aisle: string
  checked: boolean
  price?: number
}

const categories = [
  "Fruits et légumes",
  "Boulangerie",
  "Produits laitiers",
  "Viandes et poissons",
  "Épicerie salée",
  "Épicerie sucrée",
  "Surgelés",
  "Hygiène et beauté",
]

const stores = ["Denner", "Coop", "Migros", "Aldi", "Lidl"]

export function StoreMode() {
  const [items] = useState<StoreItem[]>([
    {
      id: "1",
      name: "Pommes Golden",
      quantity: 1.5,
      unit: "kg",
      category: "Fruits et légumes",
      aisle: "Rayon 1-2",
      checked: false,
      price: 2.9,
    },
    {
      id: "2",
      name: "Pain de mie",
      quantity: 1,
      unit: "paquet",
      category: "Boulangerie",
      aisle: "Rayon 8",
      checked: true,
      price: 1.85,
    },
    {
      id: "3",
      name: "Lait demi-écrémé",
      quantity: 2,
      unit: "L",
      category: "Produits laitiers",
      aisle: "Rayon 12",
      checked: false,
      price: 1.2,
    },
    {
      id: "4",
      name: "Yaourts nature",
      quantity: 1,
      unit: "pack",
      category: "Produits laitiers",
      aisle: "Rayon 12",
      checked: false,
      price: 2.5,
    },
  ])

  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set(["2"]))
  const [selectedStore, setSelectedStore] = useState<string>("Coop")

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(id)) {
      newChecked.delete(id)
    } else {
      newChecked.add(id)
    }
    setCheckedItems(newChecked)
  }

  const formatPrice = (price: number) => `CHF ${price.toFixed(2)}`

  const groupedItems = categories.reduce(
    (acc, category) => {
      const categoryItems = items.filter((item) => item.category === category)
      if (categoryItems.length > 0) {
        acc[category] = categoryItems
      }
      return acc
    },
    {} as Record<string, StoreItem[]>,
  )

  const totalItems = items.length
  const completedItems = checkedItems.size
  const progress = (completedItems / totalItems) * 100

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mode magasin
          </CardTitle>
          <div className="space-y-3">
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un magasin" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store} value={store}>
                    {store}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center justify-between text-sm">
              <span>
                {completedItems}/{totalItems} articles
              </span>
              <span className="text-green-600 font-medium">{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, categoryItems]) => {
          const categoryCompleted = categoryItems.filter((item) => checkedItems.has(item.id)).length
          const categoryTotal = categoryItems.length
          const isCompleted = categoryCompleted === categoryTotal

          return (
            <Card key={category} className={isCompleted ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {category}
                  </CardTitle>
                  <Badge variant={isCompleted ? "default" : "secondary"}>
                    {categoryCompleted}/{categoryTotal}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryItems.map((item) => {
                  const isChecked = checkedItems.has(item.id)
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <Checkbox checked={isChecked} onCheckedChange={() => toggleItem(item.id)} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={isChecked ? "line-through text-muted-foreground" : ""}>{item.name}</span>
                          {item.price && (
                            <span className="text-sm font-medium text-green-600">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {item.quantity} {item.unit}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {item.aisle}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {completedItems === totalItems && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium text-green-800">Courses terminées !</h3>
            <p className="text-sm text-green-600">Tous les articles ont été collectés</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
