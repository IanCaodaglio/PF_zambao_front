import React from 'react'
import ReactDOM from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import App from './App.jsx'
import { AUTH0_AUDIENCE, AUTH0_CLIENT_ID, AUTH0_DOMAIN } from './config.js'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        // Sem o audience o Auth0 devolve um token opaco e o back não consegue validar.
        audience: AUTH0_AUDIENCE,
        scope: 'openid profile email',
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
)
