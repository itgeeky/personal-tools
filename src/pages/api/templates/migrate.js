import { readAccounts, isAccountConfigured } from '../../../lib/store.js';
import { createTemplate, needsMediaAsset } from '../../../lib/meta.js';

export async function POST({ request }) {
  const template = await request.json();
  const accounts = await readAccounts();

  if (!isAccountConfigured(accounts.destination)) {
    return new Response(JSON.stringify({ ok: false, message: 'Destination account is not configured.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (needsMediaAsset(template)) {
    return new Response(
      JSON.stringify({
        ok: false,
        status: 'needs-media',
        message: 'This template has a media header. Upload a fresh sample on the destination account first.',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const result = await createTemplate(accounts.destination, template);
    return new Response(JSON.stringify({ ok: true, id: result.id, status: result.status }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err.message || 'Migration failed.';
    const isDuplicate = /already exist/i.test(message);
    return new Response(
      JSON.stringify({ ok: false, status: isDuplicate ? 'exists' : 'error', message }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
