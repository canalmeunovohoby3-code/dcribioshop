import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, MessageCircle, Minus, Plus, ShoppingCart } from 'lucide-react'
import CartButton from '../components/CartButton.jsx'
import CartDrawer from '../components/CartDrawer.jsx'
import { LOGO, SITE } from '../data.js'
import { cart } from '../lib/cart.js'
import { useProducts } from '../lib/products.jsx'
import { trackCartAdd, trackWhatsappClick } from '../lib/metrics.js'

const DEFAULT_DESCRIPTION =
  'Produto personalizado com a sua marca, com qualidade e acabamento profissional. Envio para todo o Brasil.'

export default function Produto() {
  const { slug } = useParams()
  const { products } = useProducts()
  const product = products.find((item) => item.slug === slug)

  const [activeImage, setActiveImage] = useState('')
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const images = product ? (product.images && product.images.length ? product.images : [product.image]) : []
  const currentImage = activeImage && images.includes(activeImage) ? activeImage : images[0] || ''
  const related = product
    ? products.filter((item) => item.group === product.group && item.slug !== product.slug).slice(0, 8)
    : []

  const handleAdd = () => {
    if (!product) return
    cart.add({ slug: product.slug, name: product.name, image: product.image }, qty)
    trackCartAdd(product, qty)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  const waLink = product
    ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
        `Olá, Dcribioshop! Tenho interesse no produto: ${product.name} (${qty} unid.)`,
      )}`
    : '#'

  return (
    <main className="site-shell product-page">
      <header className="site-header wrap">
        <Link to="/" className="brand">
          <img className="brand-logo" src={LOGO} alt="Dcribioshop" />
        </Link>
        <CartButton onClick={() => setCartOpen(true)} />
      </header>

      {!product ? (
        <div className="wrap">
          <Link to={{ pathname: '/', hash: '#produtos' }} className="back-link">
            <ArrowLeft size={17} /> Voltar aos produtos
          </Link>
          <p>Produto não encontrado.</p>
        </div>
      ) : (
        <div className="wrap">
          <Link to={{ pathname: '/', hash: '#produtos' }} className="back-link">
            <ArrowLeft size={17} /> Voltar aos produtos
          </Link>
          <section className="pd-grid">
            <div className="pd-gallery">
              <div className="pd-main">
                <img src={currentImage} alt={product.name} />
              </div>
              {images.length > 1 && (
                <div className="pd-thumbs">
                  {images.map((image) => (
                    <button
                      className={image === currentImage ? 'active' : ''}
                      onClick={() => setActiveImage(image)}
                      aria-label="Ver foto"
                      key={image}
                    >
                      <img src={image} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="pd-info">
              <span className="eyebrow">{product.group}</span>
              <h1>{product.name}</h1>
              <p>{product.description || DEFAULT_DESCRIPTION}</p>
              <div className="pd-qty">
                <span>Quantidade</span>
                <div className="qty">
                  <button onClick={() => setQty((value) => Math.max(1, value - 1))} aria-label="Diminuir">
                    <Minus size={15} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(event) => setQty(Math.max(1, Number(event.target.value) || 1))}
                    aria-label="Quantidade"
                  />
                  <button onClick={() => setQty((value) => value + 1)} aria-label="Aumentar">
                    <Plus size={15} />
                  </button>
                </div>
              </div>
              <button className="action-button" onClick={handleAdd}>
                {added ? (
                  <>
                    <Check size={18} />
                    ADICIONADO!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    ADICIONAR AO CARRINHO
                  </>
                )}
              </button>
              <a
                className="pd-wa"
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsappClick(`produto:${product.name}`)}
              >
                <MessageCircle size={18} />
                Falar sobre este produto no WhatsApp
              </a>
            </div>
          </section>

          {related.length > 0 && (
            <section className="pd-related">
              <h2>
                VOCÊ TAMBÉM PODE <em>GOSTAR</em>
              </h2>
              <div className="product-grid catalog">
                {related.map((item) => (
                  <Link to={`/produto/${item.slug}`} className="product-card" key={item.slug || item.image}>
                    <img src={item.image} alt={item.name} loading="lazy" />
                    <div className="product-info">
                      <strong>{item.name}</strong>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </main>
  )
}
