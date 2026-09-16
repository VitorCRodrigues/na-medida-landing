export const config = { runtime: 'edge' };

// Edge Function (Vercel) — cadastra o e-mail no Beehiiv.
// Env vars necessárias: BEEHIIV_API_KEY, BEEHIIV_PUB_ID
// A key nunca vai pro client — fica só aqui no servidor.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_ERROR = 'Não deu pra cadastrar agora. Tenta de novo daqui a pouco.';

function json(data, status, extraHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return json({ error: 'Método não permitido.' }, 405, { Allow: 'POST' });
  }

  const body = await safeParse(req);
  const email = (body.email || '').trim().toLowerCase();

  // Honeypot: bots preenchem campos escondidos. Humano nunca vê esse campo.
  if (body.hp) {
    console.warn('[subscribe] honeypot disparado, ignorando cadastro (hp preenchido)');
    return json({ ok: true }, 200);
  }

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return json({ error: 'Confere o e-mail — parece que tem algo errado nele.' }, 400);
  }

  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUB_ID;
  if (!apiKey || !pubId) {
    console.error('[subscribe] faltando BEEHIIV_API_KEY ou BEEHIIV_PUB_ID nas env vars');
    return json({ error: GENERIC_ERROR }, 500);
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
        referring_site: req.headers.get('referer') || 'https://namedida.app',
      }),
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      console.error('[subscribe] beehiiv respondeu', r.status, JSON.stringify(data));
      return json({ error: GENERIC_ERROR }, 502);
    }

    return json({ ok: true }, 200);
  } catch (err) {
    console.error('[subscribe] falha ao chamar beehiiv', err);
    return json({ error: GENERIC_ERROR }, 502);
  }
}

async function safeParse(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}
