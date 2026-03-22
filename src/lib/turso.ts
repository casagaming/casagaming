const TURSO_DIRECT_URL = 'https://casagaming1-casagaming.aws-eu-west-1.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzM4MTY2MzUsImlkIjoiMDE5Y2ZmNjQtODQwMS03OTE4LTkwYWMtYzg0NDVjMmU5YTJhIiwicmlkIjoiNmY0ZmRlMDYtMmYwYy00YzcyLTkxY2EtOGVmNDFjMGIxMDllIn0.uI1magG-U9X1NVygJU0-jRincNwJhsvcvl5gBJZj3FsKARpFLFH0ORe4Vcbmz7Udhn1nmh9ePxFBT1QAHm3mDg';

const isDev = import.meta.env.DEV;
const API_BASE = isDev ? '/api/turso' : TURSO_DIRECT_URL;

function encodeTursoArg(val: any) {
  if (val === null || val === undefined) return { type: 'null' };
  if (typeof val === 'number' && Number.isInteger(val)) return { type: 'integer', value: String(val) };
  if (typeof val === 'number') return { type: 'float', value: val };
  return { type: 'text', value: String(val) };
}

export interface TursoResult {
  columns: string[];
  rows: any[][];
}

export async function execute(
  sqlOrObj: string | { sql: string; args: any[] },
  plainArgs?: any[]
): Promise<TursoResult> {
  const sql = typeof sqlOrObj === 'string' ? sqlOrObj : sqlOrObj.sql;
  const args = typeof sqlOrObj === 'string' ? (plainArgs || []) : (sqlOrObj.args || []);

  const response = await fetch(`${API_BASE}/v2/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          type: 'execute',
          stmt: {
            sql,
            args: args.map(encodeTursoArg),
          },
        },
        { type: 'close' },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Turso error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const result = data.results?.[0];

  if (result?.type === 'error') {
    throw new Error(`Turso query error: ${result.error?.message}`);
  }

  const inner = result?.response?.result;
  const columns: string[] = (inner?.cols || []).map((c: any) => c.name);
  const rows: any[][] = (inner?.rows || []).map((row: any[]) =>
    row.map((cell: any) => {
      if (cell.type === 'null') return null;
      if (cell.type === 'integer') return parseInt(cell.value, 10);
      if (cell.type === 'float') return parseFloat(cell.value);
      return cell.value;
    })
  );

  return { columns, rows };
}

export const turso = { execute };

export const isValidUrl = (url: any) => typeof url === 'string' && (url.startsWith('http') || url.startsWith('/'));

export function getOptimizedImageUrl(url: string | null | undefined, width?: number): string {
  if (!url) return '';
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    const alreadyHasTransforms = /\/upload\/(?!v\d)[a-z_,0-9]+\//.test(url);
    if (alreadyHasTransforms) return url;
    const transforms = width ? `w_${width},c_scale,f_auto,q_auto` : 'f_auto,q_auto';
    return url.replace('/upload/', `/upload/${transforms}/`);
  }
  return url;
}

export function parseImageUrl(value: any, width?: number): string[] {
  const optimize = (u: string) => getOptimizedImageUrl(u, width);
  if (Array.isArray(value)) return value.filter(isValidUrl).map(optimize);
  if (typeof value === 'string' && value) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(isValidUrl).map(optimize);
      return isValidUrl(parsed) ? [optimize(parsed)] : [];
    } catch {
      return isValidUrl(value) ? [optimize(value)] : [];
    }
  }
  return [];
}
