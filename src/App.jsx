import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SplashScreen from './components/SplashScreen.jsx'
import Home from './pages/Home.jsx'
import QuemSomos from './pages/QuemSomos.jsx'
import Projetos from './pages/Projetos.jsx'
import Produto from './pages/Produto.jsx'

export default function App() {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const fallback = window.setTimeout(() => setRevealed(true), 6000)
    return () => window.clearTimeout(fallback)
  }, [])

  return (
    <>
      <SplashScreen onReveal={() => setRevealed(true)} />
      <div className={`app-shell${revealed ? ' app-shell--ready' : ''}`}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quem-somos" element={<QuemSomos />} />
            <Route path="/projetos" element={<Projetos />} />
            <Route path="/produto/:slug" element={<Produto />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  )
}
