const GRAPH_VERSION = 'v20.0';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

const MEDIA_HEADER_FORMATS = new Set(['IMAGE', 'VIDEO', 'DOCUMENT']);

async function graphFetch(url, options = {}) {
  const res = await fetch(url, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = body?.error?.message || `Graph API request failed (${res.status})`;
    const err = new Error(message);
    err.graph = body?.error;
    err.status = res.status;
    throw err;
  }
  return body;
}

/** Pull every message template for an account, following cursor pagination. */
export async function fetchAllTemplates(account) {
  const fields = 'name,category,language,status,components,rejected_reason,quality_score';
  let url = `${GRAPH_BASE}/${account.wabaId}/message_templates?fields=${fields}&limit=200`;
  const all = [];

  while (url) {
    const page = await graphFetch(url, {
      headers: { Authorization: `Bearer ${account.token}` },
    });
    all.push(...(page.data || []));
    url = page.paging?.next || null;
  }

  return all;
}

/** Does a template declare a media (non-text) header? Those need a fresh sample asset per account. */
export function needsMediaAsset(template) {
  const header = (template.components || []).find((c) => c.type === 'HEADER');
  return Boolean(header && MEDIA_HEADER_FORMATS.has(header.format));
}

/** Strip read-only / origin-specific fields so the definition can be replayed on another WABA. */
export function toCreatePayload(template) {
  return {
    name: template.name,
    language: template.language,
    category: template.category,
    components: template.components || [],
  };
}

export async function createTemplate(account, template) {
  const url = `${GRAPH_BASE}/${account.wabaId}/message_templates`;
  return graphFetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${account.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(toCreatePayload(template)),
  });
}

/** Confirm the stored credentials can actually see the WABA (used by the settings form). */
export async function verifyAccount(account) {
  const url = `${GRAPH_BASE}/${account.wabaId}?fields=id,name`;
  return graphFetch(url, { headers: { Authorization: `Bearer ${account.token}` } });
}
