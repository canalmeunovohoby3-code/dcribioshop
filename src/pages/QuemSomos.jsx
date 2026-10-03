import { Link } from 'react-router-dom'
import { ArrowLeft, Building2, Camera, Factory, MessageCircle, Palette, Truck } from 'lucide-react'
import { Youtube } from '../components/icons.jsx'
import { FACTORY_IMAGE, LOGO, SITE, VIDEO } from '../data.js'
import { trackWhatsappClick } from '../lib/metrics.js'

const STATS = [
  { icon: Building2, value: '+1.500', label: 'Empresas atendidas' },
  { icon: Palette, value: '+250 mil', label: 'Personalizações realizadas' },
  { icon: Factory, value: '40', label: 'Anos de mercado' },
  { icon: Truck, value: 'Todo o Brasil', label: 'Envio rápido e seguro' },
]

const HISTORY = [
  'Nossa empresa começou no final de novembro de 1985 como ateliê fazendo Silkscreen, pintura a pincel, tinta esmalte sintético e PVA à base d’água. Chegamos a fazer letreiros em muros e carros, porque não existia adesivo digital e nem plotters, só existia adesivo preto fosco, transparente, branco leitoso e adesivo em papel.',
  'Todas as artes finais eram feitas à caneta, abastecida com tinta nanquim e filme de recorte, daí que surgiu a DECRIBIO, que significava: Decoração e Criação de Bio, que no caso Bio vem de Severino, meu nome. Décadas depois mudamos para Distribuidora e ficou Dcribio, onde o D passa a dar sentido à palavra distribuidora.',
  'Então, nesta mesma época, entramos no mercado de calçados com a marca IMPACTO. Fez o maior sucesso, mas no início dos anos 2000 trocamos a área de atuação da Impacto, de calçados para a área de Comunicação e Marketing. Assim nasceu a nova marca Sandália NEON. Depois de 4 anos e até hoje, é uma das marcas fortes e está a todo vapor e melhor, sem concorrentes.',
  'A Persomacdobrasil atua na área dos adesivos para máquinas pesadas, tratores, implementos agrícolas, qualquer emblema e adesivos de automóveis antigos — que já não têm peças no mercado —, como lançamentos. Ainda não tem esse tipo de produto no mercado. E ainda vem muita coisa por aí; logo terão novas notícias nossas.',
]

export default function QuemSomos() {
  return (
    <main className="site-shell about-page">
      <header className="site-header wrap">
        <Link to="/" className="brand">
          <img className="brand-logo" src={LOGO} alt="Dcribioshop" />
        </Link>
        <a
          className="whatsapp-button"
          href={`https://wa.me/${SITE.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsappClick('quem-somos-header')}
        >
          <MessageCircle size={18} />
          <span>Fale no WhatsApp</span>
        </a>
      </header>
      <div className="wrap">
        <Link to="/" className="back-link">
          <ArrowLeft size={17} /> Voltar ao início
        </Link>
        <section className="about-hero">
          <div>
            <span className="eyebrow">Sobre nós</span>
            <h1 id="history-title">
              NOSSA <em>HISTÓRIA</em>
            </h1>
            <p>Desde novembro de 1985, transformando ideias em realidade.</p>
            <section className="about-history" aria-labelledby="history-title">
              {HISTORY.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </section>
          </div>
          <video className="about-video" src={`${VIDEO}#t=0.1`} controls playsInline preload="auto" />
        </section>

        <section className="projects-teaser" aria-labelledby="youtube-title">
          <span className="eyebrow">Nosso canal no YouTube</span>
          <h2 id="youtube-title">
            CONHEÇA MAIS A <em>DCRIBIOSHOP</em>
          </h2>
          <p>Acompanhe nosso canal e conheça mais sobre a empresa e nossos trabalhos.</p>
          <a
            className="action-button"
            href="https://www.youtube.com/@dcribioshop7976"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Youtube size={18} />
            CONHECER NOSSO CANAL
          </a>
        </section>

        <section className="about-stats">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label}>
              <Icon size={30} />
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        <section className="about-factory">
          <img src={FACTORY_IMAGE} alt="Estrutura de produção da Dcribioshop" />
          <div>
            <span className="eyebrow">Nossa fábrica</span>
            <h2>
              ONDE A SUA MARCA <em>GANHA FORMA</em>
            </h2>
            <p>
              Contamos com impressoras de grande formato, prensas de sublimação, plotters de recorte e uma equipe
              experiente pronta para produzir do pequeno ao grande volume.
            </p>
            <a
              className="action-button"
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsappClick('quem-somos-fabrica')}
            >
              <MessageCircle size={18} />
              SOLICITAR ORÇAMENTO
            </a>
            <Link to="/projetos" className="action-button ghost-button">
              <Camera size={18} />
              VER PROJETOS REALIZADOS
            </Link>
          </div>
        </section>

        <section className="projects-teaser">
          <span className="eyebrow">Projetos realizados</span>
          <h2>
            VEJA O QUE JÁ <em>PRODUZIMOS</em>
          </h2>
          <p>
            Personalizações entregues para empresas de todo o Brasil — brindes, adesivos, sinalização e muito mais.
          </p>
          <Link to="/projetos" className="action-button">
            <Camera size={18} />
            VER FOTOS DOS PROJETOS
          </Link>
        </section>
      </div>
    </main>
  )
}
