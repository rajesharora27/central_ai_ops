import { createHash } from 'crypto';

export function computeContentHash(content: string): string {
  const normalized = content.replace(/\r\n/g, '\n').trim();
  return createHash('sha256').update(normalized, 'utf8').digest('hex');
}
