"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

interface ListItem {
  id: string
  label: string
  qty: number
  unit: string
  checked: boolean
  price?: number
  added_by: string
  created_at: string
}

export function useRealtimeList(listId: string) {
  const [items, setItems] = useState<ListItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from("list_items")
        .select("*")
        .eq("list_id", listId)
        .order("created_at", { ascending: true })

      if (!error && data) {
        setItems(data)
      }
      setLoading(false)
    }

    fetchItems()

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`list_items_${listId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "list_items",
          filter: `list_id=eq.${listId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setItems((current) => [...current, payload.new as ListItem])
          } else if (payload.eventType === "UPDATE") {
            setItems((current) =>
              current.map((item) => (item.id === payload.new.id ? (payload.new as ListItem) : item)),
            )
          } else if (payload.eventType === "DELETE") {
            setItems((current) => current.filter((item) => item.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [listId, supabase])

  return { items, loading }
}
