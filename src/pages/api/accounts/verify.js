import { readAccounts } from '../../../lib/store.js';
import { verifyAccount } from '../../../lib/meta.js';

export async function POST({ request }) {
  const { which } = await request.json();
  if (which !== 'origin' && which !== 'destination') {
    return new Response(JSON.stringify({ ok: false, message: 'Unknown account.' }), { status: 400 });
  }

  const accounts = await readAccounts();
  const account = accounts[which];

  if (!account.wabaId || !account.token) {
    return new Response(JSON.stringify({ ok: false, message: 'WABA ID and access token are required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await verifyAccount(account);
    return new Response(JSON.stringify({ ok: true, name: result.name || result.id }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, message: err.message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
