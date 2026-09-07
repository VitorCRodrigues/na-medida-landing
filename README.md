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
└── index.html      # tudo em um arquivo
```

## Rodando localmente

Abra `index.html` direto no browser — ou use qualquer servidor estático:

```bash
# Python
python -m http.server 3000

# Node (npx)
npx serve .
```

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
