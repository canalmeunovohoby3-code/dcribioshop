import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { LOGO, PRODUCTS, SITE } from '../data.js'
import { productSlug } from '../lib/slug.js'

const CHIPS = ['Todos', ...Array.from(new Set(PRODUCTS.map((product) => product.group)))]

export default function Projetos() {
  const [active, setActive] = useState('Todos')
  const filtered = PRODUCTS.filter((product) => active === 'Todos' || product.group === active)

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
          {CHIPS.map((chip) => (
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
          >
            <MessageCircle size={18} />
            SOLICITAR ORÇAMENTO
          </a>
        </section>
      </div>
    </main>
  )
}
