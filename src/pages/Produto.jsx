import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, MessageCircle, Minus, Plus, ShoppingCart } from 'lucide-react'
import CartButton from '../components/CartButton.jsx'
import CartDrawer from '../components/CartDrawer.jsx'
import { LOGO, PRODUCTS, SITE } from '../data.js'
import { cart } from '../lib/cart.js'
import { productSlug } from '../lib/slug.js'

export default function Produto() {
  const { slug } = useParams()
  const product = PRODUCTS.find((item) => productSlug(item) === slug)

  const [activeImage, setActiveImage] = useState(product ? product.image : '')
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const images = product ? [product.image] : []
  const related = product
    ? PRODUCTS.filter((item) => item.group === product.group && item.image !== product.image).slice(0, 8)
    : []

  const handleAdd = () => {
    cart.add({ slug: productSlug(product), name: product.name, image: product.image }, qty)
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
                <img src={activeImage} alt={product.name} />
              </div>
              {images.length > 1 && (
                <div className="pd-thumbs">
                  {images.map((image) => (
                    <button
                      className={image === activeImage ? 'active' : ''}
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
              <p>
                Produto personalizado com a sua marca, com qualidade e acabamento profissional. Envio para todo o Brasil.
              </p>
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
              <a className="pd-wa" href={waLink} target="_blank" rel="noopener noreferrer">
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
                  <Link
                    to={`/produto/${productSlug(item)}`}
                    className="product-card"
                    key={item.image}
                  >
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
