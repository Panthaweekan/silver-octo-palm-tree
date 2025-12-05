'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, Plus } from 'lucide-react'
import { searchFood, FoodProduct } from '@/lib/services/food-api'
import { useDebounce } from '@/hooks/use-debounce'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { ScrollArea } from '@/components/ui/scroll-area'

interface FoodSearchProps {
  onSelect: (food: FoodProduct) => void
}

export function FoodSearch({ onSelect }: FoodSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodProduct[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 500)
  const { language } = useLanguage()

  useEffect(() => {
    async function fetchFood() {
      if (debouncedQuery.length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      const data = await searchFood(debouncedQuery, language)
      setResults(data)
      setLoading(false)
    }

    fetchFood()
  }, [debouncedQuery, language])

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search food..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-11 h-12 rounded-full bg-secondary/50 border-transparent focus:border-primary focus:bg-background transition-all"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <Button size="icon" className="h-12 w-12 rounded-full shrink-0" variant="outline" title="Scan Barcode">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-scan-barcode"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 7v10"/><path d="M12 7v10"/><path d="M17 7v10"/></svg>
        </Button>
      </div>

      <ScrollArea className="h-auto max-h-[60vh] w-full rounded-md border">
        <div className="p-4 space-y-2">
          {results.length === 0 && !loading && query.length > 1 && (
            <div className="text-center text-muted-foreground py-8">
              No results found. Try a different search term.
            </div>
          )}
          
          {results.length === 0 && query.length <= 1 && (
             <div className="text-center text-muted-foreground py-8">
              Type at least 2 characters to search.
            </div>
          )}

          {results.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors max-w-full"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm sm:text-base break-words leading-tight">{product.product_name}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground truncate mt-1">
                  {product.brands ? `${product.brands} • ` : ''}
                  {Math.round(product.nutriments['energy-kcal_100g'] || 0)} kcal / 100g
                </p>
                {product.ingredients_text && (
                  <p className="text-xs text-muted-foreground/70 truncate mt-0.5 max-w-[90%]">
                    {product.ingredients_text}
                  </p>
                )}
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => onSelect(product)}
                className="shrink-0 h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
