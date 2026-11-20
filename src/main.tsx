import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fontes no próprio app (funcionam sem internet no PWA). Só os pesos do DESIGN.md 3.1.
import '@fontsource/montserrat/latin-800.css'
import '@fontsource/montserrat/latin-900.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import './ui/tokens.css'
import './ui/base.css'
import { App } from './ui/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
