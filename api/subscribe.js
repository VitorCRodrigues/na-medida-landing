// Serverless function (Vercel) — cadastra o e-mail no Beehiiv.
// Env vars necessárias: BEEHIIV_API_KEY, BEEHIIV_PUB_ID
// A key nunca vai pro client — fica só aqui no servidor.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_ERROR = 'Não deu pra cadastrar agora. Tenta de novo daqui a pouco.';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};
  const email = (body.email || '').trim().toLowerCase();

  // Honeypot: bots preenchem campos escondidos. Humano nunca vê esse campo.
  if (body.hp) return res.status(200).json({ ok: true });

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Confere o e-mail — parece que tem algo errado nele.' });
  }

  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUB_ID;
  if (!apiKey || !pubId) {
    console.error('[subscribe] faltando BEEHIIV_API_KEY ou BEEHIIV_PUB_ID nas env vars');
    return res.status(500).json({ error: GENERIC_ERROR });
  }

  try {
    const r = await fetch(`https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: 'landing',
        utm_medium: 'organic',
        utm_campaign: 'waitlist-fase-0',
        referring_site: req.headers.referer || 'https://namedida.app',
      }),
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      console.error('[subscribe] beehiiv respondeu', r.status, JSON.stringify(data));
      return res.status(502).json({ error: GENERIC_ERROR });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[subscribe] falha ao chamar beehiiv', err);
    return res.status(502).json({ error: GENERIC_ERROR });
  }
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
