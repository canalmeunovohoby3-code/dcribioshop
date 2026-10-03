import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import { PRODUCTS } from '../data.js'
import { slugify } from '../lib/slug.js'
import { pushUndo } from './undo.js'
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
  const [importing, setImporting] = useState(false)

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
    const previous = product.published
    setBusy(product.id)
    const { error: err } = await supabase
      .from('products')
      .update({ published: !previous })
      .eq('id', product.id)
    setBusy(null)
    if (err) {
      setError(err.message)
      return
    }
    await load()
    pushUndo(async () => {
      await supabase.from('products').update({ published: previous }).eq('id', product.id)
      await load()
    }, `Produto "${product.name}" ${previous ? 'despublicado' : 'publicado'}.`)
  }

  const remove = async (product) => {
    if (!window.confirm(`Excluir "${product.name}"? Você poderá desfazer logo em seguida.`)) return
    setBusy(product.id)
    const { error: err } = await supabase.from('products').delete().eq('id', product.id)
    setBusy(null)
    if (err) {
      setError(err.message)
      return
    }
    await load()
    const row = { ...product }
    delete row.updated_at
    pushUndo(async () => {
      await supabase.from('products').insert(row)
      await load()
    }, `Produto "${product.name}" excluído.`)
  }

  const importStatic = async () => {
    if (!isSupabaseConfigured || !supabase) return
    if (!window.confirm('Importar os produtos que já estão no site para o banco? Produtos com o mesmo identificador não são duplicados.')) return
    setImporting(true)
    setError('')
    const rows = PRODUCTS.map((product, index) => ({
      slug: slugify(product.name, product.image),
      name: product.name,
      description: null,
      image: product.image,
      images: [product.image],
      category: product.group,
      tab: product.tab,
      published: true,
      sort_order: index,
    }))
    const { error: err } = await supabase
      .from('products')
      .upsert(rows, { onConflict: 'slug', ignoreDuplicates: true })
    setImporting(false)
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
        <div className="admin-row-actions">
          <button className="btn" type="button" onClick={importStatic} disabled={importing}>
            {importing ? 'Importando…' : 'Importar produtos do site'}
          </button>
          <Link className="btn btn-primary" to="/admin/produtos/novo">
            + Novo produto
          </Link>
        </div>
      </div>

      {error && <div className="admin-alert error">{error}</div>}

      {!loading && !error && products.length === 0 && (
        <div className="admin-alert info">
          Nenhum produto no banco ainda. Clique em <strong>“Importar produtos do site”</strong> para trazer os produtos
          que já estão publicados no site (não cria duplicados).
        </div>
      )}

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
          <>
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
                        {products.length === 0
                          ? 'Nenhum produto cadastrado. Clique em "Importar produtos do site" ou crie um novo.'
                          : tab === 'maquinas'
                            ? 'Nenhum produto nesta aba. No site esta aba mostra a galeria de máquinas adesivadas; se você criar um produto com esta aba, ele também aparece lá.'
                            : 'Nenhum produto encontrado com os filtros atuais.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="admin-prodlist">
              {filtered.map((product) => (
                <div className="admin-prodlist-card" key={product.id}>
                  {product.image ? <img src={product.image} alt="" /> : <span className="admin-badge">sem foto</span>}
                  <div className="admin-prodlist-info">
                    <strong>{product.name}</strong>
                    <span>{product.category}</span>
                    <span className={`admin-badge${product.published ? ' on' : ''}`}>
                      {product.published ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>
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
                </div>
              ))}
              {filtered.length === 0 && (
                <p style={{ color: 'var(--muted-foreground)' }}>
                  {products.length === 0
                    ? 'Nenhum produto cadastrado. Clique em "Importar produtos do site" ou crie um novo.'
                    : 'Nenhum produto encontrado com os filtros atuais.'}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
