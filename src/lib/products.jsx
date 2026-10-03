import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { isSupabaseConfigured, supabase } from './supabase.js'
import { PRODUCTS as STATIC_PRODUCTS } from '../data.js'
import { slugify } from './slug.js'

const ProductsContext = createContext(null)

function fromStatic(list) {
  return list.map((product, index) => ({
    id: `static-${index}`,
    slug: slugify(product.name, product.image),
    name: product.name,
    description: '',
    image: product.image,
    images: [product.image],
    tab: product.tab,
    group: product.group,
    published: true,
    sortOrder: index,
  }))
}

export function fromRow(row) {
  const images = Array.isArray(row.images) && row.images.length ? row.images : row.image ? [row.image] : []
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description || '',
    image: row.image || images[0] || '',
    images,
    tab: row.tab,
    group: row.category,
    published: row.published,
    sortOrder: row.sort_order ?? 0,
  }
}

const STATIC_FALLBACK = fromStatic(STATIC_PRODUCTS)

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(STATIC_FALLBACK)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [source, setSource] = useState(isSupabaseConfigured ? 'loading' : 'static')
  const [error, setError] = useState(null)
  const lastLoad = useRef(0)

  const load = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setProducts(STATIC_FALLBACK)
      setSource('static')
      setLoading(false)
      return
    }
    lastLoad.current = Date.now()
    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('products')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })
      if (err) throw err
      if (!data || data.length === 0) {
        setProducts(STATIC_FALLBACK)
        setSource('static')
      } else {
        setProducts(data.map(fromRow))
        setSource('supabase')
      }
      setError(null)
    } catch (e) {
      setProducts(STATIC_FALLBACK)
      setSource('static')
      setError(e?.message || 'Falha ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Atualiza automaticamente ao voltar para a aba do site (reflete mudanças feitas no painel).
  useEffect(() => {
    if (!isSupabaseConfigured) return
    const refreshIfVisible = () => {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - lastLoad.current < 60000) return
      load()
    }
    window.addEventListener('focus', refreshIfVisible)
    document.addEventListener('visibilitychange', refreshIfVisible)
    return () => {
      window.removeEventListener('focus', refreshIfVisible)
      document.removeEventListener('visibilitychange', refreshIfVisible)
    }
  }, [load])

  const value = useMemo(
    () => ({ products, loading, source, error, refresh: load }),
    [products, loading, source, error, load],
  )

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) return { products: STATIC_FALLBACK, loading: false, source: 'static', error: null, refresh: () => {} }
  return ctx
}
