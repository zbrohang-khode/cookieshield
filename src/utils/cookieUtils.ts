/**
 * Cookie parsing and formatting utilities
 */

export interface CookieItem {
  id: string;
  domain: string;
  name: string;
  value: string;
  path: string;
  expires: string; // ISO string or timestamp or 'Session'
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'Strict' | 'Lax' | 'None' | string;
  category: string;
  createdAt: string;
}

export interface VaultEntry {
  id: string;
  accountName: string;
  domain: string;
  category: string;
  cookies: CookieItem[];
  createdAt: string;
}

export function createVaultEntry(accountName: string, cookies: CookieItem[]): VaultEntry {
  const domain = cookies[0]?.domain || 'example.com';
  return {
    id: Math.random().toString(36).substring(2, 11),
    accountName: accountName || `${domain} Account`,
    domain,
    category: autoCategorizeDomain(domain),
    cookies,
    createdAt: new Date().toISOString()
  };
}

export function parseRawCookieHeader(headerString: string, defaultDomain = 'example.com'): CookieItem[] {
  const cookies: CookieItem[] = [];
  const parts = headerString.split(';');

  let currentDomain = defaultDomain;
  let currentPath = '/';
  let currentExpires = 'Session';
  let currentSecure = false;
  let currentHttpOnly = false;
  let currentSameSite = 'Lax';

  const kvPairs: { name: string; value: string }[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.toLowerCase().startsWith('domain=')) {
      currentDomain = trimmed.substring(7).trim();
      continue;
    }
    if (trimmed.toLowerCase().startsWith('path=')) {
      currentPath = trimmed.substring(5).trim();
      continue;
    }
    if (trimmed.toLowerCase().startsWith('expires=') || trimmed.toLowerCase().startsWith('max-age=')) {
      currentExpires = trimmed.substring(trimmed.indexOf('=') + 1).trim();
      continue;
    }
    if (trimmed.toLowerCase() === 'secure') {
      currentSecure = true;
      continue;
    }
    if (trimmed.toLowerCase() === 'httponly') {
      currentHttpOnly = true;
      continue;
    }
    if (trimmed.toLowerCase().startsWith('samesite=')) {
      currentSameSite = trimmed.substring(9).trim();
      continue;
    }

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const name = trimmed.substring(0, eqIdx).trim();
      const value = trimmed.substring(eqIdx + 1).trim();
      if (name && !['domain', 'path', 'expires', 'max-age', 'samesite'].includes(name.toLowerCase())) {
        kvPairs.push({ name, value });
      }
    }
  }

  if (kvPairs.length === 0 && headerString.includes('=')) {
    const eqIdx = headerString.indexOf('=');
    const name = headerString.substring(0, eqIdx).trim();
    const value = headerString.substring(eqIdx + 1).trim();
    if (name) kvPairs.push({ name, value });
  }

  for (const kv of kvPairs) {
    cookies.push({
      id: Math.random().toString(36).substring(2, 11),
      domain: currentDomain,
      name: kv.name,
      value: kv.value,
      path: currentPath,
      expires: currentExpires,
      secure: currentSecure,
      httpOnly: currentHttpOnly,
      sameSite: currentSameSite,
      category: autoCategorizeDomain(currentDomain),
      createdAt: new Date().toISOString()
    });
  }

  return cookies;
}

export function parseNetscapeFormat(text: string): CookieItem[] {
  const cookies: CookieItem[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const fields = trimmed.split('\t');
    if (fields.length >= 7) {
      const domain = fields[0];
      const secureFlag = fields[3].toUpperCase() === 'TRUE';
      const expiresTs = parseInt(fields[4], 10);
      const name = fields[5];
      const value = fields[6];

      let expiresStr = 'Session';
      if (!isNaN(expiresTs) && expiresTs > 0) {
        expiresStr = new Date(expiresTs * 1000).toISOString();
      }

      cookies.push({
        id: Math.random().toString(36).substring(2, 11),
        domain,
        name,
        value,
        path: fields[2] || '/',
        expires: expiresStr,
        secure: secureFlag,
        httpOnly: false,
        sameSite: 'Lax',
        category: autoCategorizeDomain(domain),
        createdAt: new Date().toISOString()
      });
    }
  }

  return cookies;
}

export function parseJsonFormat(text: string): CookieItem[] {
  try {
    const data = JSON.parse(text);
    const arr = Array.isArray(data) ? data : data.cookies || [data];
    return arr.map((c: any) => ({
      id: c.id || Math.random().toString(36).substring(2, 11),
      domain: c.domain || c.host || 'example.com',
      name: c.name || 'cookie',
      value: c.value || '',
      path: c.path || '/',
      expires: c.expirationDate ? new Date(c.expirationDate * 1000).toISOString() : (c.expires || 'Session'),
      secure: Boolean(c.secure),
      httpOnly: Boolean(c.httpOnly || c.http_only),
      sameSite: c.sameSite || c.samesite || 'Lax',
      category: c.category || autoCategorizeDomain(c.domain || 'example.com'),
      createdAt: c.createdAt || new Date().toISOString()
    }));
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    return [];
  }
}

export function autoCategorizeDomain(domain: string): string {
  const d = domain.toLowerCase();
  if (d.includes('github') || d.includes('gitlab') || d.includes('stackoverflow') || d.includes('npmjs') || d.includes('aws') || d.includes('vercel') || d.includes('cloudflare')) {
    return 'Developer';
  }
  if (d.includes('google') || d.includes('notion') || d.includes('slack') || d.includes('microsoft') || d.includes('figma') || d.includes('atlassian') || d.includes('chatgpt') || d.includes('openai')) {
    return 'Productivity';
  }
  if (d.includes('twitter') || d.includes('x.com') || d.includes('reddit') || d.includes('discord') || d.includes('linkedin') || d.includes('facebook') || d.includes('youtube')) {
    return 'Social';
  }
  if (d.includes('amazon') || d.includes('stripe') || d.includes('shopify') || d.includes('paypal') || d.includes('ebay')) {
    return 'E-Commerce';
  }
  if (d.includes('bank') || d.includes('finance') || d.includes('coinbase') || d.includes('binance') || d.includes('chase')) {
    return 'Financial';
  }
  return 'General';
}

export function exportToNetscape(cookies: CookieItem[]): string {
  let output = '# Netscape HTTP Cookie File\n# This file is generated by CookieShield Vault. Do not edit.\n\n';
  for (const c of cookies) {
    const domain = c.domain.startsWith('.') ? c.domain : '.' + c.domain;
    const includeSubdomains = 'TRUE';
    const path = c.path || '/';
    const secure = c.secure ? 'TRUE' : 'FALSE';
    
    let expTimestamp = '0';
    if (c.expires && c.expires !== 'Session') {
      const d = new Date(c.expires);
      if (!isNaN(d.getTime())) {
        expTimestamp = Math.floor(d.getTime() / 1000).toString();
      }
    }

    output += `${domain}\t${includeSubdomains}\t${path}\t${secure}\t${expTimestamp}\t${c.name}\t${c.value}\n`;
  }
  return output;
}

export function exportToRawHeader(cookies: CookieItem[]): string {
  return cookies.map(c => `${c.name}=${c.value}`).join('; ');
}

export function exportToCsv(cookies: CookieItem[]): string {
  const headers = ['Domain', 'Name', 'Value', 'Path', 'Expires', 'Secure', 'HttpOnly', 'SameSite', 'Category'];
  const rows = cookies.map(c => [
    `"${c.domain}"`,
    `"${c.name}"`,
    `"${c.value.replace(/"/g, '""')}"`,
    `"${c.path}"`,
    `"${c.expires}"`,
    c.secure ? 'TRUE' : 'FALSE',
    c.httpOnly ? 'TRUE' : 'FALSE',
    `"${c.sameSite}"`,
    `"${c.category}"`
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function generateCurlCommand(cookies: CookieItem[], url = 'https://example.com/api'): string {
  const cookieHeader = exportToRawHeader(cookies);
  return `curl -X GET "${url}" \\
  -H "Cookie: ${cookieHeader}" \\
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)"`;
}
