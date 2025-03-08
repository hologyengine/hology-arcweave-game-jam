import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerWorker } from '@hology/core'
import Worker from './hology.worker.ts?worker'

registerWorker(() => new Worker())

window.addEventListener('beforeunload', (event) => {
  event.preventDefault()
  event.returnValue = ''
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)