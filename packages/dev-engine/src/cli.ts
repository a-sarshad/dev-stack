#!/usr/bin/env node
import { Command } from 'commander'
import { resolve } from 'path'
import { watch } from 'fs'
import chalk from 'chalk'
import { loadConfig } from './config.js'
import { run } from './engine.js'
import { printResult, printJSON } from './reporter.js'
import { runInit, type InitOptions } from './init.js'
import { runDoctor } from './doctor.js'
import { runFigmaSync } from './figma-sync.js'
import { runLayoutDerive } from './layout-derive.js'
import { loadMergedResolve, resolveName } from './cache.js'
import { loadDsRegistry, findDevKnowledge } from './paths.js'
import type { RunOptions } from './types.js'

const program = new Command()

program
  .name('dev-engine')
  .description('Project consistency checker & auto-fixer — RTL/LTR, DS-agnostic')
  .version('0.1.0')

// ── Main check command ────────────────────────────────────────────────────────
program
  .argument('[path]', 'project root or src directory', '.')
  .option('--fix', 'auto-fix fixable violations', false)
  .option('--report-only', 'print report without fixing', false)
  .option('--changed', 'check only git-changed files', false)
  .option('--module <ids>', 'run specific modules only (comma-separated)')
  .option('--json', 'output as JSON', false)
  .option('--verbose', 'show all files including clean ones', false)
  .option('--exit-zero', 'always exit 0 (useful for CI report-only pipelines)', false)
  .option('--config <path>', 'explicit path to .dev-engine.json (overrides auto-detect)')
  .option('--watch', 'watch for file changes and re-run automatically', false)
  .action(async (inputPath: string, opts: {
    fix: boolean
    reportOnly: boolean
    changed: boolean
    module?: string
    json: boolean
    verbose: boolean
    exitZero: boolean
    config?: string
    watch: boolean
  }) => {
    const projectRoot = resolve(process.cwd(), inputPath)
    const config = loadConfig(projectRoot, opts.config)

    const options: RunOptions = {
      fix: opts.fix && !opts.reportOnly,
      reportOnly: opts.reportOnly,
      changed: opts.changed,
      modules: opts.module?.split(',').map(m => m.trim()),
      verbose: opts.verbose,
    }

    const doRun = async (label?: string) => {
      if (label) console.log(`\n🔄  ${label}\n`)
      else {
        console.log(`\n🔍 dev-engine — checking ${projectRoot}`)
        console.log(`   direction: ${config.direction} | ds: ${config.ds} | locale: ${config.locale}\n`)
      }

      const results = await run(projectRoot, config, options)

      if (opts.json) {
        printJSON(results)
      } else {
        printResult(results, opts.verbose)
      }

      return results.some(r => r.violations.some(v => v.severity === 'error'))
    }

    const hasErrors = await doRun()

    if (opts.watch) {
      console.log('\n👁️  Watching for changes… (Ctrl+C to stop)\n')
      let debounce: ReturnType<typeof setTimeout> | null = null

      watch(projectRoot, { recursive: true }, (_event, filename) => {
        if (!filename) return
        if (!/\.(tsx?|jsx?)$/.test(filename)) return
        if (/node_modules|\.git|dist|build/.test(filename)) return

        if (debounce) clearTimeout(debounce)
        debounce = setTimeout(() => doRun(`Changed: ${filename}`), 300)
      })
      return
    }

    process.exit(opts.exitZero ? 0 : (hasErrors ? 1 : 0))
  })

// ── Init subcommand ───────────────────────────────────────────────────────────
program
  .command('init [dir]')
  .description('create .dev-engine.json + scaffold CLAUDE.md و .claude/ (تعاملی یا با --yes)')
  .option('-y, --yes', 'non-interactive: از flagها/پیش‌فرض‌ها استفاده کن، سؤال نپرس', false)
  .option('--auto', 'پیش‌فرض‌ها را از کدبیس تشخیص بده (ds/direction/locale/calendar/icons)', false)
  .option('--direction <dir>', 'rtl | ltr | both')
  .option('--locale <locale>', 'مثلاً fa-IR')
  .option('--calendar <cal>', 'jalali | hijri | gregorian')
  .option('--ds <id>', 'design system id')
  .option('--icons <lib>', 'icon library')
  .option('--name <name>', 'نام پروژه (پیش‌فرض: نام پوشه)')
  .option('--typecheck <cmd>', 'دستور type-check')
  .option('--no-scaffold', 'فقط .dev-engine.json بساز، CLAUDE.md/.claude/ نه')
  .option('--force', 'اجازهٔ overwrite کردن .dev-engine.json موجود', false)
  .action(async (dir: string | undefined, opts: InitOptions) => {
    const targetDir = resolve(process.cwd(), dir ?? '.')
    await runInit(targetDir, opts)
  })

// ── Doctor — preflight (BLUEPRINT §3 STEP 0) ──────────────────────────────────
program
  .command('doctor [path]')
  .description('preflight: env، DS، cache، freshness — قبل از impl اجرا کن')
  .option('--config <path>', 'explicit path to .dev-engine.json')
  .action((path: string | undefined, opts: { config?: string }) => {
    const projectRoot = resolve(process.cwd(), path ?? '.')
    const config = loadConfig(projectRoot, opts.config)
    const ok = runDoctor(projectRoot, config)
    process.exit(ok ? 0 : 1)
  })

// ── Resolve — Figma name → code mapping (cache local، صفر MCP) ─────────────────
program
  .command('resolve <name>')
  .description('یه component/token نام Figma رو از cache local به mapping کد resolve کن')
  .option('--config <path>', 'explicit path to .dev-engine.json')
  .option('--json', 'output as JSON', false)
  .action((name: string, opts: { config?: string; json: boolean }) => {
    const projectRoot = process.cwd()
    const config = loadConfig(projectRoot, opts.config)
    const merged = loadMergedResolve(projectRoot, config)
    const hit = resolveName(merged, name)
    if (opts.json) {
      console.log(JSON.stringify(hit))
      process.exit(hit ? 0 : 2)
    }
    if (!hit) {
      console.log(chalk.yellow(`✗ no mapping for "${name}" — Local+DS miss → از DS MCP بگیر یا Build last`))
      process.exit(2)
    }
    console.log(`${chalk.cyan('[' + hit.kind + ']')}  ${name} → ${chalk.green(hit.value)}`)
  })

// ── Figma-sync — validate/scaffold cache (BLUEPRINT §6) ───────────────────────
program
  .command('figma-sync [path]')
  .description('وضعیت/scaffold لایه‌های figma-resolve cache (population: MCP via Claude یا REST)')
  .option('--config <path>', 'explicit path to .dev-engine.json')
  .option('--init', 'یه template خالی figma-resolve.json در .claude/context/ بساز', false)
  .option('--scan', 'src/components رو scan کن و لایه Local رو auto-populate کن', false)
  .action((path: string | undefined, opts: { config?: string; init: boolean; scan: boolean }) => {
    const projectRoot = resolve(process.cwd(), path ?? '.')
    const config = loadConfig(projectRoot, opts.config)
    runFigmaSync(projectRoot, config, { init: opts.init, scan: opts.scan })
  })

// ── Layout-derive — سمت و ترتیب را از هندسهٔ فیگما حساب کن، نه از قضاوت چشم ─────
// فقط چاپ می‌کند؛ هیچ فایلی نمی‌نویسد و هیچ چک خودکاری را تغذیه نمی‌کند (چرا →
// کامنت بالای layout-derive.ts). خروجی برای پر کردن «جدول ترجمه» است.
program
  .command('layout-derive [path]')
  .description('justify/align/ترتیب فرزندها را از مختصات خام فیگما (دامپ get_metadata) حساب و چاپ می‌کند')
  .option('--config <path>', 'explicit path to .dev-engine.json')
  .option('--metadata <file>', 'فایل دامپ XML خروجی get_metadata')
  .option('--node <id>', 'فقط همین node و زیرمجموعه‌اش (پیش‌فرض: کل دامپ)')
  .option('--depth <n>', 'حداکثر عمق پیمایش (پیش‌فرض ۳)')
  .action((path: string | undefined, opts: { config?: string; metadata?: string; node?: string; depth?: string }) => {
    if (!opts.metadata) {
      console.error('--metadata <file> لازم است (خروجی get_metadata را در فایل بریز)')
      process.exit(1)
    }
    const projectRoot = resolve(process.cwd(), path ?? '.')
    const config = loadConfig(projectRoot, opts.config)
    const ok = runLayoutDerive(projectRoot, config, {
      metadata: opts.metadata,
      node: opts.node,
      depth: opts.depth ? Number(opts.depth) : undefined,
    })
    process.exit(ok ? 0 : 1)
  })

// ── ds-list — design systemهای موجود در knowledge/ ─────────────────────────
program
  .command('ds-list')
  .description('لیست design systemهای ثبت‌شده (design-systems/*/ds.json) با contract و targets')
  .option('--config <path>', 'explicit path to knowledge/')
  .option('--json', 'output as JSON', false)
  .action((opts: { config?: string; json: boolean }) => {
    const registry = loadDsRegistry(opts.config)
    if (opts.json) {
      console.log(JSON.stringify(registry, null, 2))
      return
    }
    const dn = findDevKnowledge(opts.config)
    console.log(chalk.bold(`\n🎨 design systems — ${dn ?? 'knowledge/ پیدا نشد'}\n`))
    if (registry.length === 0) {
      console.log(chalk.yellow('  هیچ ds.json پیدا نشد.'))
      console.log(chalk.gray('  یه DS جدید: پوشه‌ی design-systems/_TEMPLATE/ رو کپی کن و ds.json رو پر کن.\n'))
      return
    }
    for (const m of registry) {
      const alias = m.aliases?.length ? chalk.gray(` (${m.aliases.join(', ')})`) : ''
      const meta = [
        m.package ? `pkg ${m.package}` : 'بدون package',
        m.targets ? `targets ${m.targets}` : null,
        m.contract !== undefined ? `contract v${m.contract}` : chalk.yellow('بدون contract'),
      ].filter(Boolean).join(chalk.gray(' · '))
      console.log(`  ${chalk.cyan(m.id)}${alias}  ${chalk.gray('→')} ${m.folder}`)
      console.log(`    ${chalk.gray(meta)}`)
    }
    console.log()
  })

program.parse()
