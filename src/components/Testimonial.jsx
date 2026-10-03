import { Star } from 'lucide-react'

export default function Testimonial({ name, since, children, photo }) {
  return (
    <article className="testimonial">
      <img className="avatar" src={photo} alt={`Foto de ${name}`} loading="lazy" width={48} height={48} />
      <div>
        <div className="stars" aria-label="5 estrelas">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} size={14} fill="currentColor" />
          ))}
        </div>
        <p>“{children}”</p>
        <strong>{name}</strong>
        <small>Cliente desde {since}</small>
      </div>
    </article>
  )
}
