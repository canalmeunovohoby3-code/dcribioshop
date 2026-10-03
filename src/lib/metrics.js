import { isSupabaseConfigured, supabase } from './supabase.js'

const BOT_RE =
  /(bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|applebot|ahrefs|semrush|mj12|dotbot|petalbot|yandex|baidu|duckduck|sogou|exabot|ia_archiver|archive\.org|headlesschrome|puppeteer|playwright|phantomjs|lighthouse|pagespeed|gtmetrix|pingdom|uptimerobot|python-requests|python-urllib|curl|wget|go-http-client|axios|node-fetch|okhttp|java\/|libwww|scrapy|httpclient|apachebench|monitoring)/i

export function parseUserAgent(ua = '') {
  const isTablet =
    /iPad/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) || /Tablet|PlayBook|Silk/i.test(ua)
  const isMobile = !isTablet && /Mobi|Android|iPhone|iPod|Windows Phone|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua)
  const device_type = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'

  let os = 'Outros'
  if (/Windows NT/i.test(ua)) os = 'Windows'
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS'
  else if (/Android/i.test(ua)) os = 'Android'
  else if (/Mac OS X|Macintosh/i.test(ua)) os = 'macOS'
  else if (/CrOS/i.test(ua)) os = 'ChromeOS'
  else if (/Linux/i.test(ua)) os = 'Linux'

  let browser = 'Outros'
  if (/Edg\//i.test(ua)) browser = 'Edge'
  else if (/OPR\/|Opera/i.test(ua)) browser = 'Opera'
  else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Internet'
  else if (/Chrome\/|CriOS/i.test(ua)) browser = 'Chrome'
  else if (/Firefox\/|FxiOS/i.test(ua)) browser = 'Firefox'
  else if (/Safari\//i.test(ua)) browser = 'Safari'

  return { device_type, os, browser }
}

export function classifyTraffic(ua = '') {
  const parsed = parseUserAgent(ua)
  const nav = typeof navigator !== 'undefined' ? navigator : {}
  const screen = typeof window !== 'undefined' ? window.screen : undefined

  const looksLikeBot =
    !ua || BOT_RE.test(ua) || nav.webdriver === true || /Headless/i.test(ua)

  if (looksLikeBot) {
    return { ...parsed, is_bot: true, classification: 'bot' }
  }

  const hasHumanSignals =
    (nav.languages && nav.languages.length > 0) ||
    !!nav.platform ||
    (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency > 0) ||
    (screen && screen.width > 0 && screen.height > 0)

  if (!hasHumanSignals) {
    return { ...parsed, is_bot: false, classification: 'unknown' }
  }

  return { ...parsed, is_bot: false, classification: 'human' }
}

function baseEvent(eventType, payload = {}) {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const info = classifyTraffic(ua)
  return {
    event_type: eventType,
    path: typeof location !== 'undefined' ? location.pathname : null,
    user_agent: ua,
    referrer: typeof document !== 'undefined' && document.referrer ? document.referrer : null,
    ...info,
    ...payload,
  }
}

function isAdminDevice() {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem('dcribioshop-admin') === '1'
  } catch {
    return false
  }
}

export function track(eventType, payload = {}) {
  if (!isSupabaseConfigured || !supabase) return
  // Não conta acessos do próprio admin (evita métricas "fantasma" após relogar/limpar).
  if (isAdminDevice()) return
  try {
    supabase
      .from('events')
      .insert(baseEvent(eventType, payload))
      .then(
        () => {},
        () => {},
      )
  } catch {
    /* métricas nunca devem quebrar o site */
  }
}

export function trackMany(rows) {
  if (!isSupabaseConfigured || !supabase || !rows.length) return
  if (isAdminDevice()) return
  try {
    supabase
      .from('events')
      .insert(rows.map((row) => baseEvent(row.event_type, row)))
      .then(
        () => {},
        () => {},
      )
  } catch {
    /* ignore */
  }
}

let lastView = { path: null, at: 0 }

export function trackPageView(path) {
  if (!path) return
  const now = Date.now()
  if (lastView.path === path && now - lastView.at < 2000) return
  lastView = { path, at: now }
  track('page_view')
}

export function trackWhatsappClick(source) {
  track('whatsapp_click', { product_name: source })
}

export function trackCartAdd(product, quantity) {
  track('cart_add', {
    product_slug: product.slug,
    product_name: product.name,
    quantity: quantity || 1,
  })
}

export function trackCartWhatsapp(items) {
  trackMany(
    items.map((item) => ({
      event_type: 'cart_whatsapp',
      product_slug: item.slug,
      product_name: item.name,
      quantity: item.qty,
    })),
  )
}
