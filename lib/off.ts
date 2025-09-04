// Open Food Facts integration
export interface ProductInfo {
  product_name?: string
  brands?: string
  quantity?: string
  image_url?: string
  nutriscore_grade?: string
}

export async function lookupProduct(ean: string): Promise<ProductInfo | null> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${ean}.json`)
    const data = await response.json()

    if (data.status === 1 && data.product) {
      return {
        product_name: data.product.product_name,
        brands: data.product.brands,
        quantity: data.product.quantity,
        image_url: data.product.image_url,
        nutriscore_grade: data.product.nutriscore_grade,
      }
    }

    return null
  } catch (error) {
    console.error("Error fetching product info:", error)
    return null
  }
}
