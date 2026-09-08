// Account credentials never touch the server's disk (Vercel's serverless
// filesystem is read-only anyway) — they live in this browser tab's
// sessionStorage and are sent along with each API call that needs them.

export type Account = { label: string; wabaId: string; phoneNumberId: string; token: string };
export type Accounts = { origin: Account; destination: Account };

const STORAGE_KEY = 'template-migrator:accounts';

const EMPTY_ACCOUNT: Account = { label: '', wabaId: '', phoneNumberId: '', token: '' };

export function emptyAccounts(): Accounts {
  return { origin: { ...EMPTY_ACCOUNT }, destination: { ...EMPTY_ACCOUNT } };
}

export function loadAccounts(): Accounts {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyAccounts();
    const parsed = JSON.parse(raw);
    return {
      origin: { ...EMPTY_ACCOUNT, ...parsed.origin },
      destination: { ...EMPTY_ACCOUNT, ...parsed.destination },
    };
  } catch {
    return emptyAccounts();
  }
}

export function saveAccounts(accounts: Accounts) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // private-browsing / storage-blocked tabs just won't persist between reloads
  }
}

export function isAccountConfigured(account: Account | null | undefined) {
  return Boolean(account?.wabaId && account?.token);
}
