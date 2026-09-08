import { readAccounts, isAccountConfigured } from '../../../lib/store.js';
import { fetchAllTemplates, needsMediaAsset } from '../../../lib/meta.js';

function headerFormat(template) {
  const header = (template.components || []).find((c) => c.type === 'HEADER');
  return header?.format || 'NONE';
}

export async function GET() {
  const accounts = await readAccounts();

  if (!isAccountConfigured(accounts.origin) || !isAccountConfigured(accounts.destination)) {
    return new Response(
      JSON.stringify({ error: 'Set up both accounts before listing templates.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const [originTemplates, destinationTemplates] = await Promise.all([
      fetchAllTemplates(accounts.origin),
      fetchAllTemplates(accounts.destination),
    ]);

    const destinationIndex = new Set(
      destinationTemplates.map((t) => `${t.name}::${t.language}`)
    );

    const templates = originTemplates
      .map((t) => ({
        name: t.name,
        language: t.language,
        category: t.category,
        originStatus: t.status,
        header: headerFormat(t),
        needsMedia: needsMediaAsset(t),
        components: t.components || [],
        existsOnDestination: destinationIndex.has(`${t.name}::${t.language}`),
      }))
      .sort((a, b) => a.name.localeCompare(b.name) || a.language.localeCompare(b.language));

    return new Response(
      JSON.stringify({
        originLabel: accounts.origin.label || 'Origin',
        destinationLabel: accounts.destination.label || 'Destination',
        originCount: originTemplates.length,
        destinationCount: destinationTemplates.length,
        templates,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
