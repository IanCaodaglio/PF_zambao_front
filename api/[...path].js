// Função da Vercel: repassa /api/* para o back na AWS.
//
// Por quê: o front na Vercel é HTTPS. Se o back na EC2 responde em http://IP:8080, o navegador
// bloqueia a chamada direta (mixed content). Aqui a chamada HTTP acontece servidor-para-servidor.
//
// Configure BACKEND_URL (SEM prefixo VITE_) nas Environment Variables da Vercel,
// por exemplo: http://ec2-1-2-3-4.compute-1.amazonaws.com:8080
export default async function handler(req, res) {
  const backend = process.env.BACKEND_URL

  if (!backend) {
    res.status(500).json({ error: 'BACKEND_URL não está configurada na Vercel.' })
    return
  }

  // /api/avaliacoes?x=1  ->  <BACKEND_URL>/avaliacoes?x=1
  const target = backend.replace(/\/+$/, '') + req.url.replace(/^\/api/, '')

  const headers = {}
  for (const name of ['authorization', 'content-type', 'accept']) {
    if (req.headers[name]) headers[name] = req.headers[name]
  }

  const init = { method: req.method, headers }
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body !== undefined) {
    init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
  }

  try {
    const upstream = await fetch(target, init)
    const body = await upstream.text()
    const contentType = upstream.headers.get('content-type')
    if (contentType) res.setHeader('content-type', contentType)
    res.status(upstream.status).send(body)
  } catch (e) {
    res.status(502).json({
      error: 'Não foi possível falar com o back.',
      detail: String((e && e.message) || e),
    })
  }
}
