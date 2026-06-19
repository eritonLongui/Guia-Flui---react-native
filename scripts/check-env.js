#!/usr/bin/env node

/**
 * Valida se o ambiente local atende aos requisitos do projeto Guia Flui.
 * Uso: npm run setup:check
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MIN_NODE = [20, 19, 4];

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(icon, message, color = colors.reset) {
  console.log(`${color}${icon} ${message}${colors.reset}`);
}

function parseVersion(version) {
  return version.replace(/^v/, '').split('.').map((n) => Number(n));
}

function compareVersions(a, b) {
  for (let i = 0; i < 3; i += 1) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av > bv) return 1;
    if (av < bv) return -1;
  }
  return 0;
}

function commandExists(command) {
  try {
    execSync(`command -v ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function getCommandVersion(command, args = ['--version']) {
  try {
    const output = execSync(`${command} ${args.join(' ')}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const match = output.match(/(\d+\.\d+\.\d+)/);
    return match ? match[1] : output.trim();
  } catch {
    return null;
  }
}

const checks = [];
let hasError = false;
let hasWarning = false;

function pass(message) {
  checks.push({ ok: true, message });
  log('✓', message, colors.green);
}

function warn(message) {
  checks.push({ ok: 'warn', message });
  hasWarning = true;
  log('!', message, colors.yellow);
}

function fail(message) {
  checks.push({ ok: false, message });
  hasError = true;
  log('✗', message, colors.red);
}

console.log(`\n${colors.cyan}Guia Flui — verificação de ambiente${colors.reset}\n`);

const nodeVersion = parseVersion(process.version);
if (compareVersions(nodeVersion, MIN_NODE) >= 0) {
  pass(`Node.js ${process.version} (mínimo: v${MIN_NODE.join('.')})`);
} else {
  fail(
    `Node.js ${process.version} é antigo demais. Use v${MIN_NODE.join('.')} ou superior.`,
  );
  log('  ', 'Sugestão: nvm install && nvm use  (arquivo .nvmrc já configurado)', colors.yellow);
  log('  ', 'Sugestão: asdf install && asdf set nodejs 22.13.0', colors.yellow);
}

const npmVersion = getCommandVersion('npm');
if (npmVersion) {
  pass(`npm ${npmVersion}`);
} else {
  fail('npm não encontrado');
}

if (fs.existsSync(path.join(ROOT, 'package.json'))) {
  pass('package.json encontrado');
} else {
  fail('package.json não encontrado');
}

if (fs.existsSync(path.join(ROOT, 'package-lock.json'))) {
  pass('package-lock.json encontrado');
} else {
  warn('package-lock.json ausente — o setup usará npm install');
}

if (fs.existsSync(path.join(ROOT, 'node_modules'))) {
  pass('node_modules instalado');
} else {
  warn('node_modules ausente — rode npm run setup');
}

const envPath = path.join(ROOT, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('GOOGLE_MAPS_API_KEY=') && !envContent.match(/GOOGLE_MAPS_API_KEY=.+/)) {
    warn('.env sem GOOGLE_MAPS_API_KEY — mapa pode não carregar no dev build/APK');
  } else {
    pass('.env configurado');
  }
} else if (fs.existsSync(path.join(ROOT, '.env.example'))) {
  warn('.env ausente — rode npm run setup ou cp .env.example .env');
}

const hasIos = fs.existsSync(path.join(ROOT, 'ios'));
const hasAndroid = fs.existsSync(path.join(ROOT, 'android'));
if (hasIos || hasAndroid) {
  pass(`Pastas nativas: ${[hasIos && 'ios', hasAndroid && 'android'].filter(Boolean).join(', ')}`);
} else {
  warn('Pastas ios/ e android/ ausentes — normal no clone; use npm run prebuild antes do dev build');
}

const optional = [
  { name: 'git', hint: 'controle de versão' },
  { name: 'watchman', hint: 'recomendado no macOS para Metro bundler' },
];

for (const tool of optional) {
  if (commandExists(tool.name)) {
    const version = getCommandVersion(tool.name);
    pass(`${tool.name} ${version ?? ''} (${tool.hint})`.trim());
  } else {
    warn(`${tool.name} não encontrado (${tool.hint})`);
  }
}

if (process.platform === 'darwin') {
  if (commandExists('xcodebuild')) {
    pass('Xcode CLI disponível (build iOS local)');
  } else {
    warn('Xcode CLI não encontrado — necessário apenas para build iOS nativo');
  }
}

console.log('');
if (hasError) {
  log('✗', 'Ambiente com erros. Corrija antes de continuar.', colors.red);
  process.exit(1);
}

if (hasWarning) {
  log('!', 'Ambiente OK com avisos. Você pode continuar.', colors.yellow);
} else {
  log('✓', 'Ambiente pronto!', colors.green);
}

process.exit(0);
