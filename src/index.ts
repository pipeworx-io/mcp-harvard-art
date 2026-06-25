interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Harvard Art Museums MCP.
 *
 * Harvard Art Museums — 250k+ objects across the Fogg, Busch-Reisinger & Sackler collections, with rich metadata & IIIF images. FREE API key required (get one at https://harvardartmuseums.org/collections/api (free)); the platform
 * provides it automatically, or pass your own via _apiKey (BYOK).
 */


const BASE = 'https://api.harvardartmuseums.org';
const UA = 'pipeworx-mcp-harvard-art/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search',
    description: 'Search the Harvard Art Museums collection by keyword. Returns matching items with ids (pass an id to object), titles, creators, dates and image links.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keyword(s), e.g. "rembrandt", "ceramics", "moon landing".' },
        limit: { type: 'number', description: 'Max results (1-100, default 20).' },
        page: { type: 'number', description: 'Page number (1-based, default 1).' },
        _apiKey: { type: 'string', description: 'Harvard Art Museums API key (auto-injected by the platform; or pass your own).' },
      },
      required: ['query'],
    },
  },
  {
    name: 'object',
    description: 'Fetch full details for one Harvard Art Museums item by id — a Harvard Art Museums object id (numeric, from search).',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'e.g. "299843".' },
        _apiKey: { type: 'string', description: 'Harvard Art Museums API key (auto-injected by the platform; or pass your own).' },
      },
      required: ['id'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const key = typeof args._apiKey === 'string' ? args._apiKey : '';
  delete args._apiKey;
  if (!key) throw new Error('Harvard Art Museums API key required. Get one free at https://harvardartmuseums.org/collections/api (free) and pass via _apiKey (the platform key may not be configured yet).');
  switch (name) {
    case 'search': {
      const limit = clamp(numArg(args.limit, 20), 1, 100);
      const page = Math.max(1, numArg(args.page, 1));
      const p = new URLSearchParams({ 'apikey': key, 'q': String(args.query ?? ''), 'size': String(limit) });
      p.set('page', String(page));
      return get(`${BASE}/object?${p}`);
    }
    case 'object': {
      const id = reqStr(args, 'id', '"299843"');
      return get(`${BASE}/object/${encodeURIComponent(id)}?apikey=${encodeURIComponent(key)}`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function get(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (res.status === 401 || res.status === 403) throw new Error('Harvard Art Museums: apikey rejected (invalid/expired key). Get a free key at https://harvardartmuseums.org/collections/api (free).');
  if (!res.ok) throw new Error(`Harvard Art Museums: ${res.status} ${await res.text().then((t) => t.slice(0, 160))}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}
function numArg(v: unknown, dflt: number): number { const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN; return Number.isFinite(n) ? n : dflt; }
function clamp(n: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, Math.trunc(n))); }

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
