import fs from 'node:fs';
import path from 'node:path';

const appDir = path.join(process.cwd(), 'src/app');

const skipPaths = new Set([
  'page.tsx',
  '(auth)/login/page.tsx',
  '(auth)/signup/page.tsx',
  '(auth)/onboarding/page.tsx',
  '(tenant)/crm/new/page.tsx',
  '(tenant)/inventory/quick/page.tsx',
  '(tenant)/crm/evaluation/new/page.tsx',
  '(tenant)/orders/reservation/page.tsx',
  '(tenant)/fiscal/nfe/new/page.tsx',
  '(tenant)/fiscal/nfse/new/page.tsx',
  '(tenant)/reports/page.tsx',
]);

function getVariant(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/');

  if (normalized.includes('/kanban/')) return 'kanban';
  if (normalized.includes('/ai/')) return 'chat';
  if (normalized.includes('[id]')) return 'detail';
  if (
    normalized.endsWith('/dashboard/page.tsx') ||
    normalized.endsWith('/master/page.tsx') ||
    normalized.endsWith('/master/analytics/page.tsx')
  ) {
    return 'dashboard';
  }
  if (
    normalized.endsWith('/finance/page.tsx') ||
    normalized.endsWith('/fiscal/page.tsx') ||
    normalized.endsWith('/crm/lost-sales/page.tsx') ||
    normalized.endsWith('/integrator/page.tsx')
  ) {
    return 'overview';
  }
  if (
    normalized.endsWith('/settings/page.tsx') ||
    normalized.endsWith('/site/page.tsx')
  ) {
    return 'form';
  }
  if (
    normalized.includes('/accounts/') ||
    normalized.includes('/settings/users/') ||
    normalized.includes('/settings/roles/') ||
    normalized.includes('/settings/alert-rules/') ||
    normalized.includes('/support/') ||
    normalized.includes('/finance/dispatcher/') ||
    normalized.includes('/documents/generate/') ||
    normalized.includes('/documents/windshield/') ||
    normalized.includes('/documents/deal-cover/') ||
    normalized.includes('/master/plans/') ||
    normalized.includes('/master/announcements/') ||
    normalized.includes('/master/support/') ||
    normalized.includes('/master/taxonomy/')
  ) {
    return 'form-table';
  }
  return 'table';
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }
    if (entry.name === 'page.tsx') {
      files.push(fullPath);
    }
  }
  return files;
}

const pages = walk(appDir);
let created = 0;

for (const pagePath of pages) {
  const relative = path.relative(appDir, pagePath);
  if (skipPaths.has(relative)) continue;

  const variant = getVariant(relative);
  const loadingPath = path.join(path.dirname(pagePath), 'loading.tsx');
  const content = `import { PageSkeleton } from '@/components/dastone/skeleton/PageSkeleton';

export default function Loading() {
  return <PageSkeleton variant="${variant}" />;
}
`;

  fs.writeFileSync(loadingPath, content);
  created += 1;
}

console.log(`Created ${created} loading.tsx files.`);
