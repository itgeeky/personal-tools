import { verifyAccount } from '../../../lib/meta.js';

export async function POST({ request }) {
  const { wabaId, token } = await request.json();

  if (!wabaId || !token) {
    return new Response(JSON.stringify({ ok: false, message: 'WABA ID and access token are required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await verifyAccount({ wabaId, token });
    return new Response(JSON.stringify({ ok: true, name: result.name || result.id }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, message: err.message }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
