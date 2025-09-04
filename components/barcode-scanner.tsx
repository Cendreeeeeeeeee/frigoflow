"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, CameraOff, Plus } from "lucide-react"

interface Product {
  barcode: string
  name: string
  brand: string
  category: string
  image?: string
  nutriscore?: string
  price?: number
}

export function BarcodeScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startScanning = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsScanning(true)
      }
    } catch (err) {
      setError("Impossible d'accéder à la caméra")
    }
  }

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const simulateScan = () => {
    // Simulation d'un scan pour la démo
    const mockProduct: Product = {
      barcode: "3274080005003",
      name: "Lait demi-écrémé UHT",
      brand: "Lactel",
      category: "Produits laitiers",
      nutriscore: "B",
      price: 1.2,
    }
    setScannedProduct(mockProduct)
    stopScanning()
  }

  const addToList = () => {
    // Logique pour ajouter à la liste
    setScannedProduct(null)
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Scanner un code-barres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isScanning ? (
            <div className="text-center space-y-4">
              <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                <Camera className="h-12 w-12 text-muted-foreground" />
              </div>
              <Button onClick={startScanning} className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Démarrer le scan
              </Button>
              <Button onClick={simulateScan} variant="outline" className="w-full bg-transparent">
                Simuler un scan (démo)
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <video ref={videoRef} autoPlay playsInline className="w-full h-48 bg-black rounded-lg" />
              <Button onClick={stopScanning} variant="destructive" className="w-full">
                <CameraOff className="h-4 w-4 mr-2" />
                Arrêter le scan
              </Button>
            </div>
          )}

          {error && <div className="text-center text-red-500 text-sm">{error}</div>}
        </CardContent>
      </Card>

      {scannedProduct && (
        <Card>
          <CardHeader>
            <CardTitle>Produit scanné</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">{scannedProduct.name}</h3>
              <p className="text-sm text-muted-foreground">{scannedProduct.brand}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{scannedProduct.category}</Badge>
                {scannedProduct.nutriscore && (
                  <Badge
                    variant="outline"
                    className={`${
                      scannedProduct.nutriscore === "A"
                        ? "bg-green-100 text-green-800"
                        : scannedProduct.nutriscore === "B"
                          ? "bg-lime-100 text-lime-800"
                          : scannedProduct.nutriscore === "C"
                            ? "bg-yellow-100 text-yellow-800"
                            : scannedProduct.nutriscore === "D"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                    }`}
                  >
                    Nutri-Score {scannedProduct.nutriscore}
                  </Badge>
                )}
              </div>
              {scannedProduct.price && <p className="font-medium text-green-600">~{scannedProduct.price}€</p>}
            </div>

            <div className="flex gap-2">
              <Button onClick={addToList} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter à ma liste
              </Button>
              <Button variant="outline" onClick={() => setScannedProduct(null)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
