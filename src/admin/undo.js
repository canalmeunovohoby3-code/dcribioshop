// Store simples de "desfazer" para o painel (persiste entre navegações do admin).
let current = null
let timer = null
const listeners = new Set()

function emit() {
  listeners.forEach((listener) => listener())
}

export function pushUndo(action, message, ttl = 10000) {
  current = { action, message }
  emit()
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    current = null
    timer = null
    emit()
  }, ttl)
}

export function clearUndo() {
  current = null
  if (timer) clearTimeout(timer)
  timer = null
  emit()
}

export async function runUndo() {
  const action = current?.action
  clearUndo()
  if (action) await action()
}

export function subscribeUndo(callback) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

export function getUndo() {
  return current
}
