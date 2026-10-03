import { useEffect, useState } from 'react'
import { Send, X } from 'lucide-react'
import { SITE } from '../data.js'

const FIELDS = [
  ['name', 'Nome', 'Seu nome', 'text'],
  ['company', 'Empresa', 'Nome da empresa', 'text'],
  ['phone', 'WhatsApp', '(00) 00000-0000', 'tel'],
  ['email', 'E-mail', 'voce@empresa.com', 'email'],
  ['product', 'Produto / categoria', 'Ex.: Canecas e Copos', 'text'],
  ['quantity', 'Quantidade estimada', 'Ex.: 100 unidades', 'text'],
]

function validate(values) {
  const errors = {}
  if (!values.name || values.name.length < 2 || values.name.length > 80) errors.name = 'Informe seu nome.'
  if (values.company && values.company.length > 100) errors.company = 'Máximo de 100 caracteres.'
  if (!values.phone || values.phone.length < 10 || values.phone.length > 20) errors.phone = 'Informe um WhatsApp válido.'
  if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) || values.email.length > 120)
    errors.email = 'Informe um e-mail válido.'
  if (!values.product || values.product.length < 2) errors.product = 'Selecione um produto.'
  if (!values.quantity || values.quantity.length < 1) errors.quantity = 'Informe a quantidade.'
  if (values.message && values.message.length > 800) errors.message = 'Máximo de 800 caracteres.'
  return errors
}

export default function QuoteModal({ open, product, onClose }) {
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (event) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const onSubmit = (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    const found = validate(data)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      return
    }
    setErrors({})
    setSubmitted(true)
    const message = `Olá, ${SITE.name}! Gostaria de solicitar um orçamento.\n\nNome: ${data.name}\nEmpresa: ${
      data.company || 'Não informada'
    }\nWhatsApp: ${data.phone}\nE-mail: ${data.email}\nProduto: ${data.product}\nQuantidade estimada: ${
      data.quantity
    }\nMensagem: ${data.message || 'Sem observações'}`
    window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    window.setTimeout(() => setSubmitted(false), 700)
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="quote-title">
        <div className="modal-head">
          <div>
            <span className="eyebrow">FALE COM NOSSA EQUIPE</span>
            <h2 id="quote-title">SOLICITAR ORÇAMENTO</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Fechar">
            <X />
          </button>
        </div>
        <form onSubmit={onSubmit} noValidate>
          <div className="form-grid">
            {FIELDS.map(([fieldName, label, placeholder, type]) => (
              <label key={fieldName}>
                {label}
                <input
                  name={fieldName}
                  type={type}
                  defaultValue={fieldName === 'product' ? product : ''}
                  placeholder={placeholder}
                  aria-invalid={!!errors[fieldName]}
                />
                {errors[fieldName] && <small>{errors[fieldName]}</small>}
              </label>
            ))}
          </div>
          <label>
            Mensagem
            <textarea name="message" rows={3} placeholder="Conte um pouco sobre o que você precisa." />
          </label>
          <button type="submit" disabled={submitted} className="action-button modal-submit">
            <Send size={18} />
            {submitted ? 'ABRINDO WHATSAPP...' : 'ENVIAR PELO WHATSAPP'}
          </button>
        </form>
      </section>
    </div>
  )
}
