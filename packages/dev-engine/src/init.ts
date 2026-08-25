import { createInterface } from 'readline'
import { writeFileSync, readFileSync, existsSync, mkdirSync, copyFileSync, chmodSync } from 'fs'
import { resolve, basename, dirname } from 'path'
import { findDevKnowledge, findDs, dsFolder, loadDsRegistry } from './paths.js'

// fallback وقتی رجیستری در دسترس نیست (knowledge پیدا نشد). منبع اصلی
// شناسه‌های DS خودِ رجیستری است — vgl. dsOptions() پایین. قبلاً این لیست ثابت
// تنها منبع بود و با رجیستری drift کرده بود: `bootstrap5` در رجیستری هست ولی
// اینجا نبود، پس validate() آن را به 'generic' تنزل می‌داد.
const DS_FALLBACK = ['chakra-v3', 'chakra-v2', 'mui', 'antd', 'mantine', 'bootstrap5', 'generic']
const ICON_OPTIONS = ['lucide', 'heroicons', 'fa', 'mdi', 'generic']
const DIR_OPTIONS = ['rtl', 'ltr', 'both']
const CAL_OPTIONS = ['jalali', 'hijri', 'gregorian']

function dsOptions(configPath?: string): string[] {
  const ids = loadDsRegistry(configPath).flatMap(m => [m.id, ...(m.aliases ?? [])])
  return ids.length ? Array.from(new Set([...ids, 'generic'])) : DS_FALLBACK
}

function validate(value: string, options: string[], fallback: string): string {
  return options.includes(value) ? value : fallback
}

// ── تشخیص خودکار از روی کدبیس ───────────────────────────────────────────────
// این منطق قبلاً به‌صورت نثر در skill «dev-engine» بود و هر بار توسط مدل اجرا
// می‌شد — با هزینهٔ token و بدون تکرارپذیری. قاعده‌اش ثابت است، پس جایش کد است.
// BLUEPRINT §2: «هر چیز دترمینیستیک = dev-engine (CLI، صفر token)».

export interface DetectedDefaults {
  ds: string
  direction: string
  locale: string
  calendar: string
  icon_lib: string
  evidence: string[]
}

/** dependencies + devDependencies پروژه، یا شیء خالی اگر package.json نبود/خراب بود. */
function readDeps(targetDir: string): Record<string, string> {
  const p = resolve(targetDir, 'package.json')
  if (!existsSync(p)) return {}
  try {
    const pkg = JSON.parse(readFileSync(p, 'utf8')) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }
    return { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }
  } catch {
    return {}
  }
}

/** فایل‌های ورودی رایج که `dir` روی ریشهٔ سند در آن‌ها ست می‌شود. */
const ENTRY_FILES = [
  'index.html', 'public/index.html',
  'src/main.tsx', 'src/main.ts', 'src/App.tsx',
  'app/layout.tsx', 'src/app/layout.tsx',
]

function readEntryFiles(targetDir: string): string {
  return ENTRY_FILES
    .map(rel => resolve(targetDir, rel))
    .filter(existsSync)
    .map(p => { try { return readFileSync(p, 'utf8') } catch { return '' } })
    .join('\n')
}

export function detectProjectDefaults(targetDir: string, configPath?: string): DetectedDefaults {
  const evidence: string[] = []
  const deps = readDeps(targetDir)

  // ── design system — از dependency
  let ds = 'generic'
  const chakra = deps['@chakra-ui/react']
  if (chakra) {
    ds = /\b2\./.test(chakra) || chakra.startsWith('^2') ? 'chakra-v2' : 'chakra-v3'
    evidence.push(`ds=${ds} ← @chakra-ui/react@${chakra}`)
  } else if (deps['@mui/material']) {
    ds = 'mui'; evidence.push('ds=mui ← @mui/material')
  } else if (deps['antd']) {
    ds = 'antd'; evidence.push('ds=antd ← antd')
  } else if (deps['@mantine/core']) {
    ds = 'mantine'; evidence.push('ds=mantine ← @mantine/core')
  } else if (deps['bootstrap']) {
    ds = 'bootstrap5'; evidence.push('ds=bootstrap5 ← bootstrap')
  } else {
    evidence.push('ds=generic ← هیچ کتابخانهٔ شناخته‌شده‌ای در package.json نبود')
  }
  ds = validate(ds, dsOptions(configPath), 'generic')

  // ── direction — از فایل ورودی
  const entry = readEntryFiles(targetDir)
  const rtlMarker = /dir\s*=\s*["'{]?\s*["']?rtl|direction\s*:\s*["']rtl["']/i.test(entry)
  const direction = rtlMarker ? 'rtl' : 'ltr'
  evidence.push(rtlMarker
    ? 'direction=rtl ← نشانهٔ dir="rtl" در فایل ورودی'
    : 'direction=ltr ← نشانهٔ rtl پیدا نشد')

  // ── locale — از الفبای متن فایل ورودی
  // پ چ ژ گ فقط فارسی‌اند؛ بقیهٔ بازهٔ عربی مشترک است.
  let locale = 'en-US'
  if (direction === 'rtl') {
    if (/[پچژگ]/.test(entry)) { locale = 'fa-IR'; evidence.push('locale=fa-IR ← حروف اختصاصی فارسی') }
    else if (/[؀-ۿ]/.test(entry)) { locale = 'ar-SA'; evidence.push('locale=ar-SA ← الفبای عربی بدون حروف فارسی') }
    else { locale = 'fa-IR'; evidence.push('locale=fa-IR ← پیش‌فرض RTL (متنی برای تشخیص نبود)') }
  } else {
    evidence.push('locale=en-US ← پروژه LTR')
  }

  // ── calendar — تابع locale
  const calendar = locale === 'fa-IR' ? 'jalali' : locale === 'ar-SA' ? 'hijri' : 'gregorian'
  evidence.push(`calendar=${calendar} ← از locale`)

  // ── icon library — از dependency
  let icon_lib = 'generic'
  if (deps['lucide-react']) icon_lib = 'lucide'
  else if (deps['@heroicons/react']) icon_lib = 'heroicons'
  else if (deps['react-icons']) icon_lib = 'fa'
  else if (deps['@mdi/js'] || deps['@mdi/react']) icon_lib = 'mdi'
  evidence.push(`icon_lib=${icon_lib} ← package.json`)

  return { ds, direction, locale, calendar, icon_lib, evidence }
}

// ── scaffold ────────────────────────────────────────────────────────────────
// قاعدهٔ ثابت: **هیچ فایل موجودی overwrite نمی‌شود.** init روی یک پروژهٔ زنده هم
// امن است — فقط چیزهای غایب را می‌سازد و بقیه را skip گزارش می‌کند. تنها استثنا
// `.dev-engine.json` است که خودِ کاربر صریحاً تأیید می‌کند.

interface ScaffoldReport {
  created: string[]
  skipped: string[]
  warned: string[]
}

interface Vars {
  PROJECT_NAME: string
  DS: string
  DS_FOLDER: string
  DIRECTION: string
  LANG: string
  LOCALE: string
  CALENDAR: string
  START_SIDE: string
  END_SIDE: string
  DK_PATH: string
  TYPECHECK_CMD: string
  /** مسیر فایل توکن در کد — خانهٔ canonical مقادیر. DESIGN.md فقط به این ارجاع می‌دهد. */
  TOKENS_PATH: string
  /** تاریخ ساخت، برای خط version قالب‌ها. */
  DATE: string
}

function substitute(text: string, vars: Vars): string {
  return text.replace(/\{\{([A-Z_]+)\}\}/g, (match, key: string) =>
    key in vars ? String(vars[key as keyof Vars]) : match
  )
}

function writeNew(path: string, content: string, report: ScaffoldReport, label: string): void {
  if (existsSync(path)) {
    report.skipped.push(label)
    return
  }
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
  report.created.push(label)
}

/**
 * CLAUDE.md را **ترکیبی** می‌سازد: قالب پایهٔ `_TEMPLATE` (پروتکل‌های DS-agnostic)
 * + مکمل DS اگر وجود داشته باشد.
 *
 * چرا ترکیب و نه یک قالب کامل به‌ازای هر DS: وگرنه پروتکل‌های مشترک (Scope Triage،
 * Figma→Code، DoD، جهت) در هر قالب DS کپی می‌شدند و با اولین به‌روزرسانی drift
 * می‌کردند — همان کلاس مشکلی که این ساختار برای حذفش ساخته شد.
 */
function scaffoldClaudeMd(targetDir: string, vars: Vars, dk: string | null, report: ScaffoldReport): void {
  const path = resolve(targetDir, 'CLAUDE.md')
  if (existsSync(path)) {
    report.skipped.push('CLAUDE.md')
    return
  }
  if (!dk) {
    report.warned.push('CLAUDE.md — knowledge/ پیدا نشد، قالبی برای ساخت نبود')
    return
  }

  const basePath = resolve(dk, 'design-systems/_TEMPLATE/CLAUDE-template.md')
  if (!existsSync(basePath)) {
    report.warned.push(`CLAUDE.md — قالب پایه پیدا نشد (${basePath})`)
    return
  }

  const parts = [readFileSync(basePath, 'utf8')]
  const sources = ['_TEMPLATE']

  const dsPath = resolve(dk, 'design-systems', vars.DS_FOLDER, 'CLAUDE-template.md')
  if (existsSync(dsPath)) {
    parts.push(readFileSync(dsPath, 'utf8'))
    sources.push(vars.DS_FOLDER)
  }

  writeFileSync(path, substitute(parts.join('\n'), vars))
  report.created.push(`CLAUDE.md  (${sources.join(' + ')})`)
}

/**
 * DESIGN.md را **ترکیبی** می‌سازد — دقیقاً همان الگوی CLAUDE.md:
 * قالب پایهٔ `_TEMPLATE` (ساختار DS-agnostic) + مکمل DS (واژگان prop/level).
 *
 * چرا فایل جدا و نه بخشی از CLAUDE.md: CLAUDE.md هر پیام لود می‌شود (لایهٔ RULE)؛
 * تصمیم‌های بصری فقط در taskهای UI لازم‌اند (لایهٔ REFERENCE). ادغام یعنی هزینهٔ
 * context در هر task backend هم پرداخت شود.
 *
 * ⚠️ مکمل DS نباید frontmatter داشته باشد — فقط قالب پایه YAML دارد.
 */
function scaffoldDesignMd(targetDir: string, vars: Vars, dk: string | null, report: ScaffoldReport): void {
  const path = resolve(targetDir, 'DESIGN.md')
  if (existsSync(path)) {
    report.skipped.push('DESIGN.md')
    return
  }
  if (!dk) {
    report.warned.push('DESIGN.md — knowledge/ پیدا نشد، قالبی برای ساخت نبود')
    return
  }

  const basePath = resolve(dk, 'design-systems/_TEMPLATE/DESIGN-template.md')
  if (!existsSync(basePath)) {
    report.warned.push(`DESIGN.md — قالب پایه پیدا نشد (${basePath})`)
    return
  }

  const parts = [readFileSync(basePath, 'utf8')]
  const sources = ['_TEMPLATE']

  const dsPath = resolve(dk, 'design-systems', vars.DS_FOLDER, 'DESIGN-template.md')
  if (existsSync(dsPath)) {
    parts.push(readFileSync(dsPath, 'utf8'))
    sources.push(vars.DS_FOLDER)
  }

  writeFileSync(path, substitute(parts.join('\n'), vars))
  report.created.push(`DESIGN.md  (${sources.join(' + ')})`)
}

/** هوک rtl_gate را از نسخهٔ canonical در knowledge/ کپی می‌کند. */
function scaffoldHook(targetDir: string, dk: string | null, report: ScaffoldReport): boolean {
  const dest = resolve(targetDir, '.claude/hooks/rtl_gate.py')
  if (existsSync(dest)) {
    report.skipped.push('.claude/hooks/rtl_gate.py')
    return true
  }
  if (!dk) {
    report.warned.push('.claude/hooks/rtl_gate.py — knowledge/ پیدا نشد')
    return false
  }
  const src = resolve(dk, 'universal/hooks/rtl_gate.py')
  if (!existsSync(src)) {
    report.warned.push(`.claude/hooks/rtl_gate.py — منبع نبود (${src})`)
    return false
  }
  mkdirSync(dirname(dest), { recursive: true })
  copyFileSync(src, dest)
  chmodSync(dest, 0o755)
  report.created.push('.claude/hooks/rtl_gate.py')
  return true
}

const HOOK_CMD = 'python3 "${CLAUDE_PROJECT_DIR}/.claude/hooks/rtl_gate.py"'

/**
 * هوک `Stop` را به settings.json اضافه می‌کند. اگر فایل از قبل هست **بازنویسی
 * نمی‌شود** — فقط اگر همین هوک داخلش نبود اضافه می‌شود (merge، نه replace)،
 * چون settings.json پروژه‌های زنده معمولاً هوک‌های دیگری هم دارد.
 */
function scaffoldSettings(targetDir: string, report: ScaffoldReport): void {
  const path = resolve(targetDir, '.claude/settings.json')
  const entry = { hooks: [{ type: 'command', command: HOOK_CMD }] }

  if (!existsSync(path)) {
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, JSON.stringify({ hooks: { Stop: [entry] } }, null, 2) + '\n')
    report.created.push('.claude/settings.json  (هوک Stop → rtl_gate)')
    return
  }

  let settings: Record<string, unknown>
  try {
    settings = JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    report.warned.push('.claude/settings.json — JSON نامعتبر، دست‌نخورده ماند')
    return
  }

  const hooks = (settings.hooks ?? {}) as Record<string, unknown[]>
  const stop = Array.isArray(hooks.Stop) ? hooks.Stop : []

  const already = JSON.stringify(stop).includes('rtl_gate.py')
  if (already) {
    report.skipped.push('.claude/settings.json (هوک rtl_gate از قبل هست)')
    return
  }

  hooks.Stop = [...stop, entry]
  settings.hooks = hooks
  writeFileSync(path, JSON.stringify(settings, null, 2) + '\n')
  report.created.push('.claude/settings.json  (هوک rtl_gate اضافه شد؛ بقیه دست‌نخورده)')
}

function contextStubs(vars: Vars): Array<{ rel: string; body: string }> {
  return [
    {
      rel: '.claude/context/known-bugs.md',
      body: `# ${vars.PROJECT_NAME} — Project-Specific Bugs

باگ‌هایی که در این پروژه کشف شدند و **مخصوص همین پروژه**اند.
برای باگ‌های سطح design system → \`design-systems/${vars.DS_FOLDER}/known-bugs.md\`
در knowledge/.

---

## 🔴 باگ‌های تأییدشده

<!-- فرمت:
### عنوان کوتاه
**Symptom:** چه اتفاقی می‌افتد
**Fix:** راه‌حل
**Context:** چه موقع رخ می‌دهد
-->

*هنوز موردی ثبت نشده.*

## 🟡 نکات احتیاطی

*هنوز موردی ثبت نشده.*
`,
    },
  ]
}

function runScaffold(targetDir: string, vars: Vars, dk: string | null): ScaffoldReport {
  const report: ScaffoldReport = { created: [], skipped: [], warned: [] }

  scaffoldClaudeMd(targetDir, vars, dk, report)
  scaffoldDesignMd(targetDir, vars, dk, report)

  // settings فقط وقتی معنی دارد که خودِ هوک هم سر جایش باشد — وگرنه هر turn
  // یک «فایل پیدا نشد» می‌دهد و کاربر یاد می‌گیرد نادیده‌اش بگیرد.
  if (scaffoldHook(targetDir, dk, report)) {
    scaffoldSettings(targetDir, report)
  } else {
    report.warned.push('.claude/settings.json — چون هوک ساخته نشد، wire هم نشد')
  }

  for (const { rel, body } of contextStubs(vars)) {
    writeNew(resolve(targetDir, rel), body, report, rel)
  }

  return report
}

/**
 * مسیر متعارف فایل توکن به‌ازای هر DS. اگر DS ناشناخته بود، TODO می‌دهد تا
 * قالب یک مسیرِ غلطِ باورپذیر تحویل ندهد (بدتر از خالی‌بودن است).
 */
function tokensPath(ds: string): string {
  switch (dsFolder(ds)) {
    case 'chakra-ui-v3':
      return 'src/theme/tokens.ts'
    case 'bootstrap5':
      return 'src/styles/_tokens.scss'
    case 'shadcn-ui':
      return 'src/index.css' // Next.js: app/globals.css — دستی چک/عوض کن
    default:
      return 'TODO — مسیر فایل توکن'
  }
}

function buildVars(
  targetDir: string,
  cfg: { direction?: string; locale?: string; calendar?: string; ds?: string },
  opts: InitOptions,
  dk: string | null,
): Vars {
  const direction = cfg.direction ?? 'rtl'
  const locale = cfg.locale ?? 'fa-IR'
  const ds = cfg.ds ?? 'generic'
  return {
    PROJECT_NAME: opts.name ?? basename(resolve(targetDir)),
    DS: findDs(ds)?.id ?? ds,
    DS_FOLDER: dsFolder(ds),
    DIRECTION: direction === 'both' ? 'rtl' : direction,
    LANG: locale.split('-')[0] ?? locale,
    LOCALE: locale,
    CALENDAR: cfg.calendar ?? 'gregorian',
    START_SIDE: direction === 'ltr' ? 'چپ' : 'راست',
    END_SIDE: direction === 'ltr' ? 'راست' : 'چپ',
    DK_PATH: dk ?? '<knowledge>',
    TYPECHECK_CMD: opts.typecheck ?? 'npx tsc --noEmit',
    TOKENS_PATH: tokensPath(ds),
    DATE: new Date().toISOString().slice(0, 10),
  }
}

function printReport(report: ScaffoldReport): void {
  console.log('\n📦  Scaffold\n')
  for (const c of report.created) console.log(`  ✅  ${c}`)
  for (const s of report.skipped) console.log(`  ⏭   ${s} — از قبل هست، دست نخورد`)
  for (const w of report.warned) console.log(`  ⚠️   ${w}`)
  if (!report.created.length) console.log('  (چیزی ساخته نشد — همه از قبل موجود بودند)')
  console.log()
}

/**
 * پروژه‌ای که `.dev-engine.json` دارد ولی harness ندارد (مثل پروژه‌های قبل از این
 * قابلیت) — config را دست نمی‌زنیم، فقط فایل‌های غایب را می‌سازیم.
 */
async function scaffoldFromExistingConfig(
  targetDir: string,
  configPath: string,
  opts: InitOptions,
): Promise<void> {
  let cfg: Record<string, string> = {}
  try {
    cfg = JSON.parse(readFileSync(configPath, 'utf8'))
  } catch {
    console.log('  ⚠️  .dev-engine.json نامعتبر — scaffold با پیش‌فرض‌ها ادامه می‌یابد.')
  }
  const dk = findDevKnowledge()
  printReport(runScaffold(targetDir, buildVars(targetDir, cfg, opts, dk), dk))
}

// ── init ────────────────────────────────────────────────────────────────────

export interface InitOptions {
  yes?: boolean
  auto?: boolean       // پیش‌فرض‌ها را از کدبیس تشخیص بده، نه از ثابت‌ها
  direction?: string
  locale?: string
  calendar?: string
  ds?: string
  icons?: string
  name?: string
  typecheck?: string
  scaffold?: boolean   // commander: `--no-scaffold` → false
  force?: boolean
}

export async function runInit(targetDir: string, opts: InitOptions = {}): Promise<void> {
  // حالت غیرتعاملی: لازم است تا init از اسکریپت/CI/agent اجرا شود. بدون این،
  // readline روی stdin پایپ‌شده خطوط اضافه را drop می‌کند و wizard نیمه‌کاره می‌ماند.
  const nonInteractive = opts.yes === true
  const rl = nonInteractive ? null : createInterface({ input: process.stdin, output: process.stdout })

  const ask = (question: string, defaultVal: string, flag?: string): Promise<string> => {
    if (flag !== undefined) return Promise.resolve(flag)
    if (!rl) return Promise.resolve(defaultVal)
    return new Promise(res =>
      rl.question(`  ${question} [${defaultVal}]: `, answer => {
        res(answer.trim() || defaultVal)
      })
    )
  }

  const configPath = resolve(targetDir, '.dev-engine.json')

  if (existsSync(configPath) && !opts.force) {
    const overwrite = await ask('.dev-engine.json already exists. Overwrite? (y/N)', 'N')
    if (overwrite.toLowerCase() !== 'y') {
      rl?.close()
      console.log('  .dev-engine.json موجود است، دست نخورد (برای بازنویسی: --force).')
      // config دست‌نخورده می‌ماند ولی scaffold باید ادامه یابد — پروژه‌ای که فقط
      // config دارد هم باید بتواند harness غایب را بگیرد.
      if (opts.scaffold !== false) await scaffoldFromExistingConfig(targetDir, configPath, opts)
      return
    }
  }

  console.log('\n🛠  dev-engine init\n')

  // --auto: پیش‌فرض هر سوال از روی کدبیس حساب می‌شود، نه از یک ثابت. flag صریح
  // کاربر همچنان برنده است (ask() اول به flag نگاه می‌کند).
  const detected = opts.auto ? detectProjectDefaults(targetDir) : null
  if (detected) {
    console.log('  تشخیص خودکار:')
    for (const line of detected.evidence) console.log(`    · ${line}`)
    console.log('')
  }

  const dsList = dsOptions()

  const directionRaw = await ask('Direction (rtl/ltr/both)', detected?.direction ?? 'rtl', opts.direction)
  const direction = validate(directionRaw, DIR_OPTIONS, 'rtl')

  const defaultLocale = detected?.locale ?? (direction === 'ltr' ? 'en-US' : 'fa-IR')
  const locale = await ask('Locale', defaultLocale, opts.locale)

  const defaultCal = detected?.calendar ?? (direction === 'ltr' ? 'gregorian' : 'jalali')
  const calendarRaw = await ask('Calendar (jalali/hijri/gregorian)', defaultCal, opts.calendar)
  const calendar = validate(calendarRaw, CAL_OPTIONS, defaultCal)

  const dsRaw = await ask(`Design system (${dsList.join('/')})`, detected?.ds ?? 'generic', opts.ds)
  const ds = validate(dsRaw, dsList, 'generic')

  const iconRaw = await ask(`Icon library (${ICON_OPTIONS.join('/')})`, detected?.icon_lib ?? 'lucide', opts.icons)
  const icon_lib = validate(iconRaw, ICON_OPTIONS, 'lucide')

  const projectName = await ask('Project name', basename(resolve(targetDir)), opts.name)
  const typecheckCmd = await ask('Type-check command', 'npx tsc --noEmit', opts.typecheck)
  const scaffold = opts.scaffold === false
    ? 'n'
    : await ask('Scaffold CLAUDE.md + .claude/ harness? (Y/n)', 'Y')

  rl?.close()

  const config = {
    direction,
    locale,
    calendar,
    ds,
    icon_lib,
    ignore: ['node_modules', 'dist', '.next', 'build', 'coverage'],
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')
  console.log(`\n✅  Created ${configPath}\n`)
  console.log(JSON.stringify(config, null, 2))

  if (scaffold.toLowerCase() === 'n') {
    console.log('\n  Scaffold رد شد.\n')
    return
  }

  const dk = findDevKnowledge()
  const vars = buildVars(
    targetDir,
    { direction, locale, calendar, ds },
    { ...opts, name: projectName, typecheck: typecheckCmd },
    dk,
  )

  printReport(runScaffold(targetDir, vars, dk))
}
