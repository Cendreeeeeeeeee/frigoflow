"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

interface List {
  id: string
  name: string
  items: number
  checkedItems: number
  shared: boolean
  members: number
  lastModified: string
}

interface QuickAddModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lists: List[]
}

export function QuickAddModal({ open, onOpenChange, lists }: QuickAddModalProps) {
  const [itemName, setItemName] = useState("")
  const [selectedList, setSelectedList] = useState<string>("")

  const handleAdd = () => {
    if (!itemName.trim()) return

    // Here you would add the item to the selected list
    console.log(`Adding "${itemName}" to list ${selectedList}`)

    // Reset form
    setItemName("")
    setSelectedList("")
    onOpenChange(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un article</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Nom de l'article..."
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            onKeyPress={handleKeyPress}
            autoFocus
          />

          {lists.length > 0 && (
            <Select value={selectedList} onValueChange={setSelectedList}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une liste" />
              </SelectTrigger>
              <SelectContent>
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex gap-2">
            <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleAdd} className="flex-1 bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
