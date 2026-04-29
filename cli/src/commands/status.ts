import { request } from '../lib/api-client';
import { loadConfig } from '../lib/config';

type ProjectStatus = {
  project: string;
  artifacts: { type: string; name: string; path: string; environments: string[] }[];
  loadOrder: string[];
};

export async function statusCommand(options: {
  project?: string;
  apiUrl?: string;
}): Promise<void> {
  const config = loadConfig();
  const apiUrl = options.apiUrl || config.apiUrl;
  const projectSlug = options.project || config.projectSlug;

  if (!projectSlug) {
    console.error('Error: --project is required');
    process.exit(1);
  }

  console.log(`Fetching governance status for: ${projectSlug}`);

  const result = await request<ProjectStatus>({
    method: 'GET',
    url: `${apiUrl}/api/governance/config/${projectSlug}`,
  });

  console.log(`\nProject: ${result.project}`);
  console.log(`Artifacts: ${result.artifacts.length}`);
  console.log('');

  const byType: Record<string, number> = {};
  for (const a of result.artifacts) {
    byType[a.type] = (byType[a.type] || 0) + 1;
  }
  for (const [type, count] of Object.entries(byType)) {
    console.log(`  ${type}: ${count}`);
  }

  console.log('\nLoad Order:');
  for (const entry of result.loadOrder) {
    console.log(`  ${entry}`);
  }
}
