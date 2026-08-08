import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import chalk from 'chalk'
import type { ContainerLayout, LayoutSnapshot, ProjectConfig, RenderedSnapshot } from './types.js'
import { loadLayoutSnapshots } from './layout-cache.js'
import {
  isRtl, normalizeTextAlign, normalizeJustify, normalizeAlign,
  semanticToPhysical, physicalFa,
} from './direction.js'

// ── verify-render ──────────────────────────────────────────────────────────────
// حلقه‌ای که تا حالا وجود نداشت. layout-diff متنِ کد رو می‌خونه، پس چیزهایی که فقط
// موقع رندر معلوم می‌شن رو نمی‌بینه: اینکه `justify="flex-start"` زیر dir=rtl واقعاً
// کجا نشست، اینکه یه align والد بچه رو کجا برد، اینکه توکن رنگ به چه مقداری resolve شد.
//
// اینجا عدد اندازه‌گیری‌شده مقایسه می‌شه، نه رشته‌ی کد:
//   دامپ مرورگر (getBoundingClientRect + getComputedStyle)  ⟷  figma-layout.json
//
// دامپ رو با `dev-engine verify-render --snippet` بگیر و در preview اجرا کن.

const DEFAULT_INPUT = '.claude/context/render-snapshot.json'

interface Finding {
  component: string
  rule: string
  message: string
}

export function printRenderSnippet(): void {
  console.log(`
${chalk.bold('// در کنسول preview اجرا کن.')}
${chalk.gray('// خودکار پیدا می‌شن: [data-layout="Component.container"] و [data-dev-id="Component"].')}
${chalk.gray('// MAP فقط برای کامپوننتی لازمه که هیچ‌کدوم رو نداره.')}

(() => {
  const MAP = { /* "AdChannelCard": ".ad-channel-card", */ };

  const tokens = {};
  try {
    const rootStyle = getComputedStyle(document.documentElement);
    for (const prop of Array.from(rootStyle)) {
      if (prop.startsWith('--chakra-colors-')) {
        tokens[prop.slice(16).replace(/-/g, '.')] = rootStyle.getPropertyValue(prop).trim();
      }
    }
  } catch (e) { /* ignore */ }

  const targets = {};
  document.querySelectorAll('[data-dev-id]').forEach(el => {
    targets[el.getAttribute('data-dev-id')] = el;
  });
  // همون anchor ای که layout-diff در source می‌خونه — کلید "Component.container".
  // فقط اولین instance هر کلید: در جدول‌ها یک container در هر ردیف تکرار می‌شه و
  // همه‌شون یک ساختار دارن، پس اولی نمایندهٔ کافیه.
  document.querySelectorAll('[data-layout]').forEach(el => {
    const k = el.getAttribute('data-layout');
    if (k && !(k in targets)) targets[k] = el;
  });
  for (const [name, sel] of Object.entries(MAP)) {
    const el = document.querySelector(sel);
    if (el) targets[name] = el;
  }

  const out = {
    _meta: {
      dir: document.documentElement.getAttribute('dir') || 'ltr',
      viewport: window.innerWidth,
      capturedAt: new Date().toISOString(),
    },
    _tokens: tokens,
  };

  for (const [name, el] of Object.entries(targets)) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const icon = el.querySelector('svg');
    out[name] = {
      x: Math.round(r.left),
      width: Math.round(r.width),
      textAlign: cs.textAlign,
      justifyContent: cs.justifyContent,
      alignItems: cs.alignItems,
      flexDirection: cs.flexDirection,
      iconColor: icon ? getComputedStyle(icon).color : undefined,
      children: Array.from(el.children).map(c => {
        const cr = c.getBoundingClientRect();
        return { tag: c.tagName, x: Math.round(cr.left), width: Math.round(cr.width) };
      }),
    };
  }

  return JSON.stringify(out, null, 2);
})()
`)
  console.log(chalk.gray(`خروجی رو در ${DEFAULT_INPUT} ذخیره کن، بعد: dev-engine verify-render .\n`))
}

function normalizeCssColor(v: string): string {
  return v.replace(/\s+/g, '').toLowerCase()
}

// آیا ترتیب افقیِ رندرشده آینه‌ی چیزیه که باید باشه؟
// در RTL، اولین فرزند DOM باید راست‌ترین باشه → x باید نزولی باشه.
function checkVisualOrder(
  name: string, rendered: RenderedSnapshot, snap: LayoutSnapshot, rtl: boolean
): Finding[] {
  const kids = rendered.children ?? []
  if (kids.length < 2) return []
  if (snap.layoutMode === 'VERTICAL') return []
  // فقط ردیف واقعاً افقی — اگه همه روی یه x باشن ستونیه
  const xs = kids.map(k => k.x)
  if (new Set(xs).size < 2) return []

  let ascending = true
  let descending = true
  for (let i = 1; i < xs.length; i++) {
    if (xs[i] <= xs[i - 1]) ascending = false
    if (xs[i] >= xs[i - 1]) descending = false
  }
  if (!ascending && !descending) return []   // چیدمان wrap/grid — قضاوت نکن

  const wantDescending = rtl
  const got = descending ? 'نزولی (راست→چپ)' : 'صعودی (چپ→راست)'
  if (descending === wantDescending) return []

  return [{
    component: name,
    rule: 'visual-order-mirrored',
    message:
      `ردیف آینه‌ای رندر شده — در ${rtl ? 'RTL' : 'LTR'} باید اولین فرزند DOM ` +
      `${rtl ? 'راست‌ترین' : 'چپ‌ترین'} باشه، ولی مختصات x ${got} است ` +
      `[${xs.join(', ')}]`,
  }]
}

function checkRenderedTextAlign(
  name: string, rendered: RenderedSnapshot, snap: LayoutSnapshot, rtl: boolean
): Finding[] {
  if (!snap.textAlign || !rendered.textAlign) return []
  const actual = normalizeTextAlign(rendered.textAlign, rtl)
  if (!actual || actual === snap.textAlign) return []
  return [{
    component: name,
    rule: 'rendered-text-align',
    message:
      `متن واقعاً ${physicalFa(semanticToPhysical(actual, rtl))} رندر شده ` +
      `(computed: ${rendered.textAlign})، ولی طرح ${snap.textAlign} ` +
      `(${physicalFa(semanticToPhysical(snap.textAlign, rtl))}) می‌خواد`,
  }]
}

function checkRenderedIconColor(
  name: string, rendered: RenderedSnapshot, snap: LayoutSnapshot, tokens: Record<string, string>
): Finding[] {
  if (!snap.iconColor || !rendered.iconColor) return []
  const expected = tokens[snap.iconColor]
  if (!expected) return []   // توکن در دامپ نبود — قضاوت نکن
  if (normalizeCssColor(expected) === normalizeCssColor(rendered.iconColor)) return []
  return [{
    component: name,
    rule: 'rendered-icon-color',
    message:
      `رنگ آیکون رندرشده ${rendered.iconColor} است، ولی توکن طرح ` +
      `«${snap.iconColor}» به ${expected} resolve می‌شه`,
  }]
}

// ── containerهای anchor شده با data-layout ────────────────────────────────────
// چرا این لازم بود: تا قبل از این، verify-render فقط کلیدهای سطحِ **کامپوننت** را
// می‌شناخت، پس دقیقاً همان granularity gap ای که در layout-diff بسته شد این‌جا باز
// بود. یک کارت با سه ردیفِ داخلیِ آینه‌ای را map می‌کردی → فرزندهای مستقیمش
// ستونی بودند → skip → «۰ مغایرت». باگ 1404/05/17 (DiscountCodeCard) از همین
// شکاف رد می‌شد. حالا هر دو لایه یک anchor می‌خوانند: data-layout="Comp.name".
function checkContainerRender(
  key: string, comp: string, cname: string,
  rendered: RenderedSnapshot, want: ContainerLayout, rtl: boolean
): Finding[] {
  const out: Finding[] = []
  const label = `${comp} › ${cname}`

  // ترتیب افقی رندرشده — تنها چیزی که «آینه‌ای شد» را قطعی می‌گیرد، چون عدد است.
  const kids = rendered.children ?? []
  const isRow = !rendered.flexDirection || rendered.flexDirection.startsWith('row')
  if (want.childOrder && want.childOrder.length >= 2 && kids.length >= 2 && isRow) {
    const xs = kids.map(k => k.x)
    if (new Set(xs).size >= 2) {
      let ascending = true
      let descending = true
      for (let i = 1; i < xs.length; i++) {
        if (xs[i] <= xs[i - 1]) ascending = false
        if (xs[i] >= xs[i - 1]) descending = false
      }
      // wrap/grid → قضاوت نکن
      if (ascending || descending) {
        // ⚠️ row-reverse محورِ فیزیکی را برمی‌گرداند، پس انتظار هم برمی‌گردد
        const reversed = rendered.flexDirection === 'row-reverse'
        const wantDescending = rtl !== reversed
        if (descending !== wantDescending) {
          out.push({
            component: label,
            rule: 'visual-order-mirrored',
            message:
              `ردیف آینه‌ای رندر شده — در ${rtl ? 'RTL' : 'LTR'} اولین فرزند DOM باید ` +
              `${rtl ? 'راست‌ترین' : 'چپ‌ترین'} باشه، ولی x ها ${descending ? 'نزولی' : 'صعودی'} اند ` +
              `[${xs.join(', ')}] · طرح: [${want.childOrder.join(', ')}]`,
          })
        }
      }
    }
  }

  const axes: Array<['justify' | 'align', string | undefined]> = [
    ['justify', rendered.justifyContent],
    ['align', rendered.alignItems],
  ]
  for (const [key2, raw] of axes) {
    const expected = want[key2]
    if (!expected || !raw) continue
    const actual = key2 === 'justify' ? normalizeJustify(raw, rtl) : normalizeAlign(raw, rtl)
    if (!actual || actual === expected) continue
    out.push({
      component: label,
      rule: `rendered-${key2}`,
      message:
        `${key2} واقعاً ${actual}${actual === 'start' || actual === 'end' ? ` (${physicalFa(semanticToPhysical(actual, rtl))})` : ''} ` +
        `رندر شده (computed: ${raw})، ولی طرح ${expected}` +
        `${expected === 'start' || expected === 'end' ? ` (${physicalFa(semanticToPhysical(expected, rtl))})` : ''} می‌خواد`,
    })
  }

  if (want.textAlign && rendered.textAlign) {
    const actual = normalizeTextAlign(rendered.textAlign, rtl)
    if (actual && actual !== want.textAlign) {
      out.push({
        component: label,
        rule: 'rendered-text-align',
        message:
          `متن واقعاً ${physicalFa(semanticToPhysical(actual, rtl))} رندر شده ` +
          `(computed: ${rendered.textAlign})، ولی طرح ${want.textAlign} ` +
          `(${physicalFa(semanticToPhysical(want.textAlign, rtl))}) می‌خواد`,
      })
    }
  }

  void key
  return out
}

export function runVerifyRender(
  projectRoot: string,
  config: ProjectConfig,
  opts: { input?: string; json?: boolean }
): boolean {
  const inputPath = resolve(projectRoot, opts.input ?? DEFAULT_INPUT)

  if (!existsSync(inputPath)) {
    console.log(chalk.yellow(`\n⚠️  دامپ رندر پیدا نشد: ${inputPath}`))
    console.log(chalk.gray('   اسنیپت رو بگیر و در preview اجرا کن:  dev-engine verify-render --snippet\n'))
    return false
  }

  let dump: Record<string, unknown>
  try {
    dump = JSON.parse(readFileSync(inputPath, 'utf-8')) as Record<string, unknown>
  } catch (e) {
    console.log(chalk.red(`✗ دامپ نامعتبر: ${(e as Error).message}`))
    return false
  }

  const snapshots = loadLayoutSnapshots(projectRoot)
  const tokens = (dump._tokens as Record<string, string>) ?? {}
  const meta = (dump._meta as { dir?: string; viewport?: number }) ?? {}
  // جهتِ واقعیِ صفحه‌ی رندرشده بر config ارجحه — چون همون چیزیه که مرورگر اعمال کرده
  const rtl = meta.dir ? meta.dir === 'rtl' : isRtl(config.direction)

  const findings: Finding[] = []
  let compared = 0

  const unmatched: string[] = []

  for (const [name, value] of Object.entries(dump)) {
    if (name.startsWith('_')) continue
    const rendered = value as RenderedSnapshot

    // کلیدِ container: "Component.containerName" — همان anchor data-layout.
    if (name.includes('.')) {
      const dot = name.indexOf('.')
      const comp = name.slice(0, dot)
      const cname = name.slice(dot + 1)
      const want = snapshots[comp]?.containers?.[cname]
      if (!want) { unmatched.push(name); continue }
      compared++
      findings.push(...checkContainerRender(name, comp, cname, rendered, want, rtl))
      continue
    }

    const snap = snapshots[name]
    if (!snap) { unmatched.push(name); continue }
    compared++
    findings.push(...checkVisualOrder(name, rendered, snap, rtl))
    findings.push(...checkRenderedTextAlign(name, rendered, snap, rtl))
    findings.push(...checkRenderedIconColor(name, rendered, snap, tokens))
  }

  if (opts.json) {
    console.log(JSON.stringify({ compared, findings }, null, 2))
    return findings.length === 0
  }

  console.log(chalk.bold(`\n📐 verify-render — ${projectRoot}`))
  console.log(chalk.gray(`   dir: ${rtl ? 'rtl' : 'ltr'} | viewport: ${meta.viewport ?? '?'}px | مقایسه‌شده: ${compared} کامپوننت\n`))

  if (compared === 0) {
    console.log(chalk.yellow('⚠️  هیچ کامپوننتی هم در دامپ و هم در figma-layout.json نبود — چیزی مقایسه نشد.'))
    console.log(chalk.gray('   یعنی این اجرا هیچ تضمینی نمی‌ده. اسم‌های دامپ باید با کلیدهای snapshot یکی باشن.\n'))
    return false
  }

  // در دامپ بود ولی snapshot نداشت — یعنی آن هدف بی‌چک ماند. سکوت ممنوع.
  if (unmatched.length > 0) {
    console.log(chalk.yellow(`⚠️  ${unmatched.length} هدف در دامپ بود ولی snapshot نداشت (بی‌چک ماند):`))
    console.log(chalk.gray(`   ${unmatched.join(', ')}\n`))
  }

  if (findings.length === 0) {
    console.log(chalk.green(`✅ رندر با طرح می‌خونه — ${compared} هدف، ۰ مغایرت\n`))
    return true
  }

  for (const f of findings) {
    console.log(chalk.yellow(`⚠️  ${f.component}`))
    console.log(`   ${chalk.red('[' + f.rule + ']')} ${f.message}\n`)
  }
  console.log('─'.repeat(60))
  console.log(chalk.red(`${findings.length} مغایرت بین رندر و طرح\n`))
  return false
}
