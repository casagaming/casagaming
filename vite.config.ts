import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import type { Connect } from 'vite';

const TURSO_URL = 'https://casagaming1-casagaming.aws-eu-west-1.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzM4MTE5MzUsImlkIjoiMDE5Y2ZmNjQtODQwMS03OTE4LTkwYWMtYzg0NDVjMmU5YTJhIiwicmlkIjoiNmY0ZmRlMDYtMmYwYy00YzcyLTkxY2EtOGVmNDFjMGIxMDllIn0.6mFCZ0ai9OM7Sl51Yqmk0mELbWz0p0yK7D1if7uwaTlwclYmLTCMroYhVQ-Mf7bepUMBpTJecKrnpeUsaNa-DA';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'turso-proxy',
        configureServer(server) {
          server.middlewares.use('/api/turso', (async (req: any, res: any) => {
            if (req.method === 'OPTIONS') {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
              res.statusCode = 200;
              res.end();
              return;
            }

            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end('Method Not Allowed');
              return;
            }

            const chunks: Buffer[] = [];
            req.on('data', (chunk: Buffer) => chunks.push(chunk));
            req.on('end', async () => {
              try {
                const body = Buffer.concat(chunks).toString();
                const upstream = await fetch(`${TURSO_URL}/v2/pipeline`, {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${TURSO_TOKEN}`,
                    'Content-Type': 'application/json',
                  },
                  body,
                });
                const data = await upstream.text();
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.statusCode = upstream.status;
                res.end(data);
              } catch (err: any) {
                console.error('Turso proxy error:', err);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          }) as Connect.NextHandleFunction);
        },
      },
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5000,
      allowedHosts: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: ['**/.local/**', '**/node_modules/**'],
      },
    },
  };
});
