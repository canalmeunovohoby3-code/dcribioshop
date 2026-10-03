export function productSlug(product) {
  return slugify(product.name, product.image)
}

export function slugify(name, image) {
  const digits = (image.match(/\/(\d+)_/) || [])[1] ?? ''
  const base = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return digits ? `${digits}-${base}` : base
}
