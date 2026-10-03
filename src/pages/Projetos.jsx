import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { LOGO, SITE } from '../data.js'
import { productSlug } from '../lib/slug.js'
import { useProducts } from '../lib/products.jsx'
import { trackWhatsappClick } from '../lib/metrics.js'

export default function Projetos() {
  const { products } = useProducts()
  const [active, setActive] = useState('Todos')
  const chips = useMemo(
    () => ['Todos', ...Array.from(new Set(products.map((product) => product.group)))],
    [products],
  )
  const filtered = products.filter((product) => active === 'Todos' || product.group === active)

  return (
    <main className="site-shell projects-page">
      <header className="site-header wrap">
        <Link to="/" className="brand">
          <img className="brand-logo" src={LOGO} alt="Dcribioshop" />
        </Link>
        <a
          className="whatsapp-button"
          href={`https://wa.me/${SITE.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsappClick('projetos-header')}
        >
          <MessageCircle size={18} />
          <span>Fale no WhatsApp</span>
        </a>
      </header>
      <div className="wrap">
        <Link to="/" className="back-link">
          <ArrowLeft size={17} /> Voltar ao início
        </Link>
        <div className="section-title">
          <h1>
            PROJETOS <em>REALIZADOS</em>
          </h1>
          <span />
        </div>
        <p className="projects-intro">
          Personalizações que já saíram da nossa produção — cada foto é um trabalho entregue.
        </p>
        <div className="group-chips projects-chips">
          {chips.map((chip) => (
            <button type="button" key={chip} className={chip === active ? 'active' : ''} onClick={() => setActive(chip)}>
              {chip}
            </button>
          ))}
        </div>
        <div className="projects-grid">
          {filtered.map((product) => (
            <Link
              key={product.name + product.image}
              to={`/produto/${productSlug(product)}`}
              className="project-item"
              aria-label={`Solicitar orçamento de ${product.name}`}
            >
              <img src={product.image} alt={`${product.name} personalizado`} loading="lazy" width={511} height={447} />
              <strong>{product.name}</strong>
            </Link>
          ))}
        </div>

        <section className="projects-cta">
          <h2>
            QUER O SEU PROJETO <em>ASSIM?</em>
          </h2>
          <p>Conte o que precisa e produzimos com a sua marca.</p>
          <a
            className="action-button"
            href={`https://wa.me/${SITE.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsappClick('projetos-cta')}
          >
            <MessageCircle size={18} />
            SOLICITAR ORÇAMENTO
          </a>
        </section>
      </div>
    </main>
  )
}
