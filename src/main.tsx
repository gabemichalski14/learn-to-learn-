import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/theme.css'
import './styles/brand.css'
import App from './App.tsx'
import { DialogProvider } from './ui/dialog'
import { GuideProvider } from './world/GuideTransition'
import { flushOutbox } from './data/cloudSync'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DialogProvider>
      <GuideProvider>
        <App />
      </GuideProvider>
    </DialogProvider>
  </StrictMode>,
)

void flushOutbox()
