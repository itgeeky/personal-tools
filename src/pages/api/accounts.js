import { readAccounts, writeAccounts } from '../../lib/store.js';

function publicView(account) {
  return {
    label: account.label,
    wabaId: account.wabaId,
    phoneNumberId: account.phoneNumberId,
    tokenSet: Boolean(account.token),
  };
}

export async function GET() {
  const accounts = await readAccounts();
  return new Response(
    JSON.stringify({
      origin: publicView(accounts.origin),
      destination: publicView(accounts.destination),
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

export async function POST({ request }) {
  const body = await request.json();
  const current = await readAccounts();

  const merge = (existing, incoming = {}) => ({
    label: incoming.label ?? existing.label,
    wabaId: incoming.wabaId ?? existing.wabaId,
    phoneNumberId: incoming.phoneNumberId ?? existing.phoneNumberId,
    // an empty token from the client means "keep the saved one"
    token: incoming.token ? incoming.token : existing.token,
  });

  const next = {
    origin: merge(current.origin, body.origin),
    destination: merge(current.destination, body.destination),
  };

  await writeAccounts(next);

  return new Response(
    JSON.stringify({ origin: publicView(next.origin), destination: publicView(next.destination) }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
