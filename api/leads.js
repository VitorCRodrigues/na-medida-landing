export const config = { runtime: 'edge' };

// Edge Function (Vercel) — lista os leads salvos no KV (ver api/subscribe.js).
// Protegido por senha via query string: /api/leads?key=SUA_SENHA
// Env var necessária: LEADS_ADMIN_KEY (defina uma senha forte nas
// Environment Variables do Vercel — sem ela o endpoint fica desativado).

export default async function handler(req) {
  if (req.method !== 'GET') {
    return new Response('Método não permitido.', { status: 405 });
  }

  const adminKey = process.env.LEADS_ADMIN_KEY;
  const provided = new URL(req.url).searchParams.get('key');
  if (!adminKey || !provided || provided !== adminKey) {
    return new Response('Not found', { status: 404 });
  }

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    return new Response(JSON.stringify({ error: 'KV não configurado.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const r = await fetch(`${url}/lrange/leads/0/-1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await r.json().catch(() => ({}));
  const raw = Array.isArray(data.result) ? data.result : [];
  const leads = raw.map((s) => {
    try {
      return JSON.parse(s);
    } catch {
      return { raw: s };
    }
  });

  return new Response(JSON.stringify({ count: leads.length, leads }, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
