import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
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
const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED = /^image\/(png|jpe?g|webp|svg\+xml|gif)$/i

export default function ProductEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0] || '')
  const [tab, setTab] = useState('brindes')
  const [published, setPublished] = useState(true)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [previousRow, setPreviousRow] = useState(null)

  useEffect(() => {
    if (isNew || !isSupabaseConfigured || !supabase) return
    let active = true
    setLoading(true)
    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error: err }) => {
        if (!active) return
        if (err) {
          setError(err.message)
        } else if (data) {
          setPreviousRow(data)
          setName(data.name || '')
          setDescription(data.description || '')
          setCategory(data.category || CATEGORIES[0] || '')
          setTab(data.tab || 'brindes')
          setPublished(data.published !== false)
          setImages(Array.isArray(data.images) && data.images.length ? data.images : data.image ? [data.image] : [])
        }
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id, isNew])

  const options = useMemo(() => Array.from(new Set([...CATEGORIES, category].filter(Boolean))).sort(), [category])

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return
    if (!isSupabaseConfigured || !supabase) return
    setError('')
    setUploading(true)
    const uploaded = []
    for (const file of files) {
      if (!ALLOWED.test(file.type)) {
        setError(`Formato inválido em "${file.name}". Use PNG, JPG, WEBP, SVG ou GIF.`)
        continue
      }
      if (file.size > MAX_SIZE) {
        setError(`"${file.name}" excede 5MB.`)
        continue
      }
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('product-images')
        .upload(path, file, { cacheControl: '3600', upsert: false })
      if (upErr) {
        setError(`Falha no upload: ${upErr.message}`)
        continue
      }
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      uploaded.push(data.publicUrl)
    }
    setUploading(false)
    if (uploaded.length) setImages((prev) => [...prev, ...uploaded])
  }

  const removeImage = (url) => setImages((prev) => prev.filter((item) => item !== url))
  const makePrimary = (url) => setImages((prev) => [url, ...prev.filter((item) => item !== url)])

  const save = async (event) => {
    event.preventDefault()
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase não configurado.')
      return
    }
    if (!name.trim()) {
      setError('Informe o nome do produto.')
      return
    }
    setError('')
    setSaving(true)
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      category: category.trim() || CATEGORIES[0] || 'Outros',
      tab,
      published,
      images,
      image: images[0] || null,
    }

    if (isNew) {
      const baseSlug = slugify(payload.name, payload.image || '') || `produto-${Date.now()}`
      const { data: maxRow } = await supabase
        .from('products')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle()
      const sortOrder = (maxRow?.sort_order ?? -1) + 1
      let result = await supabase
        .from('products')
        .insert({ ...payload, slug: baseSlug, sort_order: sortOrder })
        .select('id')
        .single()
      if (result.error && result.error.code === '23505') {
        result = await supabase
          .from('products')
          .insert({ ...payload, slug: `${baseSlug}-${Date.now().toString(36)}`, sort_order: sortOrder })
          .select('id')
          .single()
      }
      setSaving(false)
      if (result.error) {
        setError(result.error.message)
        return
      }
      const newId = result.data?.id
      if (newId) {
        pushUndo(async () => {
          await supabase.from('products').delete().eq('id', newId)
        }, `Produto "${payload.name}" criado.`)
      }
    } else {
      const { error: err } = await supabase.from('products').update(payload).eq('id', id)
      setSaving(false)
      if (err) {
        setError(err.message)
        return
      }
      if (previousRow) {
        const restore = {
          name: previousRow.name,
          description: previousRow.description,
          category: previousRow.category,
          tab: previousRow.tab,
          published: previousRow.published,
          images: previousRow.images,
          image: previousRow.image,
        }
        pushUndo(async () => {
          await supabase.from('products').update(restore).eq('id', id)
        }, `Alterações em "${previousRow.name}" salvas.`)
      }
    }

    navigate('/admin/produtos')
  }

  if (loading) return <p style={{ color: 'var(--muted-foreground)', paddingTop: 30 }}>Carregando produto…</p>

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>{isNew ? 'Novo produto' : 'Editar produto'}</h1>
          <p>Ao salvar, o site público é atualizado automaticamente.</p>
        </div>
        <Link className="btn btn-ghost" to="/admin/produtos">
          Voltar
        </Link>
      </div>

      {error && <div className="admin-alert error">{error}</div>}

      <form className="admin-panel" onSubmit={save}>
        <label className="admin-field">
          <span>Nome do produto</span>
          <input className="admin-input" value={name} onChange={(event) => setName(event.target.value)} required />
        </label>

        <label className="admin-field">
          <span>Descrição</span>
          <textarea
            className="admin-textarea"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Se vazio, o site usa a descrição padrão."
          />
        </label>

        <div className="admin-form-grid">
          <label className="admin-field">
            <span>Categoria</span>
            <input
              className="admin-input"
              list="admin-categories"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
            <datalist id="admin-categories">
              {options.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </label>
          <label className="admin-field">
            <span>Aba</span>
            <select className="admin-select" value={tab} onChange={(event) => setTab(event.target.value)}>
              {TABS.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="admin-switch" style={{ marginBottom: 18 }}>
          <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} />
          Produto publicado (visível no site)
        </label>

        <span style={{ display: 'block', fontSize: '.74rem', fontWeight: 700, marginBottom: 6, color: 'var(--muted-foreground)' }}>
          Imagens (a primeira é a foto do card)
        </span>
        {images.length > 0 && (
          <div className="admin-thumbs">
            {images.map((url) => (
              <div className="admin-thumb" key={url}>
                <img src={url} alt="" onError={(event) => (event.currentTarget.style.opacity = 0.2)} />
                <button type="button" onClick={() => removeImage(url)} aria-label="Remover imagem">
                  ×
                </button>
                {url === images[0] ? (
                  <span className="primary-tag">Principal</span>
                ) : (
                  <button
                    type="button"
                    className="primary-tag"
                    style={{ cursor: 'pointer', border: 0, left: 0, right: 'auto', width: 'auto', padding: '2px 6px' }}
                    onClick={() => makePrimary(url)}
                  >
                    Tornar principal
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        <label className="btn" style={{ marginBottom: 18 }}>
          {uploading ? 'Enviando…' : '+ Adicionar imagem'}
          <input type="file" accept="image/*" multiple onChange={handleUpload} hidden disabled={uploading} />
        </label>

        <div className="admin-row-actions">
          <button className="btn btn-primary" type="submit" disabled={saving || uploading}>
            {saving ? 'Salvando…' : isNew ? 'Criar produto' : 'Salvar alterações'}
          </button>
          <Link className="btn btn-ghost" to="/admin/produtos">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  )
}
