import { useCallback, useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { cadastrarAvaliacao, listarAvaliacoes } from './api.js'
import { ROLES_CLAIM } from './config.js'

const FORM_VAZIO = { emailAvaliado: '', comentarios: '', nota: 5 }

export default function App() {
  const {
    isLoading,
    isAuthenticated,
    user,
    error: authError,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0()

  const [avaliacoes, setAvaliacoes] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState(FORM_VAZIO)
  const [enviando, setEnviando] = useState(false)

  const roles = (user && user[ROLES_CLAIM]) || []
  const isAdmin = roles.includes('ADMIN')
  const temPapel = roles.includes('ADMIN') || roles.includes('USER')

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro('')
    try {
      const token = await getAccessTokenSilently()
      setAvaliacoes(await listarAvaliacoes(token))
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }, [getAccessTokenSilently])

  useEffect(() => {
    if (isAuthenticated && temPapel) carregar()
  }, [isAuthenticated, temPapel, carregar])

  async function enviar(evento) {
    evento.preventDefault()
    setEnviando(true)
    setErro('')
    try {
      const token = await getAccessTokenSilently()
      await cadastrarAvaliacao(token, {
        emailAvaliador: user.email,
        emailAvaliado: form.emailAvaliado,
        comentarios: form.comentarios,
        nota: Number(form.nota),
      })
      setForm(FORM_VAZIO)
      await carregar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  if (isLoading) return <main className="container"><p>Carregando...</p></main>

  if (authError) {
    return (
      <main className="container">
        <h1>Sistema de Avaliações</h1>
        <p className="erro">Erro de autenticação: {authError.message}</p>
        <button onClick={() => loginWithRedirect()}>Tentar entrar novamente</button>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="container">
        <h1>Sistema de Avaliações</h1>
        <p>Entre para ver e cadastrar avaliações.</p>
        <button onClick={() => loginWithRedirect()}>Entrar</button>
      </main>
    )
  }

  return (
    <main className="container">
      <header className="topo">
        <div>
          <h1>Sistema de Avaliações</h1>
          <small>
            {user.email} · {roles.length ? roles.join(', ') : 'sem papel'}
          </small>
        </div>
        <button
          className="secundario"
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        >
          Sair
        </button>
      </header>

      {!temPapel && (
        <p className="erro">
          Seu usuário não tem papel ADMIN nem USER. Peça para atribuírem um papel no Auth0 e entre de novo.
        </p>
      )}

      {erro && <p className="erro">{erro}</p>}

      {isAdmin && (
        <section>
          <h2>Nova avaliação</h2>
          <form onSubmit={enviar}>
            <label>
              E-mail do avaliado
              <input
                type="email"
                required
                value={form.emailAvaliado}
                onChange={(e) => setForm({ ...form, emailAvaliado: e.target.value })}
              />
            </label>
            <label>
              Comentários
              <textarea
                required
                maxLength={1000}
                rows={3}
                value={form.comentarios}
                onChange={(e) => setForm({ ...form, comentarios: e.target.value })}
              />
            </label>
            <label>
              Nota (0 a 10)
              <input
                type="number"
                required
                min={0}
                max={10}
                value={form.nota}
                onChange={(e) => setForm({ ...form, nota: e.target.value })}
              />
            </label>
            <button type="submit" disabled={enviando}>
              {enviando ? 'Salvando...' : 'Cadastrar'}
            </button>
          </form>
        </section>
      )}

      {temPapel && (
        <section>
          <h2>Avaliações</h2>
          {carregando && <p>Carregando...</p>}
          {!carregando && avaliacoes.length === 0 && !erro && <p>Nenhuma avaliação cadastrada.</p>}
          {avaliacoes.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Avaliador</th>
                  <th>Avaliado</th>
                  <th>Nota</th>
                  <th>Comentários</th>
                </tr>
              </thead>
              <tbody>
                {avaliacoes.map((a) => (
                  <tr key={a.id}>
                    <td>{a.dataAvaliacao}</td>
                    <td>{a.emailAvaliador}</td>
                    <td>{a.emailAvaliado}</td>
                    <td>{a.nota}</td>
                    <td>{a.comentarios}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </main>
  )
}
