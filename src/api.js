import { API_URL } from './config.js'

async function request(path, token, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Sessão inválida ou token sem o audience correto (401).')
    }
    if (response.status === 403) {
      throw new Error('Você não tem permissão para esta ação (403).')
    }
    if (response.status === 400) {
      throw new Error('Dados inválidos. Confira título, descrição, prioridade e e-mail.')
    }
    if (response.status === 404) {
      throw new Error('Artigo não encontrado (404). Talvez já tenha sido removido.')
    }
    throw new Error(`Erro ${response.status} ao falar com o servidor.`)
  }

  if (response.status === 204) return null
  return response.json()
}

export function listarArtigos(token) {
  return request('/artigos', token)
}

export function cadastrarArtigo(token, artigo) {
  return request('/artigos', token, {
    method: 'POST',
    body: JSON.stringify(artigo),
  })
}

export function removerArtigo(token, id) {
  return request(`/artigos/${id}`, token, { method: 'DELETE' })
}
