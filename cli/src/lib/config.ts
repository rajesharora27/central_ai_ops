import fs from 'fs';
import path from 'path';

const CONFIG_FILE = '.governance.json';

export type CliConfig = {
  apiUrl: string;
  apiKey?: string;
  projectSlug?: string;
};

export function loadConfig(projectPath?: string): CliConfig {
  const searchPath = projectPath || process.cwd();
  const configPath = path.join(searchPath, CONFIG_FILE);

  const defaults: CliConfig = {
    apiUrl: process.env.GOVERNANCE_API_URL || 'http://localhost:4100',
  };

  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  }

  return defaults;
}

export function saveConfig(config: CliConfig, projectPath?: string): void {
  const searchPath = projectPath || process.cwd();
  const configPath = path.join(searchPath, CONFIG_FILE);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}
