import http from 'http';
import https from 'https';
import { URL } from 'url';

type RequestOptions = {
  method: 'GET' | 'POST';
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
};

export async function request<T = unknown>(opts: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(opts.url);
    const transport = parsed.protocol === 'https:' ? https : http;

    const payload = opts.body ? JSON.stringify(opts.body) : undefined;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...opts.headers,
    };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload).toString();

    const req = transport.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: opts.method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(parsed.error || `HTTP ${res.statusCode}`));
            } else {
              resolve(parsed as T);
            }
          } catch {
            reject(new Error(`Invalid JSON response: ${data.slice(0, 200)}`));
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}
