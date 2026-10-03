import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import { PRODUCTS } from '../data.js'
import './admin.css'

const CATEGORIES = Array.from(new Set(PRODUCTS.map((product) => product.group))).sort()
const TABS = [
  ['brindes', 'Brindes Personalizados'],
  ['adesivos', 'Adesivos e Sinalização'],
  ['maquinas', 'Máquinas e Equipamentos'],
]

export default function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [tab, setTab] = useState('')
  const [busy, setBusy] = useState(null)

  const load = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      setError('Supabase não configurado.')
      return
    }
    setLoading(true)
    const { data, error: err } = await supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (err) {
      setError(
        err.message.includes('does not exist')
          ? 'A tabela "products" ainda não existe. Execute o SQL de supabase/migrations/0001_init.sql.'
          : err.message,
      )
      setProducts([])
    } else {
      setError('')
      setProducts(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        if (category && product.category !== category) return false
        if (tab && product.tab !== tab) return false
        if (search && !product.name.toLowerCase().includes(search.trim().toLowerCase())) return false
        return true
      }),
    [products, category, tab, search],
  )

  const togglePublish = async (product) => {
    setBusy(product.id)
    const { error: err } = await supabase
      .from('products')
      .update({ published: !product.published })
      .eq('id', product.id)
    setBusy(null)
    if (err) {
      setError(err.message)
      return
    }
    await load()
  }

  const remove = async (product) => {
    if (!window.confirm(`Excluir "${product.name}"? Esta ação não pode ser desfeita.`)) return
    setBusy(product.id)
    const { error: err } = await supabase.from('products').delete().eq('id', product.id)
    setBusy(null)
    if (err) {
      setError(err.message)
      return
    }
    await load()
  }

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Produtos</h1>
          <p>{products.length} produtos na base. As alterações aparecem no site automaticamente.</p>
        </div>
        <Link className="btn btn-primary" to="/admin/produtos/novo">
          + Novo produto
        </Link>
      </div>

      {error && <div className="admin-alert error">{error}</div>}

      <div className="admin-panel">
        <div className="admin-filters" style={{ marginBottom: 16 }}>
          <input
            className="admin-input"
            placeholder="Pesquisar por nome…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ maxWidth: 280 }}
          />
          <select className="admin-select" value={category} onChange={(event) => setCategory(event.target.value)} style={{ maxWidth: 220 }}>
            <option value="">Todas as categorias</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select className="admin-select" value={tab} onChange={(event) => setTab(event.target.value)} style={{ maxWidth: 220 }}>
            <option value="">Todas as abas</option>
            {TABS.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p style={{ color: 'var(--muted-foreground)' }}>Carregando…</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Imagem</th>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Aba</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id}>
                    <td>
                      {product.image ? <img src={product.image} alt="" /> : <span className="admin-badge">sem foto</span>}
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{TABS.find(([key]) => key === product.tab)?.[1] || product.tab}</td>
                    <td>
                      <span className={`admin-badge${product.published ? ' on' : ''}`}>
                        {product.published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <Link className="btn btn-ghost" to={`/admin/produtos/${product.id}`}>
                          Editar
                        </Link>
                        <button className="btn btn-ghost" onClick={() => togglePublish(product)} disabled={busy === product.id}>
                          {product.published ? 'Despublicar' : 'Publicar'}
                        </button>
                        <button className="btn btn-danger" onClick={() => remove(product)} disabled={busy === product.id}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ color: 'var(--muted-foreground)' }}>
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
