export const config = { runtime: 'edge' };

// Edge Function (Vercel) — cadastra o e-mail no Beehiiv.
// Env vars necessárias: BEEHIIV_API_KEY, BEEHIIV_PUB_ID, KV_REST_API_URL, KV_REST_API_TOKEN
// As keys nunca vão pro client — ficam só aqui no servidor.
//
// Todo e-mail com formato válido é gravado no KV (lista "leads"), mesmo se o
// honeypot disparar ou o Beehiiv falhar — assim nenhum lead se perde. Use
// /api/leads pra ver e exportar manualmente o que precisar de atenção.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_ERROR = 'Não deu pra cadastrar agora. Tenta de novo daqui a pouco.';

function json(data, status, extraHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

async function saveLead(record) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    console.error('[subscribe] KV não configurado, lead não persistido:', JSON.stringify(record));
    return;
  }
  try {
    await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([['LPUSH', 'leads', JSON.stringify(record)]]),
    });
  } catch (err) {
    console.error('[subscribe] falha ao salvar lead no KV', err);
  }
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return json({ error: 'Método não permitido.' }, 405, { Allow: 'POST' });
  }

  const body = await safeParse(req);
  const email = (body.email || '').trim().toLowerCase();

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return json({ error: 'Confere o e-mail — parece que tem algo errado nele.' }, 400);
  }

  const referer = req.headers.get('referer') || 'https://namedida.app';
  const isBot = Boolean(body.hp);

  // Honeypot: bots (ou autofill agressivo de navegadores in-app) preenchem
  // campos escondidos. Ainda assim salva o lead — pode ser falso positivo.
  if (isBot) {
    console.warn('[subscribe] honeypot disparado, não cadastrado no Beehiiv (hp preenchido)');
    await saveLead({ email, hp: true, beehiiv: 'skipped-honeypot', ts: new Date().toISOString(), referer });
    return json({ ok: true }, 200);
  }

  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUB_ID;
  if (!apiKey || !pubId) {
    console.error('[subscribe] faltando BEEHIIV_API_KEY ou BEEHIIV_PUB_ID nas env vars');
    await saveLead({ email, hp: false, beehiiv: 'missing-env', ts: new Date().toISOString(), referer });
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
        referring_site: referer,
      }),
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      console.error('[subscribe] beehiiv respondeu', r.status, JSON.stringify(data));
      await saveLead({ email, hp: false, beehiiv: 'error', status: r.status, ts: new Date().toISOString(), referer });
      return json({ error: GENERIC_ERROR }, 502);
    }

    await saveLead({ email, hp: false, beehiiv: 'ok', ts: new Date().toISOString(), referer });
    return json({ ok: true }, 200);
  } catch (err) {
    console.error('[subscribe] falha ao chamar beehiiv', err);
    await saveLead({ email, hp: false, beehiiv: 'exception', ts: new Date().toISOString(), referer });
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
