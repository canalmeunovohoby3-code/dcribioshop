import { useSyncExternalStore } from 'react'
import { getUndo, runUndo, subscribeUndo } from './undo.js'
import './admin.css'

export default function UndoToast() {
  const undo = useSyncExternalStore(subscribeUndo, getUndo, () => null)
  if (!undo) return null

  return (
    <div className="admin-undo" role="status">
      <span>{undo.message}</span>
      <button className="btn" onClick={() => runUndo()}>
        Desfazer
      </button>
    </div>
  )
}
