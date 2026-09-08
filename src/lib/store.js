import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve('./data');
const FILE = path.join(DATA_DIR, 'accounts.json');

const EMPTY = {
  origin: { label: '', wabaId: '', phoneNumberId: '', token: '' },
  destination: { label: '', wabaId: '', phoneNumberId: '', token: '' },
};

export async function readAccounts() {
  if (!existsSync(FILE)) return structuredClone(EMPTY);
  try {
    const raw = await readFile(FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      origin: { ...EMPTY.origin, ...parsed.origin },
      destination: { ...EMPTY.destination, ...parsed.destination },
    };
  } catch {
    return structuredClone(EMPTY);
  }
}

export async function writeAccounts(accounts) {
  if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true });
  const payload = {
    origin: { ...EMPTY.origin, ...accounts.origin },
    destination: { ...EMPTY.destination, ...accounts.destination },
  };
  await writeFile(FILE, JSON.stringify(payload, null, 2), 'utf-8');
  return payload;
}

export function maskToken(token) {
  if (!token) return '';
  if (token.length <= 8) return '••••';
  return `${token.slice(0, 4)}••••••••${token.slice(-4)}`;
}

export function isAccountConfigured(account) {
  return Boolean(account?.wabaId && account?.token);
}
