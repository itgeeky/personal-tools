import { fetchAllTemplates, needsMediaAsset } from '../../../lib/meta.js';

function headerFormat(template) {
  const header = (template.components || []).find((c) => c.type === 'HEADER');
  return header?.format || 'NONE';
}

function isConfigured(account) {
  return Boolean(account?.wabaId && account?.token);
}

export async function POST({ request }) {
  const { origin, destination } = await request.json();

  if (!isConfigured(origin) || !isConfigured(destination)) {
    return new Response(JSON.stringify({ error: 'Set up both accounts before listing templates.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const [originTemplates, destinationTemplates] = await Promise.all([
      fetchAllTemplates(origin),
      fetchAllTemplates(destination),
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
        originLabel: origin.label || 'Origin',
        destinationLabel: destination.label || 'Destination',
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
