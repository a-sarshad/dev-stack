#!/usr/bin/env node
// اعتبارسنجی ارجاع‌های داخل مستندات و skillها.
//
// چرا: SKILL.mdها متن آزادند — هیچ compiler ارجاع مرده را نمی‌گیرد. بعد از ادغام
// مونوریپو ۱۱ ارجاع شکسته پیدا شد که همه با چشم پیدا شدند. این اسکریپت همان
// کلاس باگ را قبل از build می‌بندد.
//
// اجرا: node scripts/check-refs.mjs   (خروج ۱ اگر خطایی بود)
// استثنا: scripts/refs-allow.json

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs'
import { resolve, dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const allow = JSON.parse(readFileSync(join(ROOT, 'scripts/refs-allow.json'), 'utf8'))

const errors = []
const err = (file, line, kind, msg) => errors.push({ file, line, kind, msg })

// ── جمع‌آوری فایل‌های md ───────────────────────────────────────────────────────
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'templates'])
function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (e.name.endsWith('.md')) out.push(p)
  }
  return out
}
const docs = [
  // هر md در ریشه — نه سه نام ثابت، وگرنه سند جدید بی‌صدا از چک جا می‌ماند
  ...readdirSync(ROOT).filter(f => f.endsWith('.md')).map(f => join(ROOT, f)),
  ...walk(join(ROOT, 'skills')),
  ...walk(join(ROOT, 'knowledge')),
]

// ── منابع حقیقت ───────────────────────────────────────────────────────────────
const localSkills = readdirSync(join(ROOT, 'skills/src'), { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name)

const knownSkills = new Set([...localSkills, ...allow.externalSkills, ...allow.retiredSkills])

const cli = readFileSync(join(ROOT, 'packages/dev-engine/src/cli.ts'), 'utf8')
const commands = new Set([...cli.matchAll(/\.command\('([a-z][a-z0-9-]*)/g)].map(m => m[1]))
const options = new Set([
  ...[...cli.matchAll(/\.option\('(?:-\w,\s*)?(--[a-z][a-z0-9-]*)/g)].map(m => m[1]),
  ...allow.extraFlags,
])

const moduleIds = new Set(
  readdirSync(join(ROOT, 'packages/dev-engine/src/modules'))
    .filter(f => f.endsWith('.ts'))
    .flatMap(f => {
      const src = readFileSync(join(ROOT, 'packages/dev-engine/src/modules', f), 'utf8')
      return [...src.matchAll(/id:\s*'([a-z0-9-]+)'/g)].map(m => m[1])
    })
)

// ── کمکی‌ها ───────────────────────────────────────────────────────────────────
const allowSet = new Set(allow.allow.map(a => `${a.in}::${a.ref}`))
const usedAllows = new Set()
const isAllowed = (file, ref) => {
  const key = `${file}::${ref}`
  if (!allowSet.has(key)) return false
  usedAllows.add(key)
  return true
}

// placeholder / glob / قالب → قابل بررسی نیست
const isTemplate = s => /[<>*{}\[\]$]|\.\.\./.test(s) || s.includes('REPLACE-ME')

const TRAIM = /[)\]`,.،؛:»؟!"'*_-]+$/
const trim = s => s.replace(TRAIM, '')

// ── بررسی‌ها ──────────────────────────────────────────────────────────────────
for (const abs of docs) {
  const file = relative(ROOT, abs)
  const lines = readFileSync(abs, 'utf8').split('\n')
  let inFence = false
  let fenceLang = ''

  lines.forEach((raw, i) => {
    const ln = i + 1
    const fence = raw.match(/^\s*```(\w*)/)
    if (fence) {
      inFence = !inFence
      fenceLang = inFence ? fence[1] : ''
      return
    }

    // ── ۱. مسیرهای repo-relative ──────────────────────────────────────────────
    const pathRe =
      /(?:(?:\$HOME|~)\/Documents\/GitHub\/dev-stack\/|dev-stack\/|(?<![\w/.-]))((?:knowledge|packages|skills|scripts|tools)\/[A-Za-z0-9_@./-]*)/g
    for (const m of raw.matchAll(pathRe)) {
      const ref = trim(m[1])
      if (!ref || isTemplate(ref) || isAllowed(file, ref)) continue
      const target = join(ROOT, ref)
      const wantDir = ref.endsWith('/')
      if (!existsSync(target)) {
        err(file, ln, 'path', `«${ref}» وجود ندارد`)
      } else if (wantDir && !statSync(target).isDirectory()) {
        err(file, ln, 'path', `«${ref}» با / نوشته شده ولی فایل است`)
      }
    }

    // ── ۲. لینک‌های markdown نسبی ─────────────────────────────────────────────
    for (const m of raw.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
      const t = m[1]
      if (/^(https?:|mailto:|#)/.test(t) || isTemplate(t) || isAllowed(file, t)) continue
      const target = resolve(dirname(abs), t.split('#')[0])
      if (!existsSync(target)) err(file, ln, 'link', `لینک «${t}» به جایی نمی‌رسد`)
    }

    // ── ۳. نام skillها ────────────────────────────────────────────────────────
    for (const m of raw.matchAll(/`((?:wf|dev|ds|figma)-[a-z0-9-]+|[a-z0-9-]+-project-context)`/g)) {
      const name = m[1]
      if (allow.notSkills.includes(name) || isAllowed(file, name)) continue
      if (!knownSkills.has(name)) {
        err(file, ln, 'skill', `skill «${name}» نه در skills/src هست نه در externalSkills`)
      }
    }

    // ── ۴+۵. سطح فرمان dev-engine — فقط داخل بلوک bash ────────────────────────
    // کامنت shell کد نیست — «# dev-engine shortcuts» نباید زیرفرمان حساب شود
    const isShellComment = /^\s*#/.test(raw)
    const invokes = /(?:\$DE|dev-engine)\s+(.*)$/.exec(raw)
    if (inFence && fenceLang === 'bash' && invokes && !isShellComment) {
      const rest = invokes[1]
      const first = rest.match(/^([a-z][a-z0-9-]*)/)
      if (first && !commands.has(first[1]) && !isAllowed(file, first[1])) {
        err(file, ln, 'cli', `زیرفرمان «${first[1]}» در cli.ts نیست`)
      }
      for (const f of rest.matchAll(/(--[a-z][a-z0-9-]*)/g)) {
        if (!options.has(f[1]) && !isAllowed(file, f[1])) {
          err(file, ln, 'cli', `فلگ «${f[1]}» در cli.ts نیست`)
        }
      }
      for (const mod of rest.matchAll(/--module\s+([a-z0-9-]+)/g)) {
        if (!moduleIds.has(mod[1])) {
          err(file, ln, 'cli', `ماژول «${mod[1]}» در src/modules نیست`)
        }
      }
    }

    // ── ۶. نام repoهای قبل از ادغام ───────────────────────────────────────────
    for (const m of raw.matchAll(/\b(dev-knowledge|dev-agents)\b/g)) {
      if (isAllowed(file, m[1])) continue
      err(file, ln, 'legacy', `«${m[1]}» — repo قبل از ادغام؛ حالا dev-stack است`)
    }
  })
}

// ── ۷. قرارداد اسکلت DS ───────────────────────────────────────────────────────
// design-systems/README.md §۱: هر پوشه‌ی DS واقعی باید `ds.json` معتبر (id ≠
// REPLACE-ME) داشته باشد + `figma-resolve.json` مگر `package: null`. قبلاً هیچ
// enforcement‌ای نبود و ۲ از ۴ DS نقض می‌کردند.
const dsRoot = join(ROOT, 'knowledge/design-systems')
for (const e of readdirSync(dsRoot, { withFileTypes: true })) {
  if (!e.isDirectory() || e.name.startsWith('_')) continue
  const dir = join(dsRoot, e.name)
  const rel = relative(ROOT, dir)
  const dsJsonPath = join(dir, 'ds.json')
  if (!existsSync(dsJsonPath)) {
    err(`${rel}/ds.json`, 1, 'ds-contract', 'وجود ندارد — هر پوشه‌ی DS باید ds.json داشته باشد')
    continue
  }
  let ds
  try {
    ds = JSON.parse(readFileSync(dsJsonPath, 'utf8'))
  } catch (parseErr) {
    err(`${rel}/ds.json`, 1, 'ds-contract', `JSON نامعتبر — ${parseErr.message}`)
    continue
  }
  if (typeof ds.id !== 'string' || ds.id.includes('REPLACE-ME')) {
    err(`${rel}/ds.json`, 1, 'ds-contract', `"id" هنوز «${ds.id}» است — DS ناتمام (کپی از _TEMPLATE پر نشده)`)
  }
  if (ds.package !== null && !existsSync(join(dir, 'figma-resolve.json'))) {
    err(`${rel}/figma-resolve.json`, 1, 'ds-contract', 'وجود ندارد — اجباری مگر ds.json فیلد "package": null داشته باشد (seed خالی هم قبول است)')
  }
}

// ── allowlist کهنه ────────────────────────────────────────────────────────────
// استثنایی که دیگر به کار نمی‌آید یعنی متن اصلاح شده و استثنا فراموش شده —
// همان drift‌ای که این اسکریپت قرار است جلویش را بگیرد، یک لایه بالاتر.
const stale = allow.allow.filter(a => !usedAllows.has(`${a.in}::${a.ref}`))
for (const a of stale) {
  console.warn(`⚠ استثنای بی‌مصرف در refs-allow.json: ${a.in} → «${a.ref}» (${a.why})`)
}

// ── گزارش ─────────────────────────────────────────────────────────────────────
if (errors.length === 0) {
  console.log(`✓ ارجاع‌ها سالم — ${docs.length} سند، ${localSkills.length} skill`)
  process.exit(0)
}

const byFile = new Map()
for (const e of errors) {
  if (!byFile.has(e.file)) byFile.set(e.file, [])
  byFile.get(e.file).push(e)
}
console.error('')
for (const [file, list] of byFile) {
  console.error(`✗ ${file}`)
  for (const e of list) console.error(`    ${file}:${e.line}  [${e.kind}] ${e.msg}`)
}
console.error('')
console.error(`${errors.length} ارجاع شکسته در ${byFile.size} فایل.`)
console.error('اگر عمدی است (مثال، یادداشت تاریخی) → به scripts/refs-allow.json اضافه کن.')
process.exit(1)
