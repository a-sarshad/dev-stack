import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import chalk from 'chalk'
import type { ProjectConfig } from './types.js'
import { loadMergedResolve, cacheAgeDays } from './cache.js'
import { loadLayoutSnapshots } from './layout-cache.js'
import { findDevKnowledge, findDs, loadDsRegistry, dsPackage } from './paths.js'

const STALE_DAYS = 7

interface Check {
  label: string
  ok: boolean
  warn?: boolean   // warn = نرم (preflight رد نمی‌شه)، !ok && !warn = hard fail
  detail?: string
}

// نسخه‌ی نصب‌شده‌ی یه package از node_modules پروژه
function installedVersion(projectRoot: string, pkg: string): string | null {
  try {
    const raw = readFileSync(resolve(projectRoot, 'node_modules', pkg, 'package.json'), 'utf-8')
    return (JSON.parse(raw) as { version?: string }).version ?? null
  } catch {
    return null
  }
}

// مقایسه‌ی نسخه با range مانیفست — عمداً فقط major (و برای 0.x، minor).
// این جای semver کامل رو نمی‌گیره؛ هدفش فقط گرفتن «دانش DS برای major دیگه‌ایه»ست
// که تنها حالتیه که واقعاً دانش رو بی‌اعتبار می‌کنه.
function majorOf(version: string): string | null {
  const m = version.trim().replace(/^[\^~>=<\s]*/, '').match(/^(\d+)(?:\.(\d+))?/)
  if (!m) return null
  return m[1] === '0' ? `0.${m[2] ?? '0'}` : m[1]
}

export function runDoctor(projectRoot: string, config: ProjectConfig): boolean {
  const checks: Check[] = []

  // 1. config file موجوده؟ (hard)
  const cfgOk = existsSync(resolve(projectRoot, '.dev-engine.json'))
  checks.push({ label: '.dev-engine.json', ok: cfgOk, detail: cfgOk ? '' : 'run: dev-engine init' })

  // 2. dev-knowledge پیدا می‌شه؟ (warn) — همه‌ی چک‌های DS پایین به این وابسته‌ان
  const dn = findDevKnowledge(config.dev_knowledge_path)
  checks.push({ label: 'dev-knowledge', ok: !!dn, warn: !dn, detail: dn ?? 'set DN_PATH یا config.dev_knowledge_path' })

  // 3. رجیستری DS — مقدار config.ds واقعاً به یه پوشه‌ی design-systems/ می‌خوره؟
  //    این چک برای همون حالتیه که قبلاً بی‌صدا می‌گذشت: ds اشتباه → لایه‌ی DS
  //    هیچ‌وقت لود نمی‌شد و فقط یه ⚠ مبهم «DS:✗» می‌دید.
  const registry = loadDsRegistry(config.dev_knowledge_path)
  const manifest = findDs(config.ds, config.dev_knowledge_path)
  const isGeneric = config.ds === 'generic'

  if (registry.length === 0) {
    // رجیستری خالی (dev-knowledge نیست یا هنوز ds.json نداره) — degrade به warn،
    // نه hard fail. نبودِ مانیفست نباید پروژه‌ی سالم رو زمین بزنه.
    checks.push({
      label: `DS registry (${config.ds})`,
      ok: false,
      warn: true,
      detail: 'رجیستری خالیه — هیچ design-systems/*/ds.json پیدا نشد',
    })
  } else if (!manifest) {
    checks.push({
      label: `DS registry (${config.ds})`,
      ok: false,
      detail: `«${config.ds}» به هیچ پوشه‌ای نمی‌خوره — معتبر: ${registry.map(m => m.id).join(', ')}`,
    })
  } else if (isGeneric) {
    checks.push({
      label: 'DS registry (generic)',
      ok: false,
      warn: true,
      detail: 'لایه‌ی DS عمداً غیرفعاله — اگه پروژه واقعاً کتابخونه داره، ds رو درست کن',
    })
  } else {
    checks.push({ label: `DS registry (${config.ds})`, ok: true, detail: manifest.folder })
  }

  // 4. DS package نصبه؟ (hard اگه DS مشخصه)
  const pkg = manifest?.package ?? dsPackage(config.ds)
  if (pkg) {
    const installed = existsSync(resolve(projectRoot, 'node_modules', pkg))
    checks.push({ label: `DS installed (${pkg})`, ok: installed, detail: installed ? '' : `missing node_modules/${pkg}` })

    // 5. نسخه‌ی نصب‌شده تو range‌ی که دانش DS براش نوشته شده هست؟ (warn)
    const targets = manifest?.targets
    if (installed && targets) {
      const version = installedVersion(projectRoot, pkg)
      const wantMajor = majorOf(targets)
      const gotMajor = version ? majorOf(version) : null
      if (version && wantMajor && gotMajor) {
        const match = wantMajor === gotMajor
        checks.push({
          label: 'DS version',
          ok: match,
          warn: !match,
          detail: match
            ? `${version} ⊂ ${targets}`
            : `نصب‌شده ${version} ولی دانش DS برای ${targets} نوشته شده — پوشه‌ی جدید لازمه`,
        })
      }
    }
  }

  // 6. contract — پروژه روی همون نسخه‌ی قرارداد لایه‌ی اشتراکی پین شده؟ (hard اگه mismatch)
  //    contract یعنی schema‌ی خودِ لایه‌ی DS (شکل figma-resolve، قرارداد override).
  //    mismatch = override‌های پروژه ممکنه غلط تفسیر شن، پس نرم نیست.
  if (manifest?.contract !== undefined) {
    const pinned = config.ds_contract
    if (pinned === undefined) {
      checks.push({
        label: 'DS contract',
        ok: false,
        warn: true,
        detail: `پین نشده — "ds_contract": ${manifest.contract} به .dev-engine.json اضافه کن`,
      })
    } else {
      const match = pinned === manifest.contract
      checks.push({
        label: 'DS contract',
        ok: match,
        detail: match ? `v${pinned}` : `پروژه v${pinned} · لایه‌ی DS v${manifest.contract} — قرارداد عوض شده`,
      })
    }
  }

  // 7. figma_source تنظیم شده؟ (warn — اول پروژه باید پرسیده شه)
  const hasSource = !!config.figma_source
  checks.push({
    label: 'figma_source',
    ok: hasSource,
    warn: !hasSource,
    detail: hasSource ? config.figma_source! : 'اول پروژه بپرس: mcp یا rest → .dev-engine.json',
  })

  // 8. cache layers موجودن؟ (warn) — با پیام تفکیک‌شده، نه یه «DS:✗» مبهم
  const merged = loadMergedResolve(projectRoot, config)
  const anyCache = merged._layers.ds || merged._layers.local
  let cacheDetail = `DS:${merged._layers.ds ? '✓' : '✗'} Local:${merged._layers.local ? '✓' : '✗'}`
  if (!merged._layers.ds) {
    if (isGeneric) cacheDetail += ' — لایه‌ی DS نداره (generic)'
    else if (manifest) cacheDetail += ` — design-systems/${manifest.folder}/figma-resolve.json نیست`
    else cacheDetail += ' — پوشه‌ی DS پیدا نشد (بالا رو ببین)'
  }
  checks.push({ label: 'figma-resolve cache', ok: anyCache, warn: !anyCache, detail: cacheDetail })

  // 9. staleness (warn اگه کهنه)
  const age = cacheAgeDays(merged)
  if (age !== null) {
    const stale = age > STALE_DAYS
    checks.push({ label: 'cache freshness', ok: !stale, warn: stale, detail: `${age}d old${stale ? ' — re-sync لازمه' : ''}` })
  }

  // 10. پوشش layout snapshot (warn) — بدون این، ماژول layout-diff بی‌صدا no-op می‌شه
  //     و preflight «سبز» می‌ده در حالی که هیچ تطابقی با طرح چک نمی‌شه.
  const snapshots = loadLayoutSnapshots(projectRoot)
  const tracked = Object.keys(snapshots).length
  checks.push({
    label: 'layout snapshots',
    ok: tracked > 0,
    warn: tracked === 0,
    detail: tracked > 0
      ? `${tracked} component(s) — layout-diff فعاله`
      : 'خالی — layout-diff هیچی چک نمی‌کنه. dev-implement STEP 2 یا: dev-engine layout-sync --set',
  })

  // print
  console.log(chalk.bold(`\n🩺 dev-engine doctor — ${projectRoot}\n`))
  let hardFail = false
  for (const c of checks) {
    const icon = c.ok ? chalk.green('✓') : c.warn ? chalk.yellow('⚠') : chalk.red('✗')
    if (!c.ok && !c.warn) hardFail = true
    console.log(`  ${icon}  ${c.label}${c.detail ? chalk.gray('  — ' + c.detail) : ''}`)
  }

  console.log('\n' + '─'.repeat(60))
  if (hardFail) console.log(chalk.red('❌ preflight failed — برطرف کن قبل از impl'))
  else if (checks.some(c => c.warn)) console.log(chalk.yellow('⚠️  preflight passed با warning (impl مجازه)'))
  else console.log(chalk.green('✅ preflight clean — آماده‌ی impl'))

  return !hardFail
}
