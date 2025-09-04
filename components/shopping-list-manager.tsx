"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Users } from "lucide-react"

interface ShoppingList {
  id: string
  name: string
  family_id?: string
  created_by?: string
  created_at?: string
  items?: number
  checkedItems?: number
}

interface ShoppingListManagerProps {
  lists: ShoppingList[]
  setLists: (lists: ShoppingList[]) => void
  onCreateList?: (name: string) => void
}

export function ShoppingListManager({ lists, setLists, onCreateList }: ShoppingListManagerProps) {
  const router = useRouter()
  const [newListName, setNewListName] = useState("")

  const createNewList = () => {
    if (!newListName.trim()) return

    if (onCreateList) {
      onCreateList(newListName.trim())
    } else {
      // Fallback for static data
      const newList = {
        id: Date.now().toString(),
        name: newListName,
        items: 0,
        checkedItems: 0,
      }
      setLists([...lists, newList])
    }

    setNewListName("")
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Nouvelle liste..."
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && createNewList()}
        />
        <Button onClick={createNewList}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {lists.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <h3 className="font-medium mb-2">Aucune liste de courses</h3>
              <p className="text-sm text-muted-foreground">Créez votre première liste pour commencer</p>
            </CardContent>
          </Card>
        ) : (
          lists.map((list) => {
            const progressPercentage = list.items && list.items > 0 ? ((list.checkedItems || 0) / list.items) * 100 : 0

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
                        <span>1</span>
                      </div>
                      <Badge variant="secondary">{list.items || 0}</Badge>
                    </div>
                  </div>
                  {list.items && list.items > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {list.checkedItems || 0}/{list.items} cochés
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
