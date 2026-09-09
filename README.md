# na medida — landing page

Landing page de validação (Fase 0) do [Na Medida](https://namedida.app) — o primeiro app brasileiro de redução consciente de álcool.

## Sobre

Site estático em HTML/CSS/JS puro. Sem dependências, sem build step, sem node_modules.

**Stack:** HTML · CSS (custom properties, grid, flexbox) · JS vanilla  
**Fontes:** DM Sans + Fraunces via Google Fonts  
**Deploy recomendado:** Vercel, Netlify ou GitHub Pages

## Estrutura

```
na-medida-landing/
├── index.html          # a landing inteira (HTML + CSS + JS)
├── api/
│   └── subscribe.js    # função serverless: cadastra e-mail no Beehiiv
└── .env.example        # env vars necessárias (configurar no Vercel)
```

## Rodando localmente

Só o visual (o formulário vai dar erro sem a função):

```bash
python -m http.server 3000
```

Com o formulário funcionando (roda a função `api/`):

```bash
npm i -g vercel
vercel dev            # cria .env local na primeira vez, ou copie de .env.example
```

## Formulário de e-mail (Beehiiv)

Os dois formulários (hero + CTA final) enviam pra `/api/subscribe`, que chama a
API do Beehiiv. A API key fica só no servidor, nunca no client.

**Env vars** (Vercel → Project → Settings → Environment Variables):

| Var | Onde achar |
|-----|-----------|
| `BEEHIIV_API_KEY` | Beehiiv → Settings → API |
| `BEEHIIV_PUB_ID`  | Beehiiv → Settings → API (formato `pub_...`) |

**No Beehiiv, configurar:**

1. **Welcome Email** — sem ele, o `send_welcome_email` não dispara nada.
2. **Email verification / double opt-in** — ligado = manda e-mail de confirmação
   antes de contar o inscrito; desligado = entra direto. Escolha sua.

Depois de mudar env vars, **refaça o deploy** pra elas valerem.

## Deploy no Vercel (recomendado)

```bash
npx vercel --prod
```

Ou conecte o repositório no [vercel.com](https://vercel.com) para deploy automático a cada push.

## Deploy no GitHub Pages

1. Vá em **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / pasta `/` (root)
4. Salvar — em ~1 minuto a página está no ar

## Paleta de cores

| Token | Hex | Uso |
|-------|-----|-----|
| Teal | `#1D9E75` | Cor primária, CTAs |
| Amber | `#EF9F27` | Cor de suporte, calor social |
| Off-white | `#F1EFE8` | Fundo |
| Grafite | `#2C2C2A` | Tipografia |

## Repositórios relacionados

- `na-medida-app` — app principal (Vite + React + Whop)

---

*Fase 0 — validação pré-código · Setembro 2026*
