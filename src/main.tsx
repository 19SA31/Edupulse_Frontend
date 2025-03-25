import React from'react'
import { Provider } from 'react-redux'
import { createRoot } from 'react-dom/client'
import store from './redux/store.ts'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>
    
  
)  
