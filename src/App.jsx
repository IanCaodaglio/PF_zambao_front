import { useCallback, useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { cadastrarArtigo, listarArtigos, removerArtigo } from './api.js'
import { ROLES_CLAIM } from './config.js'

const FORM_VAZIO = { titulo: '', descricao: '', prioridade: 'MEDIA' }

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

  const [artigos, setArtigos] = useState([])
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
      setArtigos(await listarArtigos(token))
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
      await cadastrarArtigo(token, {
        titulo: form.titulo,
        descricao: form.descricao,
        prioridade: form.prioridade,
        emailCriador: user.email,
      })
      setForm(FORM_VAZIO)
      await carregar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  async function excluir(id) {
    setErro('')
    try {
      const token = await getAccessTokenSilently()
      await removerArtigo(token, id)
      await carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  if (isLoading) return <main className="container"><p>Carregando...</p></main>

  if (authError) {
    return (
      <main className="container">
        <h1>Base de Conhecimento</h1>
        <p className="erro">Erro de autenticação: {authError.message}</p>
        <button onClick={() => loginWithRedirect()}>Tentar entrar novamente</button>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="container">
        <h1>Base de Conhecimento</h1>
        <p>Entre para ver e cadastrar artigos.</p>
        <button onClick={() => loginWithRedirect()}>Entrar</button>
      </main>
    )
  }

  return (
    <main className="container">
      <header className="topo">
        <div>
          <h1>Base de Conhecimento</h1>
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
          <h2>Novo artigo</h2>
          <form onSubmit={enviar}>
            <label>
              Título
              <input
                required
                maxLength={255}
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              />
            </label>
            <label>
              Descrição
              <textarea
                required
                maxLength={2000}
                rows={3}
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </label>
            <label>
              Prioridade
              <select
                value={form.prioridade}
                onChange={(e) => setForm({ ...form, prioridade: e.target.value })}
              >
                <option value="BAIXA">BAIXA</option>
                <option value="MEDIA">MEDIA</option>
                <option value="ALTA">ALTA</option>
              </select>
            </label>
            <button type="submit" disabled={enviando}>
              {enviando ? 'Salvando...' : 'Cadastrar'}
            </button>
          </form>
        </section>
      )}

      {temPapel && (
        <section>
          <h2>Artigos</h2>
          {carregando && <p>Carregando...</p>}
          {!carregando && artigos.length === 0 && !erro && <p>Nenhum artigo cadastrado.</p>}
          {artigos.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Descrição</th>
                  <th>Prioridade</th>
                  <th>Criador</th>
                  {isAdmin && <th></th>}
                </tr>
              </thead>
              <tbody>
                {artigos.map((a) => (
                  <tr key={a.id}>
                    <td>{a.titulo}</td>
                    <td>{a.descricao}</td>
                    <td>{a.prioridade}</td>
                    <td>{a.emailCriador}</td>
                    {isAdmin && (
                      <td>
                        <button className="secundario" onClick={() => excluir(a.id)}>
                          Excluir
                        </button>
                      </td>
                    )}
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
