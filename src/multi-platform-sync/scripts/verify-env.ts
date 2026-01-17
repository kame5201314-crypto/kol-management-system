/**
 * Environment Verification Script
 * Validates that environment variables are correctly configured
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load .env.local file manually
function loadEnvFile() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8');
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    return true;
  }
  return false;
}

const envLoaded = loadEnvFile();

const EXPECTED_PROJECT_ID = process.env.EXPECTED_SUPABASE_PROJECT_ID || 'your-project-id';

async function verifyEnvironment() {
  console.log('🔍 Verifying environment variables...\n');

  if (envLoaded) {
    console.log('📄 Loaded .env.local file\n');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let hasErrors = false;

  // Check Supabase URL
  if (!supabaseUrl) {
    console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_URL is not set!');
    hasErrors = true;
  } else {
    console.log('✅ NEXT_PUBLIC_SUPABASE_URL is set');

    // Validate project ID if not using placeholder
    if (EXPECTED_PROJECT_ID !== 'your-project-id' && !supabaseUrl.includes(EXPECTED_PROJECT_ID)) {
      console.error('❌ ERROR: Supabase URL does not match expected project!');
      console.error(`   Expected project ID: ${EXPECTED_PROJECT_ID}`);
      console.error(`   Current URL: ${supabaseUrl}`);
      hasErrors = true;
    }
  }

  // Check Supabase Anon Key
  if (!supabaseAnonKey) {
    console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set!');
    hasErrors = true;
  } else {
    console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set');
  }

  // Check Service Role Key (optional for dev, required for prod)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.warn('⚠️  WARNING: SUPABASE_SERVICE_ROLE_KEY is not set (required for admin operations)');
  } else {
    console.log('✅ SUPABASE_SERVICE_ROLE_KEY is set');
  }

  console.log('');

  if (hasErrors) {
    console.error('❌ Environment verification failed!');
    console.error('   Please check your .env.local file');
    process.exit(1);
  }

  console.log('✅ Environment variables verified successfully');
  console.log(`   Project: multi-platform-sync`);
  if (supabaseUrl) {
    const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    console.log(`   Supabase Project ID: ${projectId || 'unknown'}`);
  }
}

verifyEnvironment();
