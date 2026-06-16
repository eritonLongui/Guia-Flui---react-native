#!/usr/bin/env node

/**
 * Setup automático do projeto Rota.
 * Instala dependências, valida ambiente e verifica TypeScript.
 *
 * Uso: npm run setup
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function title(text) {
  console.log(`\n${colors.cyan}${text}${colors.reset}`);
}

function step(text) {
  console.log(`${colors.dim}→${colors.reset} ${text}`);
}

function success(text) {
  console.log(`${colors.green}✓${colors.reset} ${text}`);
}

function run(command, options = {}) {
  step(command);
  execSync(command, {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, ...options.env },
  });
}

function tryRun(command) {
  const result = spawnSync(command, {
    cwd: ROOT,
    shell: true,
    stdio: 'inherit',
    env: process.env,
  });
  return result.status === 0;
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

function ensureNodeVersion() {
  const min = [20, 19, 4];
  const current = parseVersion(process.version);

  if (compareVersions(current, min) < 0) {
    console.error(
      `\n${colors.red}Node.js ${process.version} não é suportado.${colors.reset}`,
    );
    console.error(`Requerido: >= v${min.join('.')}`);
    console.error('\nCorreção rápida:');
    console.error('  nvm install && nvm use');
    console.error('  # ou');
    console.error('  asdf install && asdf set nodejs 22.13.0');
    process.exit(1);
  }
}

function installDependencies() {
  const lockfile = path.join(ROOT, 'package-lock.json');
  const nodeModules = path.join(ROOT, 'node_modules');

  if (fs.existsSync(lockfile)) {
    run('npm ci');
  } else {
    run('npm install');
  }

  if (!fs.existsSync(nodeModules)) {
    console.error(`\n${colors.red}Falha: node_modules não foi criado.${colors.reset}`);
    process.exit(1);
  }

  success('Dependências instaladas');
}

function runTypecheck() {
  title('Verificando TypeScript');
  try {
    run('npx tsc --noEmit');
    success('TypeScript OK');
  } catch {
    console.error(`\n${colors.yellow}Aviso: TypeScript encontrou erros.${colors.reset}`);
    console.error('O projeto pode não compilar até corrigir os tipos.');
  }
}

function runEnvCheck() {
  title('Validando ambiente');
  const ok = tryRun('node scripts/check-env.js');
  if (!ok) {
    process.exit(1);
  }
}

function printNextSteps() {
  title('Próximos passos');

  console.log(`
  ${colors.green}Desenvolvimento${colors.reset}
    npm start          Inicia o Expo (QR Code / emulador)
    npm run ios        Abre no simulador iOS
    npm run android    Abre no emulador Android
    npm run web        Abre no navegador

  ${colors.green}Qualidade${colors.reset}
    npm run typecheck  Verifica tipos TypeScript
    npm run validate   Ambiente + TypeScript

  ${colors.green}Build nativo (opcional)${colors.reset}
    npm run prebuild        Gera pastas ios/ e android/
    npm run build:android   Build Android local (requer prebuild)
    npm run build:ios       Build iOS local (requer prebuild + Xcode)

  ${colors.dim}Dica: instale o app Expo Go no celular e escaneie o QR Code.${colors.reset}
`);
}

function main() {
  console.log(`${colors.cyan}
  ╔══════════════════════════════════╗
  ║     Rota — Setup Automático      ║
  ╚══════════════════════════════════╝${colors.reset}`);

  title('1/4 — Node.js');
  ensureNodeVersion();
  success(`Node.js ${process.version}`);

  title('2/4 — Dependências');
  installDependencies();

  title('3/4 — TypeScript');
  runTypecheck();

  title('4/4 — Ambiente');
  runEnvCheck();

  success('Setup concluído com sucesso!');
  printNextSteps();
}

main();
