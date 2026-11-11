// Valores públicos do Auth0 (domínio, client id e audience não são segredos).
// Podem ser sobrescritos por variáveis VITE_* (ver .env.example).
export const AUTH0_DOMAIN =
  import.meta.env.VITE_AUTH0_DOMAIN || 'dev-vrz0ftntk7qkj44u.us.auth0.com'

export const AUTH0_CLIENT_ID =
  import.meta.env.VITE_AUTH0_CLIENT_ID || 'sJVm5Mdi4kdpR0lqI0Xvl3OLfE3by6Nv'

export const AUTH0_AUDIENCE =
  import.meta.env.VITE_AUTH0_AUDIENCE || 'https://avaliacoes-api'

// Claim com os papéis, preenchida pela Action "add-roles-to-token" do Auth0.
export const ROLES_CLAIM = 'https://avaliacoes-api/roles'

// Por padrão chama /api (proxy do Vite em dev, função da Vercel em produção).
export const API_URL = import.meta.env.VITE_API_URL || '/api'
