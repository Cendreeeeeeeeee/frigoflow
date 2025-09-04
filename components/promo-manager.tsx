"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Percent, Clock, Plus } from "lucide-react"

interface Promo {
  id: string
  title: string
  description: string
  discount: number
  regularPrice: number
  salePrice: number
  validUntil: string
  store: string
  category: string
  score: number
  inMyList: boolean
}

export function PromoManager() {
  const [promos] = useState<Promo[]>([
    {
      id: "1",
      title: "Lait UHT demi-écrémé",
      description: "2 achetés = 1 offert",
      discount: 33,
      regularPrice: 1.8,
      salePrice: 1.2,
      validUntil: "2024-01-15",
      store: "Coop",
      category: "Produits laitiers",
      score: 95,
      inMyList: true,
    },
    {
      id: "2",
      title: "Pommes Golden",
      description: "Prix spécial cette semaine",
      discount: 20,
      regularPrice: 3.6,
      salePrice: 2.9,
      validUntil: "2024-01-12",
      store: "Migros",
      category: "Fruits et légumes",
      score: 88,
      inMyList: true,
    },
    {
      id: "3",
      title: "Pain de mie complet",
      description: "Offre découverte",
      discount: 15,
      regularPrice: 2.2,
      salePrice: 1.85,
      validUntil: "2024-01-20",
      store: "Denner",
      category: "Boulangerie",
      score: 72,
      inMyList: false,
    },
    {
      id: "4",
      title: "Yaourts aux fruits",
      description: "Lot de 12 au prix de 10",
      discount: 17,
      regularPrice: 4.8,
      salePrice: 4.0,
      validUntil: "2024-01-18",
      store: "Aldi",
      category: "Produits laitiers",
      score: 65,
      inMyList: false,
    },
  ])

  const [filter, setFilter] = useState<"all" | "mylist">("all")

  const filteredPromos = filter === "mylist" ? promos.filter((promo) => promo.inMyList) : promos
  const sortedPromos = filteredPromos.sort((a, b) => b.score - a.score)

  const formatPrice = (price: number) => `CHF ${price.toFixed(2)}`

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100"
    if (score >= 75) return "text-orange-600 bg-orange-100"
    return "text-red-600 bg-red-100"
  }

  const getDaysLeft = (validUntil: string) => {
    const today = new Date()
    const endDate = new Date(validUntil)
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Promos personnalisées
          </CardTitle>
          <div className="flex gap-2">
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              Toutes
            </Button>
            <Button variant={filter === "mylist" ? "default" : "outline"} size="sm" onClick={() => setFilter("mylist")}>
              Dans mes listes
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {sortedPromos.map((promo) => {
          const daysLeft = getDaysLeft(promo.validUntil)

          return (
            <Card key={promo.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium">{promo.title}</h3>
                    <p className="text-sm text-muted-foreground">{promo.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm line-through text-muted-foreground">
                        {formatPrice(promo.regularPrice)}
                      </span>
                      <span className="text-sm font-medium text-green-600">{formatPrice(promo.salePrice)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getScoreColor(promo.score)}>
                      <Star className="h-3 w-3 mr-1" />
                      {promo.score}
                    </Badge>
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Percent className="h-3 w-3" />-{promo.discount}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{promo.store}</Badge>
                    <Badge variant="secondary">{promo.category}</Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {daysLeft > 0 ? `${daysLeft}j restants` : "Expire aujourd'hui"}
                    </span>
                  </div>

                  {promo.inMyList ? (
                    <Badge variant="default" className="bg-green-600">
                      Dans ma liste
                    </Badge>
                  ) : (
                    <Button size="sm" variant="outline">
                      <Plus className="h-3 w-3 mr-1" />
                      Ajouter
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-medium text-blue-800 mb-1">Comment ça marche ?</h3>
          <p className="text-sm text-blue-600">
            Le score combine vos habitudes d'achat, la réduction proposée et la proximité des magasins. Plus le score
            est élevé, plus la promo vous correspond !
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
