import { request } from '../lib/api-client';
import { loadConfig } from '../lib/config';

type SyncResult = {
  added: number;
  updated: number;
  removed: number;
  errors: string[];
};

export async function syncCommand(options: { apiUrl?: string }): Promise<void> {
  const config = loadConfig();
  const apiUrl = options.apiUrl || config.apiUrl;

  console.log(`Syncing governance artifacts from disk...`);
  console.log(`API: ${apiUrl}`);

  const result = await request<SyncResult>({
    method: 'POST',
    url: `${apiUrl}/api/governance/sync`,
  });

  console.log('');
  console.log(`Added:   ${result.added}`);
  console.log(`Updated: ${result.updated}`);
  console.log(`Removed: ${result.removed}`);

  if (result.errors.length > 0) {
    console.log(`Errors:  ${result.errors.length}`);
    for (const err of result.errors) {
      console.error(`  - ${err}`);
    }
  }

  console.log('\nSync complete.');
}
