import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'dcribioshop-cart'

let items = []
let loaded = false
const listeners = new Set()

function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    items = []
  }
}

function emit(next) {
  items = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
  listeners.forEach((listener) => listener())
}

export const cart = {
  add(product, qty = 1) {
    load()
    emit(
      items.find((item) => item.slug === product.slug)
        ? items.map((item) => (item.slug === product.slug ? { ...item, qty: item.qty + qty } : item))
        : [...items, { ...product, qty }],
    )
  },
  setQty(slug, qty) {
    load()
    emit(qty <= 0 ? items.filter((item) => item.slug !== slug) : items.map((item) => (item.slug === slug ? { ...item, qty } : item)))
  },
  remove(slug) {
    load()
    emit(items.filter((item) => item.slug !== slug))
  },
  clear() {
    emit([])
  },
}

export function useCart() {
  return useSyncExternalStore(
    (callback) => {
      load()
      listeners.add(callback)
      callback()
      return () => listeners.delete(callback)
    },
    () => {
      load()
      return items
    },
    () => [],
  )
}

export function useCartCount() {
  return useCart().reduce((total, item) => total + item.qty, 0)
}
