import { useState } from 'react'
import { Minus, Plus, Send, ShoppingCart, Trash2, X } from 'lucide-react'
import { cart, useCart } from '../lib/cart.js'
import { SITE } from '../data.js'

export default function CartDrawer({ open, onClose }) {
  const items = useCart()
  const [name, setName] = useState('')

  const sendOrder = () => {
    const text = `Olá, Dcribioshop! Gostaria de um orçamento para:\n\n${items
      .map((item) => `• ${item.qty}x ${item.name}`)
      .join('\n')}${name.trim() ? `\n\nNome: ${name.trim()}` : ''}`
    window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <div className={`drawer-backdrop ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`drawer cart-drawer ${open ? 'open' : ''}`} aria-hidden={!open} aria-label="Carrinho">
        <div className="drawer-head">
          <strong className="cart-title">
            <ShoppingCart size={20} /> MEU PEDIDO
          </strong>
          <button className="icon-button" onClick={onClose} aria-label="Fechar carrinho">
            <X />
          </button>
        </div>
        {items.length === 0 ? (
          <p className="cart-empty">Seu carrinho está vazio. Adicione produtos para montar seu pedido.</p>
        ) : (
          <>
            <ul className="cart-list">
              {items.map((item) => (
                <li key={item.slug}>
                  <img src={item.image} alt="" />
                  <div>
                    <strong>{item.name}</strong>
                    <div className="qty">
                      <button onClick={() => cart.setQty(item.slug, item.qty - 1)} aria-label="Diminuir">
                        <Minus size={14} />
                      </button>
                      <span>{item.qty}</span>
                      <button onClick={() => cart.setQty(item.slug, item.qty + 1)} aria-label="Aumentar">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <button className="cart-remove" onClick={() => cart.remove(item.slug)} aria-label={`Remover ${item.name}`}>
                    <Trash2 size={17} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="cart-footer">
              <label>
                Seu nome (opcional)
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome" />
              </label>
              <button className="action-button" onClick={sendOrder}>
                <Send size={18} />
                ENVIAR PEDIDO NO WHATSAPP
              </button>
              <button className="cart-clear" onClick={() => cart.clear()}>
                Limpar carrinho
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
