# PF_zambao_front

Front (React + Vite) da Base de Conhecimento (artigos), com login via Auth0.

- Qualquer usuário com papel **ADMIN** ou **USER** vê a lista de artigos.
- Só **ADMIN** cadastra e exclui artigos.
- O papel vem da claim `https://avaliacoes-api/roles` do ID token (Action `add-roles-to-token`
  anexada ao fluxo **Login / Post Login** no Auth0).

## Rodar local

```bash
npm install
npm run dev            # http://localhost:5173
```

O Vite repassa `/api/*` para `http://localhost:8080` (ou `BACKEND_URL`), sem o prefixo `/api`.

## Deploy na Vercel

1. Importe este repositório na Vercel (preset **Vite**).
2. Em *Settings → Environment Variables*, crie **`BACKEND_URL`** com a URL do back na EC2,
   por exemplo `http://ec2-1-2-3-4.compute-1.amazonaws.com:8080` (sem barra no final).
3. Faça o deploy e copie a URL (`https://<projeto>.vercel.app`).
4. No Auth0 → Applications → **PF** → URLs, adicione essa URL em *Allowed Callback URLs*,
   *Allowed Logout URLs* e *Allowed Web Origins*.

A função `api/[...path].js` repassa as chamadas ao back. Ela existe porque o front na Vercel é HTTPS
e o navegador bloqueia chamadas diretas a um back em `http://` (mixed content).

Domínio, Client ID e audience do Auth0 já têm valor padrão em `src/config.js` (são públicos);
veja `.env.example` para sobrescrever.
