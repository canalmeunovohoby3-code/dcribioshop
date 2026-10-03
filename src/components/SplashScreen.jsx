import { useEffect, useRef, useState } from 'react'
import { LOGO } from '../data.js'
import '../splash.css'

const LOGO_MS = 3000
const PAUSE_MS = 850
const EXIT_MS = 650
const HOLD_MS = LOGO_MS + PAUSE_MS
const REDUCED_HOLD_MS = 650
const REDUCED_EXIT_MS = 300

export default function SplashScreen({ onReveal }) {
  const [leaving, setLeaving] = useState(false)
  const [hidden, setHidden] = useState(false)
  const onRevealRef = useRef(onReveal)
  onRevealRef.current = onReveal

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false

    const hold = prefersReduced ? REDUCED_HOLD_MS : HOLD_MS
    const exit = prefersReduced ? REDUCED_EXIT_MS : EXIT_MS
    const total = hold + exit

    document.body.style.overflow = 'hidden'

    const leaveTimer = window.setTimeout(() => {
      setLeaving(true)
      onRevealRef.current?.()
    }, hold)

    const doneTimer = window.setTimeout(() => {
      setHidden(true)
      document.body.style.overflow = ''
    }, total)

    return () => {
      window.clearTimeout(leaveTimer)
      window.clearTimeout(doneTimer)
      document.body.style.overflow = ''
    }
  }, [])

  if (hidden) return null

  return (
    <div className={`splash${leaving ? ' splash--leaving' : ''}`} role="presentation" aria-hidden="true">
      <div className="splash__stage">
        <span className="splash__glow" />
        <img className="splash__logo" src={LOGO} alt="Dcribioshop" />
        <span className="splash__shine" style={{ '--splash-logo': `url(${LOGO})` }} />
      </div>
    </div>
  )
}
