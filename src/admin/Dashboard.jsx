import { useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import './admin.css'

const PERIODS = [
  ['today', 'Hoje'],
  ['7', 'Últimos 7 dias'],
  ['30', 'Últimos 30 dias'],
  ['custom', 'Personalizado'],
]

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

function enumerateDays(fromISO, toISO) {
  const out = []
  const start = new Date(fromISO)
  const end = new Date(toISO)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  for (let d = new Date(start); d <= end && out.length < 92; d.setDate(d.getDate() + 1)) {
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

function Bars({ title, data, emptyLabel }) {
  const max = Math.max(1, ...data.map(([, value]) => value))
  return (
    <div className="admin-panel">
      <h2>{title}</h2>
      {data.length === 0 ? (
        <p style={{ color: 'var(--muted-foreground)', fontSize: '.8rem' }}>{emptyLabel}</p>
      ) : (
        <div className="bars">
          {data.map(([label, value]) => (
            <div className="bar-row" key={label}>
              <span>{label}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(value / max) * 100}%` }} />
              </div>
              <strong style={{ color: 'var(--foreground)' }}>{value}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Trend({ title, series }) {
  const max = Math.max(1, ...series.map((d) => d.value))
  const step = series.length > 32 ? Math.ceil(series.length / 16) : series.length > 16 ? 2 : 1
  return (
    <div className="admin-panel">
      <h2>{title}</h2>
      {series.length === 0 ? (
        <p style={{ color: 'var(--muted-foreground)', fontSize: '.8rem' }}>Sem dados no período.</p>
      ) : (
        <div className="trend">
          {series.map((day, index) => (
            <div className="trend-col" key={day.date} title={`${day.date}: ${day.value}`}>
              <div className="trend-bar" style={{ height: `${Math.max(2, (day.value / max) * 100)}%` }} />
              <small>{index % step === 0 ? day.label : ''}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [period, setPeriod] = useState('7')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { fromISO, toISO } = useMemo(() => {
    if (period === 'today') return { fromISO: startOfToday().toISOString(), toISO: new Date().toISOString() }
    if (period === '7') return { fromISO: daysAgo(6).toISOString(), toISO: new Date().toISOString() }
    if (period === '30') return { fromISO: daysAgo(29).toISOString(), toISO: new Date().toISOString() }
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : daysAgo(29)
    const to = toDate ? new Date(`${toDate}T23:59:59`) : new Date()
    return { fromISO: from.toISOString(), toISO: to.toISOString() }
  }, [period, fromDate, toDate])

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      setError('Supabase não configurado.')
      return
    }
    let active = true
    setLoading(true)
    supabase
      .from('events')
      .select('*')
      .gte('created_at', fromISO)
      .lte('created_at', toISO)
      .order('created_at', { ascending: true })
      .limit(5000)
      .then(({ data, error: err }) => {
        if (!active) return
        if (err) {
          setError(
            err.message.includes('does not exist')
              ? 'A tabela "events" ainda não existe. Execute o SQL em supabase/migrations/0001_init.sql.'
              : err.message,
          )
          setEvents([])
        } else {
          setError('')
          setEvents(data || [])
        }
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [fromISO, toISO])

  const clearMetrics = async () => {
    if (!isSupabaseConfigured || !supabase) return
    if (!window.confirm('Apagar TODAS as métricas registradas? Esta ação não pode ser desfeita.')) return
    const { error: err } = await supabase.from('events').delete().gte('id', 0)
    if (err) {
      setError(err.message)
      return
    }
    setError('')
    setEvents([])
  }

  const stats = useMemo(() => {
    const pageViews = events.filter((e) => e.event_type === 'page_view')
    const humans = pageViews.filter((e) => e.classification === 'human').length
    const bots = pageViews.filter((e) => e.classification === 'bot').length
    const unknown = pageViews.filter((e) => e.classification === 'unknown').length
    // Visitas não contam bots/crawlers (que inflavam o número com acessos automatizados).
    const totalVisits = pageViews.filter((e) => e.classification !== 'bot').length
    const whatsappClicks = events.filter((e) => e.event_type === 'whatsapp_click').length
    const cartAdds = events.filter((e) => e.event_type === 'cart_add')
    const cartWhatsapp = events.filter((e) => e.event_type === 'cart_whatsapp')
    const selectedTotal = cartAdds.reduce((sum, e) => sum + (e.quantity || 1), 0)

    const humanPct = totalVisits ? Math.round((humans / totalVisits) * 100) : 0
    const botPct = totalVisits ? Math.round((bots / totalVisits) * 100) : 0

    const countBy = (rows, key) => {
      const map = new Map()
      rows.forEach((row) => {
        const value = row[key] || '—'
        map.set(value, (map.get(value) || 0) + 1)
      })
      return [...map.entries()].sort((a, b) => b[1] - a[1])
    }

    const topSelected = (() => {
      const map = new Map()
      cartAdds.forEach((e) => {
        const name = e.product_name || '—'
        map.set(name, (map.get(name) || 0) + (e.quantity || 1))
      })
      return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
    })()

    const topWhatsapp = (() => {
      const map = new Map()
      cartWhatsapp.forEach((e) => {
        const name = e.product_name || '—'
        const entry = map.get(name) || { qty: 0, count: 0 }
        entry.qty += e.quantity || 1
        entry.count += 1
        map.set(name, entry)
      })
      return [...map.entries()]
        .map(([name, value]) => ({ name, ...value }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    })()

    const days = enumerateDays(fromISO, toISO)
    const byDay = (type, predicate) => {
      const map = new Map()
      events
        .filter((e) => e.event_type === type && (!predicate || predicate(e)))
        .forEach((e) => {
          const key = (e.created_at || '').slice(0, 10)
          map.set(key, (map.get(key) || 0) + 1)
        })
      return days.map((date) => ({
        date,
        label: date.slice(8, 10),
        value: map.get(date) || 0,
      }))
    }

    return {
      totalVisits,
      humans,
      bots,
      unknown,
      humanPct,
      botPct,
      whatsappClicks,
      cartAddsCount: cartAdds.length,
      selectedTotal,
      devices: countBy(pageViews, 'device_type'),
      systems: countBy(pageViews, 'os'),
      browsers: countBy(pageViews, 'browser'),
      topSelected,
      topWhatsapp,
      visitsSeries: byDay('page_view', (e) => e.classification !== 'bot'),
      clickSeries: byDay('whatsapp_click'),
    }
  }, [events, fromISO, toISO])

  const periodLabel = PERIODS.find(([key]) => key === period)?.[1] || ''

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Dashboard</h1>
          <p>
            Período analisado: <strong>{periodLabel}</strong> ({fromISO.slice(0, 10)} a {toISO.slice(0, 10)})
          </p>
        </div>
        <div className="admin-filters">
          {PERIODS.map(([key, label]) => (
            <button
              key={key}
              className={`btn${period === key ? ' active' : ''}`}
              onClick={() => setPeriod(key)}
            >
              {label}
            </button>
          ))}
          {period === 'custom' && (
            <>
              <input className="admin-input" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ width: 'auto' }} />
              <input className="admin-input" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ width: 'auto' }} />
            </>
          )}
          <button className="btn btn-danger" type="button" onClick={clearMetrics}>
            Limpar métricas
          </button>
        </div>
      </div>

      {error && <div className="admin-alert error">{error}</div>}
      {loading && <p style={{ color: 'var(--muted-foreground)' }}>Carregando métricas…</p>}

      <div className="admin-cards">
        <div className="admin-card">
          <span>Visitas</span>
          <strong>{stats.totalVisits}</strong>
          <small>sem bots/crawlers</small>
        </div>
        <div className="admin-card">
          <span>Visitantes humanos</span>
          <strong>{stats.humans}</strong>
          <small>{stats.humanPct}% (estimado)</small>
        </div>
        <div className="admin-card">
          <span>Bots / crawlers</span>
          <strong>{stats.bots}</strong>
          <small>{stats.botPct}% · {stats.unknown} indeterminados</small>
        </div>
        <div className="admin-card">
          <span>Cliques no WhatsApp</span>
          <strong>{stats.whatsappClicks}</strong>
          <small>ações registradas</small>
        </div>
        <div className="admin-card">
          <span>Produtos selecionados</span>
          <strong>{stats.selectedTotal}</strong>
          <small>itens adicionados ({stats.cartAddsCount} seleções)</small>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Visitas ao site</h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '.72rem', marginTop: -8 }}>
          Classificação de tráfego por sinais técnicos (user-agent, crawlers conhecidos, indicadores de automação). Quando
          não há sinal suficiente, o acesso é marcado como indeterminado.
        </p>
      </div>
      <Trend title="Visitas por dia" series={stats.visitsSeries} />
      <Trend title="Cliques no WhatsApp por dia" series={stats.clickSeries} />

      <div className="admin-charts">
        <Bars title="Dispositivos" data={stats.devices} emptyLabel="Sem dados no período." />
        <Bars title="Sistemas operacionais" data={stats.systems} emptyLabel="Sem dados no período." />
        <Bars title="Navegadores" data={stats.browsers} emptyLabel="Sem dados no período." />
      </div>

      <div className="admin-panel">
        <h2>Produtos mais selecionados (adicionados ao carrinho)</h2>
        {stats.topSelected.length === 0 ? (
          <p style={{ color: 'var(--muted-foreground)', fontSize: '.8rem' }}>Sem seleções no período.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Produto</th>
                  <th>Seleções</th>
                </tr>
              </thead>
              <tbody>
                {stats.topSelected.map(([name, count], index) => (
                  <tr key={name}>
                    <td>{index + 1}</td>
                    <td>{name}</td>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-panel">
        <h2>Produtos mais requisitados via WhatsApp</h2>
        {stats.topWhatsapp.length === 0 ? (
          <p style={{ color: 'var(--muted-foreground)', fontSize: '.8rem' }}>
            Nenhum pedido iniciado pelo WhatsApp no período.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Produto</th>
                  <th>Qtd. selecionada</th>
                  <th>Em pedidos</th>
                </tr>
              </thead>
              <tbody>
                {stats.topWhatsapp.map((row, index) => (
                  <tr key={row.name}>
                    <td>{index + 1}</td>
                    <td>{row.name}</td>
                    <td>{row.qty}</td>
                    <td>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p style={{ color: 'var(--muted-foreground)', fontSize: '.72rem', marginTop: 10 }}>
          Estes números representam seleções/pedidos iniciados pelo usuário, e não vendas confirmadas.
        </p>
      </div>
    </>
  )
}
