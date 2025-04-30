#!/usr/bin/env node

import { Command } from 'commander';
import { fixMetadata } from '../lib/fix-metadata.js';
import chalk from 'chalk';

const program = new Command();

program
  .name('fix-next14-metadata')
  .description('Codemod to fix Next.js 14 metadata (viewport, themeColor)')
  .version('1.0.0')
  .option('--dry-run', 'Show what would be modified without making changes')
  .option('--ci', 'CI mode: no backups, exit code indicates success/failure')
  .option('--ext <extensions>', 'File extensions to process (comma-separated)', '.js,.jsx,.ts,.tsx');

program.parse();

const options = program.opts();

console.log(chalk.blue('🚀 Starting Next.js 14 metadata fixer'));

try {
  await fixMetadata({
    dryRun: options.dryRun,
    ci: options.ci,
    ext: options.ext
  });
} catch (error) {
  console.error(chalk.red('❌ Fatal error:'), error);
  process.exit(1);
}
