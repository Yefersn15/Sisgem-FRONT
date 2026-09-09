import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Bootstrap y Font Awesome deben importarse ANTES de App.jsx: App.jsx
// arrastra App.css (todo el CSS del tema, ver App.css) por un import
// estático, y ese import se evalúa primero si aparece primero en el
// archivo. Con Bootstrap importado después, sus reglas (.card, body,
// .form-control, etc.) quedaban más abajo en la cascada y ganaban por
// orden de aparición pese a tener la misma especificidad que las reglas
// del tema — por eso los fondos de tarjetas/formularios no seguían la
// paleta elegida en Configuración aunque las variables CSS sí se
// actualizaran correctamente.
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.min.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
