import { existsSync, writeFileSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import chalk from 'chalk'
import type { LayoutSnapshot, LayoutSnapshotCache } from './types.js'
import { layoutCachePath, loadLayoutSnapshots, layoutCacheAgeDays, writeLayoutSnapshot } from './layout-cache.js'

// ── اعتبارسنجی snapshot ───────────────────────────────────────────────────────
// snapshot دستی نوشته می‌شد و هیچی اعتبارسنجی‌ش نمی‌کرد. رایج‌ترین خطا: نوشتن
// مقدار فیزیکی («right») به‌جای semantic («start»)، که چون canvas فیگما LTR است
// باعث می‌شد کل قضاوت در RTL برعکس بشه. اینجا جلوش گرفته می‌شه.
const ALLOWED: Record<string, string[]> = {
  textAlign: ['start', 'end', 'center'],
  iconSide: ['start', 'end'],
  justify: ['start', 'end', 'center', 'between', 'around', 'evenly'],
  align: ['start', 'end', 'center', 'stretch', 'baseline'],
  layoutMode: ['HORIZONTAL', 'VERTICAL', 'NONE'],
}

const PHYSICAL = ['left', 'right', 'flex-start', 'flex-end', 'space-between']

export function validateSnapshot(snap: unknown): string[] {
  const errs: string[] = []
  if (typeof snap !== 'object' || snap === null || Array.isArray(snap)) {
    return ['snapshot باید یک آبجکت باشه']
  }
  const s = snap as Record<string, unknown>

  for (const [key, allowed] of Object.entries(ALLOWED)) {
    const v = s[key]
    if (v === undefined) continue
    if (typeof v !== 'string' || !allowed.includes(v)) {
      const hint = typeof v === 'string' && PHYSICAL.includes(v)
        ? `  ← «${v}» فیزیکیه. اول به semantic ترجمه کن: در RTL راست=start و چپ=end`
        : ''
      errs.push(`${key}: «${String(v)}» مجاز نیست — یکی از [${allowed.join(', ')}]${hint}`)
    }
  }

  if (s.childOrder !== undefined) {
    if (!Array.isArray(s.childOrder) || s.childOrder.some(n => typeof n !== 'string')) {
      errs.push('childOrder: باید آرایه‌ای از رشته (اسم tag/component) باشه')
    } else if (s.childOrder.length < 2) {
      errs.push('childOrder: کمتر از ۲ عضو چیزی رو چک نمی‌کنه — یا کاملش کن یا حذفش کن')
    }
  }

  if (s.iconColor !== undefined) {
    if (typeof s.iconColor !== 'string') errs.push('iconColor: باید رشته باشه')
    else if (/^#|^rgb/i.test(s.iconColor)) {
      errs.push(`iconColor: «${s.iconColor}» رنگ خامه — اسم توکن بده (مثل fg.muted یا brand.solid)`)
    }
  }

  const known = new Set([...Object.keys(ALLOWED), 'childOrder', 'iconColor', '_synced', '_source', '_note'])
  for (const k of Object.keys(s)) {
    if (!known.has(k)) errs.push(`فیلد ناشناخته «${k}» — تایپی؟ (فیلدهای معتبر: ${[...known].filter(x => !x.startsWith('_')).join(', ')})`)
  }

  return errs
}

// نوشتن یک snapshot با اعتبارسنجی — جایگزین ویرایش دستی JSON.
export function runLayoutSet(projectRoot: string, name: string, raw: string): boolean {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (e) {
    console.log(chalk.red(`✗ JSON نامعتبر: ${(e as Error).message}`))
    return false
  }

  const errs = validateSnapshot(parsed)
  if (errs.length > 0) {
    console.log(chalk.red(`\n✗ snapshot «${name}» رد شد:\n`))
    for (const e of errs) console.log(chalk.red(`   • ${e}`))
    console.log(chalk.gray('\n  یادآوری: مقادیر semantic ان، نه فیزیکی. در RTL: start=راست · end=چپ\n'))
    return false
  }

  writeLayoutSnapshot(projectRoot, name, parsed as LayoutSnapshot)
  const fields = Object.keys(parsed as object).filter(k => !k.startsWith('_'))
  console.log(chalk.green(`✓ ${name} ذخیره شد (${fields.join(', ')}) → ${layoutCachePath(projectRoot)}`))
  return true
}

// layout-sync: وضعیت/scaffold cache figma-layout.json (population واقعی = MCP، توسط
// Claude موقع STEP 2 dev-implement — این CLI فقط template می‌سازه و گزارش می‌ده).
export function runLayoutSync(projectRoot: string, opts: { init: boolean }): void {
  const path = layoutCachePath(projectRoot)

  if (opts.init) {
    if (existsSync(path)) {
      console.log(chalk.yellow(`already exists: ${path}`))
      return
    }
    const template: LayoutSnapshotCache = {}
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, JSON.stringify(template, null, 2) + '\n')
    console.log(chalk.green(`✓ template written: ${path}`))
    console.log(chalk.gray('  حالا STEP 2 dev-implement موقع fetch از فیگما این رو پر می‌کنه.'))
    return
  }

  const snapshots = loadLayoutSnapshots(projectRoot)
  const names = Object.keys(snapshots)
  console.log(chalk.bold(`\n🔄 layout-sync status — ${projectRoot}\n`))
  console.log(`  cache: ${existsSync(path) ? chalk.green('✓ ' + path) : chalk.gray('✗ none — dev-engine layout-sync --init')}`)
  console.log(`  components tracked: ${chalk.cyan(names.length)}`)

  for (const name of names) {
    const age = layoutCacheAgeDays(snapshots[name])
    const ageStr = age !== null ? `${age}d ago${age > 14 ? chalk.yellow(' — کهنه') : ''}` : 'unknown'
    console.log(`   - ${name} (synced: ${ageStr})`)
  }
}
