#!/usr/bin/env node
import { Command } from 'commander';
import { verifyCommand } from './commands/verify';
import { syncCommand } from './commands/sync';
import { statusCommand } from './commands/status';
import { initCommand } from './commands/init';

const program = new Command();

program
  .name('governance')
  .description('AI Governance CLI — manage and enforce governance across projects')
  .version('1.0.0');

program
  .command('verify')
  .description('Verify governance compliance for a project (exits 1 on failure)')
  .option('-p, --project <slug>', 'Project slug')
  .option('-u, --api-url <url>', 'Governance API URL')
  .option('-k, --api-key <key>', 'Project API key')
  .option('-s, --strict', 'Fail on DRIFTED status too (not just NON_COMPLIANT)')
  .action(verifyCommand);

program
  .command('sync')
  .description('Sync governance artifacts from disk to the registry')
  .option('-u, --api-url <url>', 'Governance API URL')
  .action(syncCommand);

program
  .command('status')
  .description('Show governance configuration for a project')
  .option('-p, --project <slug>', 'Project slug')
  .option('-u, --api-url <url>', 'Governance API URL')
  .action(statusCommand);

program
  .command('init')
  .description('Initialize governance configuration for a project')
  .requiredOption('-n, --name <name>', 'Project name')
  .option('--path <path>', 'Project path (defaults to cwd)')
  .option('-u, --api-url <url>', 'Governance API URL')
  .action(initCommand);

program.parse();
