export interface FoodProduct {
  id: string
  product_name: string
  brands?: string
  nutriments: {
    'energy-kcal_100g'?: number
    proteins_100g?: number
    carbohydrates_100g?: number
    fat_100g?: number
  }
  serving_size?: string
  serving_quantity?: number
  image_url?: string
  ingredients_text?: string
}

export interface SearchResponse {
  products: any[]
  count: number
}

export async function searchFood(query: string, locale: string = 'en'): Promise<FoodProduct[]> {
  if (!query || query.length < 2) return []

  const isThaiQuery = /[\u0E00-\u0E7F]/.test(query)
  const effectiveLocale = (locale === 'th' || isThaiQuery) ? 'th' : 'en'

  const baseUrl = effectiveLocale === 'th' ? 'https://th.openfoodfacts.org' : 'https://world.openfoodfacts.org'

  try {
    const response = await fetch(
      `${baseUrl}/cgi/search.pl?search_terms=${encodeURIComponent(
        query
      )}&search_simple=1&action=process&json=1&page_size=20&fields=code,product_name,product_name_th,brands,nutriments,serving_size,serving_quantity,image_front_small_url,ingredients_text`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'FitJourney/1.0 (web app)',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch food data')
    }

    const data: SearchResponse = await response.json()

    return data.products.map((product: any) => ({
      id: product.code,
      product_name: (effectiveLocale === 'th' && product.product_name_th) ? product.product_name_th : (product.product_name || 'Unknown Product'),
      brands: product.brands,
      nutriments: {
        'energy-kcal_100g': product.nutriments?.['energy-kcal_100g'] || 0,
        proteins_100g: product.nutriments?.proteins_100g || 0,
        carbohydrates_100g: product.nutriments?.carbohydrates_100g || 0,
        fat_100g: product.nutriments?.fat_100g || 0,
      },
      serving_size: product.serving_size,
      serving_quantity: product.serving_quantity,
      image_url: product.image_front_small_url,
      ingredients_text: product.ingredients_text,
    }))
  } catch (error) {
    console.error('Error searching food:', error)
    return []
  }
}
