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
      throw new Error('Dados inválidos. Confira os e-mails e a nota (0 a 10).')
    }
    throw new Error(`Erro ${response.status} ao falar com o servidor.`)
  }

  return response.json()
}

export function listarAvaliacoes(token) {
  return request('/avaliacoes', token)
}

export function cadastrarAvaliacao(token, avaliacao) {
  return request('/avaliacoes', token, {
    method: 'POST',
    body: JSON.stringify(avaliacao),
  })
}
