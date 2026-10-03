import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Headphones,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  PackageCheck,
  PenTool,
  ShieldCheck,
  Truck,
  X,
} from 'lucide-react'
import { Instagram } from '../components/icons.jsx'
import '../sections.css'
import Brand from '../components/Brand.jsx'
import ActionButton from '../components/ActionButton.jsx'
import CartButton from '../components/CartButton.jsx'
import CartDrawer from '../components/CartDrawer.jsx'
import QuoteModal from '../components/QuoteModal.jsx'
import ProductCard from '../components/ProductCard.jsx'
import Testimonial from '../components/Testimonial.jsx'
import {
  BANNERS,
  BENEFITS,
  GROUP_MENU,
  GROUPS,
  MACHINES,
  MENU,
  PRODUCT_LINE_IMAGES,
  PRODUCTS,
  SITE,
  TESTIMONIALS,
  VIDEO,
} from '../data.js'

const TAB_ICONS = [PackageCheck, ShieldCheck, PenTool]
const TABS = [
  ['brindes', 'Brindes Personalizados'],
  ['adesivos', 'Adesivos e Sinalização'],
  ['maquinas', 'Máquinas e Equipamentos'],
]
const BENEFIT_ICONS = { truck: Truck, 'pen-tool': PenTool, headphones: Headphones }

const MAP_SRC = `https://www.google.com/maps?q=${encodeURIComponent(SITE.address)}&z=16&output=embed`
const PAYMENTS = [
  ['/payment/visa.svg', 'Visa'],
  ['/payment/mastercard.svg', 'Mastercard'],
  ['/payment/elo.svg', 'Elo'],
  ['/payment/amex.svg', 'American Express'],
  ['/payment/hipercard.svg', 'Hipercard'],
]

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [quoteProduct, setQuoteProduct] = useState('Brindes personalizados')
  const [activeTab, setActiveTab] = useState('brindes')
  const [activeGroup, setActiveGroup] = useState('Todos')
  const [bannerIndex, setBannerIndex] = useState(0)
  const [bannerPaused, setBannerPaused] = useState(false)
  const location = useLocation()

  const tabProducts = PRODUCTS.filter((product) => product.tab === activeTab)
  const groups = ['Todos', ...Array.from(new Set(tabProducts.map((product) => product.group)))]
  const filtered = tabProducts.filter((product) => activeGroup === 'Todos' || product.group === activeGroup)
  const sections = Array.from(new Set(filtered.map((product) => product.group))).map((category) => ({
    category,
    products: filtered.filter((product) => product.group === category),
  }))

  useEffect(() => {
    if (bannerPaused) return
    const id = window.setInterval(() => setBannerIndex((index) => (index + 1) % BANNERS.length), 5500)
    return () => window.clearInterval(id)
  }, [bannerPaused])

  useEffect(() => {
    if (!location.hash) return
    document.getElementById(location.hash.slice(1))?.scrollIntoView()
  }, [location])

  const banner = BANNERS[bannerIndex] ?? BANNERS[0]

  const openQuote = (product = 'Brindes personalizados') => {
    setQuoteProduct(product)
    setQuoteOpen(true)
  }

  const goTo = (id) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const selectGroup = (tab, group) => {
    setActiveTab(tab)
    setActiveGroup(group)
    document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="site-shell">
      <section
        className="hero hero-banners"
        id="inicio"
        aria-roledescription="carrossel"
        aria-label="Campanhas em destaque"
        onMouseEnter={() => setBannerPaused(true)}
        onMouseLeave={() => setBannerPaused(false)}
      >
        <header className="site-header wrap">
          <div className="header-left">
            <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
              <Menu />
            </button>
            <Brand />
          </div>
          <div className="header-right">
            <CartButton onClick={() => setCartOpen(true)} />
            <ActionButton onClick={() => openQuote()} className="whatsapp-top">
              <MessageCircle size={20} />
              <span>Fale no WhatsApp</span>
              <ChevronRight size={18} />
            </ActionButton>
          </div>
        </header>
        <h1 className="hero-banner-heading">Dcribioshop — brindes personalizados, adesivos e sinalização</h1>
        <button
          type="button"
          className="hero-banner hero-slide-enter"
          onClick={() => openQuote(banner.product)}
          aria-label={`Solicitar orçamento: ${banner.product}`}
          key={banner.image}
        >
          <img
            src={banner.image}
            alt={banner.alt}
            width={1920}
            height={650}
            fetchPriority={bannerIndex === 0 ? 'high' : 'auto'}
          />
        </button>
        <div className="hero-controls wrap">
          <button
            type="button"
            className="hero-arrow"
            aria-label="Banner anterior"
            onClick={() => setBannerIndex((index) => (index - 1 + BANNERS.length) % BANNERS.length)}
          >
            <ChevronLeft />
          </button>
          <div className="hero-dots">
            {BANNERS.map((item, index) => (
              <button
                key={item.image}
                type="button"
                className={index === bannerIndex ? 'active' : ''}
                aria-label={`Mostrar banner ${index + 1}`}
                aria-current={index === bannerIndex ? 'true' : undefined}
                onClick={() => setBannerIndex(index)}
              />
            ))}
          </div>
          <button
            type="button"
            className="hero-arrow"
            aria-label="Próximo banner"
            onClick={() => setBannerIndex((index) => (index + 1) % BANNERS.length)}
          >
            <ChevronRight />
          </button>
        </div>
      </section>

      <div className="wrap benefits" aria-label="Diferenciais">
        {BENEFITS.map(([icon, title, subtitle], index) => {
          const Icon = BENEFIT_ICONS[icon]
          return (
            <div className="benefit" key={title}>
              <Icon className="benefit-icon" />
              <div>
                <strong>{title}</strong>
                <span>{subtitle}</span>
              </div>
              {index < 2 && <i />}
            </div>
          )
        })}
      </div>

      <section className="products-section wrap" id="produtos">
        <div className="section-title">
          <h2>
            NOSSOS <em>PRODUTOS</em>
          </h2>
          <span />
        </div>
        <div className="tabs" role="tablist">
          {TABS.map(([key, label], index) => {
            const Icon = TAB_ICONS[index]
            return (
              <button
                key={key}
                role="tab"
                aria-selected={activeTab === key}
                className={activeTab === key ? 'active' : ''}
                onClick={() => {
                  setActiveTab(key)
                  setActiveGroup('Todos')
                }}
              >
                <Icon size={21} />
                {label}
              </button>
            )
          })}
        </div>
        {tabProducts.length > 0 && groups.length > 2 && (
          <div className="group-chips">
            {groups.map((group) => (
              <button
                type="button"
                key={group}
                className={group === activeGroup ? 'active' : ''}
                onClick={() => setActiveGroup(group)}
              >
                {group}
              </button>
            ))}
          </div>
        )}
        {activeTab === 'maquinas' ? (
          <section className="machine-projects" aria-labelledby="machine-projects-title">
            <h3 className="catalog-category-title" id="machine-projects-title">
              Máquinas que já adesivamos
            </h3>
            <p className="machine-projects-intro">
              Conheça alguns trabalhos de adesivação realizados pela Dcribioshop.
            </p>
            <div className="machine-projects-grid">
              {MACHINES.map((machine) => (
                <figure className="machine-project-card" key={machine.image}>
                  <a
                    href={machine.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ver foto da adesivação: ${machine.name}`}
                  >
                    <img
                      src={machine.image}
                      alt={`Adesivação realizada pela Dcribioshop em máquina ${machine.name}`}
                      width={machine.width}
                      height={machine.height}
                      loading="lazy"
                    />
                  </a>
                  <figcaption>{machine.name}</figcaption>
                </figure>
              ))}
            </div>
            <ActionButton onClick={() => openQuote('Adesivação de máquinas')} className="machine-projects-cta">
              <ClipboardList size={19} />
              Solicitar orçamento de adesivação
              <ChevronRight size={18} />
            </ActionButton>
          </section>
        ) : tabProducts.length > 0 ? (
          <div className="catalog-sections">
            {sections.map((section, index) => (
              <section
                className="catalog-category"
                key={section.category}
                aria-labelledby={`catalog-${activeTab}-${index}`}
              >
                <h3 className="catalog-category-title" id={`catalog-${activeTab}-${index}`}>
                  {section.category}
                </h3>
                <div className="product-grid catalog">
                  {section.products.map((product) => (
                    <ProductCard
                      key={product.name + product.image}
                      title={product.name}
                      image={product.image}
                      onQuote={openQuote}
                      catalog
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {GROUPS[activeTab].map((label, index) => (
              <ProductCard
                key={`${activeTab}-${label}`}
                title={label}
                image={PRODUCT_LINE_IMAGES[index] ?? PRODUCT_LINE_IMAGES[0]}
                onQuote={openQuote}
              />
            ))}
          </div>
        )}
      </section>

      <section className="industrial wrap" id="adesivos">
        <img src="/assets/industrial-machines-BPz_et4X.jpg" alt="Máquinas amarelas com personalização visual" loading="lazy" width={1600} height={720} />
        <div className="industrial-overlay" />
        <div className="industrial-copy">
          <span>ADESIVOS E SINALIZAÇÃO</span>
          <h2>
            SUA MÁQUINA
            <br />
            <em>COM SUA MARCA</em>
          </h2>
          <p>Adesivos personalizados, faixas, identificação e muito mais.</p>
          <ActionButton
            onClick={() => {
              setActiveTab('adesivos')
              goTo('produtos')
            }}
          >
            Ver todos os produtos
            <ChevronRight size={18} />
          </ActionButton>
        </div>
        <div className="partner-board">
          <b>NOVATRAC</b>
          <b>FORZZA</b>
          <b>TERRAMAX</b>
          <b>AXIS</b>
          <small>
            TRABALHAMOS COM
            <br />
            TODAS AS MARCAS
          </small>
        </div>
      </section>

      <section className="testimonials wrap" id="sobre">
        <div className="section-title left">
          <h2>
            CLIENTES QUE <em>CONFIAM</em>
          </h2>
        </div>
        <div className="testimonial-marquee">
          <div className="testimonial-track">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((testimonial, index) => (
              <div
                className="testimonial-slot"
                aria-hidden={index >= TESTIMONIALS.length}
                key={`${testimonial.initials}-${index}`}
              >
                <Testimonial name={testimonial.name} since={testimonial.since} photo={testimonial.photo}>
                  {testimonial.text}
                </Testimonial>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="authority wrap">
        <div className="years">
          <img src="/40-anos.png" alt="40 anos" width={1773} height={887} />
        </div>
        <p>
          Enquanto os outros estão começando,
          <br />
          já temos <strong>{SITE.years} anos de estrada.</strong>
        </p>
        <i />
        <div className="authority-brand">
          <Brand />
          <span>Transformamos sua ideia em realidade.</span>
        </div>
      </section>

      <section className="about-teaser wrap reveal">
        <video src={VIDEO} controls playsInline preload="metadata" />
        <div>
          <span className="eyebrow">Sobre nós</span>
          <h2>
            MUITO MAIS QUE BRINDES, <em>{SITE.years} ANOS DE HISTÓRIA.</em>
          </h2>
          <p>
            Somos a {SITE.name}: produzimos brindes personalizados, adesivos e sinalização com estrutura própria,
            qualidade e atendimento rápido para empresas de todo o Brasil.
          </p>
          <Link to="/quem-somos" className="action-button">
            SABER MAIS <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="store-map wrap" aria-label="Localização da Dcribioshop no Google Maps">
        <div className="section-title">
          <h2>
            ONDE <em>ESTAMOS</em>
          </h2>
          <span />
        </div>
        <div className="map-frame">
          <iframe
            title={`Localização da ${SITE.name} no Google Maps`}
            src={MAP_SRC}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
        <p className="map-address">
          <MapPin size={15} />
          {SITE.address}
        </p>
      </section>

      <footer id="contato">
        <div className="footer-accent" />
        <div className="wrap contact-row">
          <button className="contact-block" onClick={() => openQuote()}>
            <span className="contact-icon">
              <MessageCircle />
            </span>
            <span>
              <strong>WhatsApp</strong>
              <small>{SITE.whatsappDisplay}</small>
            </span>
          </button>
          <a className="contact-block" href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer">
            <span className="contact-icon">
              <Instagram />
            </span>
            <span>
              <strong>Instagram</strong>
              <small>{SITE.instagram}</small>
            </span>
          </a>
          <button className="contact-block">
            <span className="contact-icon">
              <MapPin />
            </span>
            <span>
              <strong>Localização</strong>
              <small>{SITE.address}</small>
            </span>
          </button>
        </div>
        <div className="wrap footer-main">
          <div className="footer-about">
            <Brand />
            <p>
              A {SITE.name} produz brindes personalizados, adesivos, sinalização e identificação visual com{' '}
              {SITE.years} anos de experiência. Fazemos canecas e copos, bonés, chaveiros, canetas, fardamento, placas de
              sinalização e muito mais — do orçamento pelo WhatsApp à entrega rápida para todo o Brasil.
            </p>
            <p className="footer-region">Atendemos Vitória de Santo Antão, Pernambuco, e enviamos para todo o Brasil.</p>
          </div>
          <div>
            <strong>Nossos Produtos</strong>
            <nav aria-label="Produtos no rodapé">
              {GROUP_MENU.map(([tab, label]) => (
                <button key={label} onClick={() => selectGroup(tab, 'Todos')}>
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <div>
            <strong>Institucional</strong>
            <nav aria-label="Institucional no rodapé">
              <Link to="/quem-somos">Sobre nós</Link>
              <Link to="/projetos">Projetos Realizados</Link>
              <button onClick={() => openQuote()}>Solicitar orçamento</button>
              <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer">
                Instagram {SITE.instagram}
              </a>
            </nav>
          </div>
          <div className="footer-contact">
            <strong>Contato</strong>
            <a className="contact-line" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} />
              <span>WhatsApp: {SITE.whatsappDisplay}</span>
            </a>
            <a className="contact-line" href={`mailto:${SITE.email}`}>
              <Mail size={16} />
              <span>{SITE.email}</span>
            </a>
            <span className="contact-line">
              <MapPin size={16} />
              <span>{SITE.address}</span>
            </span>
            <span className="contact-line">
              <Truck size={16} />
              <span>Envio para todo o Brasil</span>
            </span>
            <a className="contact-line" href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer">
              <Instagram size={16} />
              <span>{SITE.instagram}</span>
            </a>
          </div>
        </div>
        <div className="wrap payment-methods">
          <span>Formas de pagamento</span>
          <ul>
            {PAYMENTS.map(([src, alt]) => (
              <li key={alt}>
                <img src={src} alt={alt} width={780} height={500} loading="lazy" />
              </li>
            ))}
          </ul>
        </div>
        <div className="wrap footer-keywords">
          <p>
            {SITE.name} — brindes personalizados, adesivos e sinalização em Vitória de Santo Antão - PE. Fardamento,
            canecas, bonés, chaveiros, canetas, placas de sinalização e identificação visual com envio para todo o
            Brasil. Solicite seu orçamento pelo WhatsApp.
          </p>
        </div>
        <div className="wrap footer-bottom">
          <Brand />
          <nav aria-label="Links do rodapé">
            <button onClick={() => goTo('produtos')}>Produtos</button>
            <Link to="/projetos">Projetos Realizados</Link>
            <Link to="/quem-somos">Sobre nós</Link>
            <button onClick={() => openQuote()}>Orçamentos</button>
            <button>Política de Privacidade</button>
            <button>Redes Sociais</button>
          </nav>
          <span>© 2026 {SITE.name}</span>
        </div>
      </footer>

      <button className="whatsapp-float" onClick={() => openQuote()} aria-label="Falar pelo WhatsApp">
        <MessageCircle />
      </button>

      <div className={`drawer-backdrop ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />
      <aside className={`drawer ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <div className="drawer-head">
          <Brand />
          <button className="icon-button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
            <X />
          </button>
        </div>
        <nav>
          {MENU.map(([label, target]) => (
            <button
              key={label}
              onClick={() => {
                if (label === 'Máquinas e Equipamentos') {
                  setActiveTab('maquinas')
                  setActiveGroup('Todos')
                }
                goTo(target)
              }}
            >
              {label}
              <ArrowRight size={18} />
            </button>
          ))}
          <Link to="/quem-somos" onClick={() => setMenuOpen(false)}>
            Sobre nós
            <ArrowRight size={18} />
          </Link>
          <button
            className="drawer-cta"
            onClick={() => {
              setMenuOpen(false)
              openQuote()
            }}
          >
            Solicitar orçamento
            <ArrowRight size={18} />
          </button>
        </nav>
      </aside>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <QuoteModal open={quoteOpen} product={quoteProduct} onClose={() => setQuoteOpen(false)} />
    </main>
  )
}
