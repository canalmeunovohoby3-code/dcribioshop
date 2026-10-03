import { ShoppingCart } from 'lucide-react'
import { useCartCount } from '../lib/cart.js'

export default function CartButton({ onClick }) {
  const count = useCartCount()
  return (
    <button type="button" className="cart-button" onClick={onClick} aria-label={`Abrir carrinho (${count} itens)`}>
      <ShoppingCart size={21} />
      {count > 0 && <span>{count}</span>}
    </button>
  )
}
