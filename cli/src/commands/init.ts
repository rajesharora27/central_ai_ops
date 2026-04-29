import { saveConfig } from '../lib/config';

export async function initCommand(options: {
  name: string;
  path?: string;
  apiUrl?: string;
}): Promise<void> {
  const slug = options.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const config = {
    apiUrl: options.apiUrl || 'http://localhost:4100',
    projectSlug: slug,
  };

  saveConfig(config, options.path);

  console.log(`Governance config initialized for: ${options.name}`);
  console.log(`Slug: ${slug}`);
  console.log(`API URL: ${config.apiUrl}`);
  console.log(`Config saved to: ${options.path || process.cwd()}/.governance.json`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Register this project via the Governance UI or API');
  console.log('  2. Run: governance verify --project ' + slug);
}
