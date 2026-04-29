import { request } from '../lib/api-client';
import { loadConfig } from '../lib/config';

type VerifyResult = {
  status: string;
  score: number;
  summary: string;
  artifacts: { artifactName: string; status: string; reason: string | null }[];
};

export async function verifyCommand(options: {
  project?: string;
  apiUrl?: string;
  apiKey?: string;
  strict?: boolean;
}): Promise<void> {
  const config = loadConfig();
  const apiUrl = options.apiUrl || config.apiUrl;
  const projectSlug = options.project || config.projectSlug;
  const apiKey = options.apiKey || config.apiKey;

  if (!projectSlug) {
    console.error('Error: --project is required (or set projectSlug in .governance.json)');
    process.exit(1);
  }

  console.log(`Verifying governance compliance for: ${projectSlug}`);
  console.log(`API: ${apiUrl}`);

  const headers: Record<string, string> = {};
  if (apiKey) headers['X-API-Key'] = apiKey;

  const result = await request<VerifyResult>({
    method: 'POST',
    url: `${apiUrl}/api/governance/verify`,
    headers,
    body: { projectSlug },
  });

  console.log('');
  console.log(`Status: ${result.status}`);
  console.log(`Score:  ${result.score}%`);
  console.log(`Summary: ${result.summary}`);
  console.log('');

  if (result.artifacts.length > 0) {
    console.log('Artifacts:');
    for (const a of result.artifacts) {
      const icon = a.status === 'COMPLIANT' ? 'OK' : a.status === 'DRIFTED' ? 'DRIFT' : 'FAIL';
      console.log(`  [${icon}] ${a.artifactName}${a.reason ? ` — ${a.reason}` : ''}`);
    }
  }

  if (result.status === 'NON_COMPLIANT') {
    console.error('\nGovernance check FAILED.');
    process.exit(1);
  }

  if (options.strict && result.status === 'DRIFTED') {
    console.error('\nGovernance check FAILED (strict mode: drift detected).');
    process.exit(1);
  }

  console.log('\nGovernance check PASSED.');
}
