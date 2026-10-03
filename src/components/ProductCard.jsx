import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { productSlug } from '../lib/slug.js'

export default function ProductCard({ title, image, slug, onQuote, catalog = false }) {
  const navigate = useNavigate()

  const handle = () => {
    if (catalog) {
      navigate(`/produto/${slug || productSlug({ name: title, image })}`)
    } else {
      onQuote(title)
    }
  }

  return (
    <article
      className="product-card"
      onClick={handle}
      tabIndex={0}
      onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && handle()}
    >
      <img
        src={image}
        alt={catalog ? `${title} personalizado Dcribioshop` : `Linha de ${title.toLowerCase()} personalizados`}
        loading="lazy"
        width={976}
        height={672}
      />
      <div className="product-info">
        <strong>{title}</strong>
        <button type="button" aria-label={`Solicitar orçamento para ${title}`}>
          <span>
            <ChevronRight size={14} />
          </span>{' '}
          {catalog ? 'Ver produto' : 'Solicitar orçamento'}
        </button>
      </div>
    </article>
  )
}
