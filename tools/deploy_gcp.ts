import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

function loadEnvVars(): Record<string, string> {
  const envVars: Record<string, string> = {};

  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  const envPath = path.resolve(process.cwd(), '.env');

  let targetPath = '';
  if (fs.existsSync(envLocalPath)) {
    targetPath = envLocalPath;
  } else if (fs.existsSync(envPath)) {
    targetPath = envPath;
  }

  if (targetPath) {
    console.log(`📄 Loading environment variables from ${path.basename(targetPath)}...`);
    const parsed = dotenv.parse(fs.readFileSync(targetPath));
    Object.assign(envVars, parsed);
  } else {
    console.warn('⚠️ Warning: Neither .env.local nor .env file found.');
  }

  return envVars;
}

function runCmd(cmd: string): void {
  console.log(`-> Executing: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch {
    console.error(`❌ Command failed.`);
    process.exit(1);
  }
}

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main(): Promise<void> {
  // 1. Load env vars from .env.local or .env
  const envVars = loadEnvVars();

  // Ensure production security overrides
  envVars['NODE_ENV'] = 'production';
  envVars['ENVIRONMENT'] = 'production';
  envVars['ENABLE_SEED_ENDPOINT'] = 'false';

  const envProjectId = envVars['GCP_PROJECT_ID'] || process.env.GCP_PROJECT_ID || '';
  const defaultProjectPrompt = envProjectId ? ` [default: ${envProjectId}]` : '';
  const inputProjectId = await askQuestion(`Enter GCP Project ID${defaultProjectPrompt}: `);
  const projectId = inputProjectId || envProjectId;

  if (!projectId) {
    console.error('❌ GCP Project ID is required.');
    process.exit(1);
  }

  const envRegion = envVars['GCP_REGION'] || process.env.GCP_REGION || '';
  const defaultRegionPrompt = envRegion ? ` [default: ${envRegion}]` : '';
  const inputRegion = await askQuestion(`Enter GCP Region${defaultRegionPrompt}: `);
  const region = inputRegion || envRegion;

  if (!region) {
    console.error('❌ GCP Region is required.');
    process.exit(1);
  }

  // Use a different container / service name than Python's 'trilho-app'
  const containerName = envVars['GCP_CONTAINER_NAME'] || envVars['GCP_SERVICE_NAME'] || 'trilho-next';

  console.log(`\n🚀 Starting GCP Cloud Run Deployment for Trilho Node/Next.js (${containerName})...`);

  // 2. Set project
  runCmd(`gcloud config set project ${projectId}`);

  // 3. Build set-env-vars flag
  const envPairs = Object.entries(envVars).map(([k, v]) => `${k}=${v}`);
  const envFlag = envPairs.length > 0 ? `--set-env-vars "^;^${envPairs.join(';')}"` : '';

  // 4. Deploy to Cloud Run with injected env vars
  console.log(`-> Injecting ${Object.keys(envVars).length} environment variables to Cloud Run...`);
  const deployCmd = [
    `gcloud run deploy ${containerName}`,
    `--source .`,
    `--region ${region}`,
    `--platform managed`,
    `--cpu 1`,
    `--memory 512Mi`,
    `--min-instances 0`,
    `--max-instances 1`,
    `--concurrency 30`,
    `--timeout 30`,
    envFlag,
    `--allow-unauthenticated`,
  ]
    .filter(Boolean)
    .join(' ');

  runCmd(deployCmd);

  console.log('\n✅ Deployment completed successfully with injected environment variables!');
}

main();
