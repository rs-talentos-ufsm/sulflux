#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

// Cores ANSI
const cyan = (text) => `\x1b[36m${text}\x1b[0m`;
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[0m`;

function getPlural(word) {
  if (word.endsWith('y') && !/[aeiou]y$/i.test(word)) {
    return word.slice(0, -1) + 'ies';
  }
  if (/(s|ss|sh|ch|x|z)$/i.test(word)) {
    return word + 'es';
  }
  return word + 's';
}

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function toCamelCase(str) {
  const kebab = toKebabCase(str);
  return kebab.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
}

function toPascalCase(str) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function toUpperSnake(str) {
  return toKebabCase(str).replace(/-/g, '_').toUpperCase();
}

// 1. Argumentos
const rawName = process.argv[2];
const isForce = process.argv.includes('--force');

if (!rawName || rawName.startsWith('--')) {
  console.log(`\n${red('❌ Erro:')} Informe o nome da feature.\n`);
  console.log(`Uso: ${bold('make feature-new name=<nome>')}`);
  console.log(`Exemplo: ${cyan('make feature-new name=announcement')}\n`);
  process.exit(1);
}

// 2. Variações de Nomes
const kebabCase = toKebabCase(rawName);
const camelCase = toCamelCase(rawName);
const PascalCase = toPascalCase(rawName);
const upperSnake = toUpperSnake(rawName);

const rawPlural = getPlural(kebabCase);
const kebabCasePlural = rawPlural;
const camelCasePlural = toCamelCase(rawPlural);
const PascalCasePlural = toPascalCase(rawPlural);
const upperSnakePlural = toUpperSnake(rawPlural);

console.log(`\n${bold(cyan('🚀 Feature Scaffolder (Vertical Slice Architecture)'))}`);
console.log(`${bold('Projeto:')} ${path.basename(projectRoot)}`);
console.log(`${bold('Feature:')} ${green(PascalCase)} (${kebabCase}) -> Plural: ${green(PascalCasePlural)} (${kebabCasePlural})\n`);

// 3. Diretórios
const templatesDir = path.join(projectRoot, '.gemini/templates');
const sharedModulesDir = path.join(projectRoot, 'packages/shared/src/modules', kebabCase);
const sharedIndexFile = path.join(projectRoot, 'packages/shared/src/index.ts');

const backendModulesDir = path.join(projectRoot, 'apps/backend/src/modules', kebabCase);
const backendRoutesIndexFile = path.join(projectRoot, 'apps/backend/src/routes/index.ts');

const frontendHooksDir = path.join(projectRoot, 'apps/frontend/src/hooks');
const frontendPagesDir = path.join(projectRoot, 'apps/frontend/src/pages', kebabCasePlural);
const frontendTestsDir = path.join(projectRoot, 'apps/frontend/tests/pages');

// Validação dos caminhos do projeto
if (!fs.existsSync(templatesDir)) {
  console.error(`${red('❌ Diretório de templates não encontrado em:')} ${templatesDir}`);
  process.exit(1);
}

function renderTemplate(templateName) {
  const filePath = path.join(templatesDir, templateName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Template não encontrado: ${filePath}`);
  }
  let content = fs.readFileSync(filePath, 'utf-8');

  content = content
    .replace(/__PascalCasePlural__/g, PascalCasePlural)
    .replace(/__camelCasePlural__/g, camelCasePlural)
    .replace(/__kebabCasePlural__/g, kebabCasePlural)
    .replace(/__UPPER_SNAKE_PLURAL__/g, upperSnakePlural)
    .replace(/__PascalCase__/g, PascalCase)
    .replace(/__camelCase__/g, camelCase)
    .replace(/__kebabCase__/g, kebabCase)
    .replace(/__UPPER_SNAKE__/g, upperSnake);

  return content;
}

function writeFileSafely(targetPath, content) {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(targetPath) && !isForce) {
    console.log(`  ${yellow('⚠ Ignorado (já existe):')} ${path.relative(projectRoot, targetPath)}`);
    return false;
  }

  fs.writeFileSync(targetPath, content, 'utf-8');
  console.log(`  ${green('✓ Criado:')} ${path.relative(projectRoot, targetPath)}`);
  return true;
}

// 4. Geração em packages/shared
console.log(`${bold('📦 [1/3] packages/shared')}`);
writeFileSafely(
  path.join(sharedModulesDir, `${kebabCase}.schemas.ts`),
  renderTemplate('shared-schema.ts.template')
);
writeFileSafely(
  path.join(sharedModulesDir, `${kebabCase}.types.ts`),
  renderTemplate('shared-types.ts.template')
);
writeFileSafely(
  path.join(sharedModulesDir, 'index.ts'),
  renderTemplate('shared-index.ts.template')
);

// Atualizar barrel packages/shared/src/index.ts
if (fs.existsSync(sharedIndexFile)) {
  let sharedIndex = fs.readFileSync(sharedIndexFile, 'utf-8');
  const exportLine = `export * from './modules/${kebabCase}';`;
  if (!sharedIndex.includes(exportLine)) {
    sharedIndex = `${exportLine}\n` + sharedIndex;
    fs.writeFileSync(sharedIndexFile, sharedIndex, 'utf-8');
    console.log(`  ${green('✓ Atualizado:')} packages/shared/src/index.ts (+ export)`);
  }
}

// 5. Geração em apps/backend
console.log(`\n${bold('⚙️ [2/3] apps/backend')}`);
writeFileSafely(
  path.join(backendModulesDir, `${kebabCase}.service.ts`),
  renderTemplate('backend-service.ts.template')
);
writeFileSafely(
  path.join(backendModulesDir, `${kebabCase}.controller.ts`),
  renderTemplate('backend-controller.ts.template')
);
writeFileSafely(
  path.join(backendModulesDir, `${kebabCase}.routes.ts`),
  renderTemplate('backend-routes.ts.template')
);

// Atualizar apps/backend/src/routes/index.ts
if (fs.existsSync(backendRoutesIndexFile)) {
  let routesIndex = fs.readFileSync(backendRoutesIndexFile, 'utf-8');
  const importLine = `import ${camelCase}Routes from '@/modules/${kebabCase}/${kebabCase}.routes';`;
  const routeLine = `mainRouter.use('/${kebabCasePlural}', ${camelCase}Routes);`;

  let modified = false;
  if (!routesIndex.includes(importLine)) {
    // Insere antes do mainRouter = Router()
    if (routesIndex.includes('const mainRouter')) {
      routesIndex = routesIndex.replace('const mainRouter', `${importLine}\nconst mainRouter`);
    } else {
      routesIndex = `${importLine}\n` + routesIndex;
    }
    modified = true;
  }

  if (!routesIndex.includes(routeLine)) {
    // Insere antes do export default mainRouter
    if (routesIndex.includes('export default mainRouter;')) {
      routesIndex = routesIndex.replace('export default mainRouter;', `// ${PascalCase}\n${routeLine}\n\nexport default mainRouter;`);
    } else {
      routesIndex = routesIndex + `\n${routeLine}\n`;
    }
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(backendRoutesIndexFile, routesIndex, 'utf-8');
    console.log(`  ${green('✓ Atualizado:')} apps/backend/src/routes/index.ts (+ rota /${kebabCasePlural})`);
  }
}

// 6. Geração em apps/frontend
console.log(`\n${bold('🎨 [3/3] apps/frontend')}`);
writeFileSafely(
  path.join(frontendHooksDir, `use${PascalCasePlural}.ts`),
  renderTemplate('frontend-hooks.ts.template')
);
writeFileSafely(
  path.join(frontendPagesDir, `${PascalCasePlural}.tsx`),
  renderTemplate('frontend-page.tsx.template')
);
writeFileSafely(
  path.join(frontendPagesDir, `${PascalCasePlural}.module.css`),
  renderTemplate('frontend-page.module.css.template')
);
writeFileSafely(
  path.join(frontendTestsDir, `${PascalCasePlural}.spec.tsx`),
  renderTemplate('frontend-test.spec.tsx.template')
);

// 7. Snippet Prisma
console.log(`\n${bold(green('✨ Feature vertical scaffolded com sucesso!'))}\n`);
console.log(`${bold('📋 Snippet sugerido para')} ${cyan('apps/backend/prisma/schema.prisma')}:`);
console.log(yellow('------------------------------------------------------------'));
console.log(`model ${PascalCase} {
  id          String   @id @default(uuid())
  name        String
  description String?
  status      String   @default("ACTIVE")
  ownerId     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}`);
console.log(yellow('------------------------------------------------------------'));
console.log(`${bold('Próximos passos:')}`);
console.log(` 1. Cole o modelo acima no seu ${cyan('apps/backend/prisma/schema.prisma')} (se aplicável).`);
console.log(` 2. Execute: ${cyan('cd apps/backend && npx prisma migrate dev --name create_' + kebabCase)}`);
console.log(` 3. Compile os contratos: ${cyan('cd packages/shared && npm run build')}`);
console.log(` 4. Valide a esteira completa: ${cyan('make feature-check')}\n`);
