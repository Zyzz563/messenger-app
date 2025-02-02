import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { StrictMode } from 'react'

// Проверяем наличие корневого элемента
const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
