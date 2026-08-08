import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import chalk from 'chalk'
import type { ContainerLayout, ProjectConfig } from './types.js'
import { loadLayoutSnapshots, writeLayoutSnapshot } from './layout-cache.js'
import { isRtl, physicalToSemantic, physicalFa } from './direction.js'

// ── layout-derive ──────────────────────────────────────────────────────────────
// چرا این وجود دارد — INCIDENT ×3 (CampaignCard و NewCampaignDialog 1404/05/12،
// DiscountCodesTable/Card 1404/05/17): هر سه بار مقدار جهتی **دستی** در snapshot
// نوشته شد و هر سه بار برعکس نوشته شد. علت هم پیچیدگی RTL نبود؛ علت این بود که
// canvas فیگما «راست/چپ» فیزیکی می‌گوید و کد `start`/`end` نسبت‌به‌جهت می‌خواهد،
// و آن ترجمه هر بار در سرِ آدم انجام می‌شد.
//
// این ماژول آن ترجمه را حذف می‌کند: مختصات خام فیگما (x + width نسبت به والد) را
// می‌گیرد و سمت را **حساب** می‌کند. جمع دو عدد جای قضاوت جهتی را می‌گیرد.
//
// ورودی: دامپ XML خروجی `get_metadata` (چون CLI به MCP دسترسی ندارد — آن را
// Claude می‌گیرد و در فایل می‌ریزد). نگاشت node↔container از خودِ snapshot
// خوانده می‌شود (فیلد `nodeId` هر container).

interface FigmaNode {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  children: FigmaNode[]
}

const TAG_RE = /<(\w+)\s+([^>]*?)(\/?)>|<\/(\w+)>/g

function attr(raw: string, key: string): string | undefined {
  const m = new RegExp(`\\b${key}="([^"]*)"`).exec(raw)
  return m ? m[1] : undefined
}

function num(raw: string, key: string): number {
  const v = attr(raw, key)
  return v === undefined ? 0 : Number(v)
}

/** دامپ XML `get_metadata` را به درخت تبدیل می‌کند. */
export function parseMetadata(xml: string): FigmaNode[] {
  const roots: FigmaNode[] = []
  const stack: FigmaNode[] = []
  let m: RegExpExecArray | null
  TAG_RE.lastIndex = 0

  while ((m = TAG_RE.exec(xml)) !== null) {
    if (m[4]) {                                    // تگ بسته
      stack.pop()
      continue
    }
    const raw = m[2] ?? ''
    const id = attr(raw, 'id')
    if (!id) continue

    const node: FigmaNode = {
      id,
      name: attr(raw, 'name') ?? '',
      x: num(raw, 'x'),
      y: num(raw, 'y'),
      width: num(raw, 'width'),
      height: num(raw, 'height'),
      children: [],
    }
    if (stack.length > 0) stack[stack.length - 1].children.push(node)
    else roots.push(node)

    if (m[3] !== '/') stack.push(node)             // self-closing نبود
  }
  return roots
}

function findNode(nodes: FigmaNode[], id: string): FigmaNode | null {
  const want = id.replace('-', ':')
  for (const n of nodes) {
    if (n.id.replace('-', ':') === want) return n
    const hit = findNode(n.children, id)
    if (hit) return hit
  }
  return null
}

const EPS = 1.5   // فیگما مختصات کسری می‌دهد (170.6666…) — مقایسه باید tolerant باشد

export interface DerivedLayout {
  layoutMode: 'HORIZONTAL' | 'VERTICAL'
  justify?: ContainerLayout['justify']
  align?: ContainerLayout['align']
  childNames: string[]              // به ترتیب صحیحِ DOM (اولین = سمت start)
  notes: string[]
}

/**
 * سمت را از هندسه حساب می‌کند، نه از اسم.
 *
 * محورِ اصلی: فضای خالی کدام طرف مانده؟ خالیِ چپ ⇒ محتوا راست چیده شده.
 * محورِ عرضی: همهٔ فرزندها به کدام لبهٔ والد چسبیده‌اند؟
 *
 * مقدار فیزیکیِ حاصل (right/left) در همین‌جا با `physicalToSemantic` به
 * start/end ترجمه می‌شود — تنها جایی که این ترجمه انجام می‌شود، و مکانیکی است.
 */
export function deriveLayout(node: FigmaNode, rtl: boolean): DerivedLayout {
  const kids = node.children
  const notes: string[] = []

  // ⚠️ تشخیص جهت باید با **همپوشانی y** باشد، نه با تفاوت x.
  // باگ اول این فایل: `vertical = xs.size <= 1` — ولی یک ستونِ راست‌چین دقیقاً
  // همان حالتی است که فرزندها x متفاوت دارند (هر کدام به عرض خودش، چسبیده به
  // راست). پس هیوریستیکِ x در همان موردی که اهمیت دارد می‌شکست و «قضاوت نشد»
  // می‌داد. اگر بازه‌های y فرزندها روی هم بیفتند ⇒ یک ردیف‌اند؛ اگر پشت سر هم
  // باشند ⇒ یک ستون.
  const spansOverlapInY = kids.some((a, i) =>
    kids.some((b, j) => i !== j && a.y < b.y + b.height - EPS && b.y < a.y + a.height - EPS)
  )
  const vertical = kids.length > 1 && !spansOverlapInY
  const layoutMode: DerivedLayout['layoutMode'] = vertical ? 'VERTICAL' : 'HORIZONTAL'

  const out: DerivedLayout = { layoutMode, childNames: [], notes }
  if (kids.length === 0) {
    notes.push('بی‌فرزند — چیزی برای حساب‌کردن نیست')
    return out
  }

  // ترتیب صحیح DOM: در ستون اولین فرزند = بالاترین (y صعودی — جهت اثری ندارد).
  // در ردیف اولین فرزند = سمت start (در RTL راست‌ترین ⇒ x نزولی).
  const ordered = vertical
    ? [...kids].sort((a, b) => a.y - b.y)
    : [...kids].sort((a, b) => (rtl ? b.x - a.x : a.x - b.x))
  out.childNames = ordered.map(k => k.name)

  const sideFrom = (physical: 'right' | 'left') => physicalToSemantic(physical, rtl)

  // چسبندگی به لبه‌های یک محور — هستهٔ مشترک هر دو حالت.
  // `translate` فقط برای محور inline (افقی) true است: محور block (بالا/پایین)
  // از `dir` تأثیر نمی‌گیرد، پس start آن‌جا همیشه «بالا» است. قاطی‌کردن این دو
  // خودش یک باگ تازه می‌شد.
  const edgeSide = (
    starts: number[], sizes: number[], parentSize: number, translate: boolean
  ): ContainerLayout['align'] | 'mixed' => {
    const per = starts.map((s, i) => {
      const flushLow = s <= EPS
      const flushHigh = Math.abs(parentSize - (s + sizes[i])) <= EPS
      if (flushLow && flushHigh) return 'stretch'
      if (flushHigh) return 'high'
      if (flushLow) return 'low'
      if (Math.abs(s - (parentSize - (s + sizes[i]))) <= EPS) return 'center'
      return 'other'
    })
    // فرزندِ full-size نسبت به لبه بی‌طرف است؛ سمت را بقیه تعیین می‌کنند
    const decisive = [...new Set(per)].filter(v => v !== 'stretch')
    if (decisive.length === 0) return 'stretch'
    if (decisive.length > 1 || decisive[0] === 'other') return 'mixed'
    const v = decisive[0]
    if (v === 'center') return 'center'
    if (!translate) return v === 'low' ? 'start' : 'end'          // block: low=بالا=start
    return sideFrom(v === 'high' ? 'right' : 'left')              // inline: high=راست
  }

  if (vertical) {
    // ستون → محور اصلی عمودی (justify، بی‌ترجمه) · محور عرضی افقی (align، با ترجمه)
    const cross = edgeSide(kids.map(k => k.x), kids.map(k => k.width), node.width, true)
    if (cross === 'mixed') notes.push('فرزندها به لبه‌های افقیِ مختلف چسبیده‌اند — align قضاوت نشد')
    else out.align = cross

    const top = Math.min(...kids.map(k => k.y))
    const bottom = Math.max(...kids.map(k => k.y + k.height))
    if (top > EPS && node.height - bottom > EPS && Math.abs(top - (node.height - bottom)) <= EPS) {
      out.justify = 'center'
    }
  } else {
    // ردیف → محور اصلی افقی (justify، با ترجمه) · محور عرضی عمودی (align، بی‌ترجمه)
    const left = Math.min(...kids.map(k => k.x))
    const right = node.width - Math.max(...kids.map(k => k.x + k.width))
    if (left <= EPS && right <= EPS) {
      notes.push('محتوا کل عرض را پر می‌کند ⇒ justify اثر بصری ندارد — ثبت نشد')
    } else if (right <= EPS) {
      out.justify = sideFrom('right')
    } else if (left <= EPS) {
      out.justify = sideFrom('left')
    } else if (Math.abs(left - right) <= EPS) {
      out.justify = 'center'
    } else {
      notes.push(`فضای خالی نامتقارن (چپ ${left.toFixed(1)} · راست ${right.toFixed(1)}) — justify قضاوت نشد`)
    }

    const cross = edgeSide(kids.map(k => k.y), kids.map(k => k.height), node.height, false)
    if (cross === 'mixed') notes.push('فرزندها به لبه‌های عمودیِ مختلف چسبیده‌اند — align قضاوت نشد')
    else out.align = cross
  }

  return out
}

export function runLayoutDerive(
  projectRoot: string,
  config: ProjectConfig,
  opts: { metadata: string; write: boolean }
): boolean {
  const metaPath = resolve(projectRoot, opts.metadata)
  if (!existsSync(metaPath)) {
    console.log(chalk.red(`✗ دامپ متادیتا پیدا نشد: ${metaPath}`))
    console.log(chalk.gray('   خروجی get_metadata را در یک فایل بریز و مسیرش را بده.\n'))
    return false
  }

  const tree = parseMetadata(readFileSync(metaPath, 'utf-8'))
  const snapshots = loadLayoutSnapshots(projectRoot)
  const rtl = isRtl(config.direction)

  console.log(chalk.bold(`\n📐 layout-derive — ${projectRoot}`))
  console.log(chalk.gray(`   dir: ${rtl ? 'rtl' : 'ltr'} | متادیتا: ${opts.metadata}\n`))

  let derived = 0
  let missing = 0

  for (const [comp, snap] of Object.entries(snapshots)) {
    const containers = snap.containers
    if (!containers) continue

    const updates: Record<string, ContainerLayout> = {}

    for (const [cname, spec] of Object.entries(containers)) {
      if (!spec.nodeId) {
        console.log(chalk.yellow(`  ⚠️  ${comp} › ${cname} — بدون nodeId، حساب نشد`))
        console.log(chalk.gray('       مقادیرش دستی‌نوشته باقی می‌ماند = همان مرحله‌ای که سه بار برعکس شد'))
        missing++
        continue
      }
      const node = findNode(tree, spec.nodeId)
      if (!node) {
        console.log(chalk.yellow(`  ⚠️  ${comp} › ${cname} — node ${spec.nodeId} در این دامپ نیست`))
        missing++
        continue
      }

      const d = deriveLayout(node, rtl)
      derived++

      // ⚠️ برچسبِ سمت باید محور-آگاه باشد: در یک ردیف، `align` محور block است
      // (بالا/پایین) و ترجمهٔ راست/چپ برایش بی‌معنی — و نوشتنش خودش یک بدفهمیِ
      // تازه می‌ساخت، دقیقاً از همان جنسی که این ابزار برای حذفش ساخته شده.
      const label = (v: string | undefined, inline: boolean) => {
        if (v !== 'start' && v !== 'end') return ''
        const fa = inline
          ? physicalFa(v === 'start' ? (rtl ? 'right' : 'left') : (rtl ? 'left' : 'right'))
          : (v === 'start' ? 'بالا' : 'پایین')
        return chalk.gray(` (${fa})`)
      }
      const rowLayout = d.layoutMode === 'HORIZONTAL'

      console.log(chalk.cyan(`  ${comp} › ${cname}`) + chalk.gray(`  [${spec.nodeId}] «${node.name}» ${node.width.toFixed(0)}px`))
      console.log(`     layoutMode: ${d.layoutMode}`)
      const axisTag = (inline: boolean) => inline ? chalk.green(' ← ثبت می‌شود') : chalk.gray(' (محور block — فقط اطلاع)')
      if (d.justify) console.log(`     justify: ${d.justify}${label(d.justify, rowLayout)}${axisTag(rowLayout)}`)
      if (d.align) console.log(`     align:   ${d.align}${label(d.align, !rowLayout)}${axisTag(!rowLayout)}`)
      if (d.childNames.length > 1) {
        console.log(`     ترتیب DOM: ${d.childNames.map((n, i) => (i === 0 ? chalk.green(n) : n)).join(' → ')}`)
        console.log(chalk.gray(`                (اولین = ${physicalFa(rtl ? 'right' : 'left')}‌ترین · اسم‌ها لایه‌های فیگما اند، نه تگ کد)`))
      }
      for (const n of d.notes) console.log(chalk.gray(`     · ${n}`))

      // ⚠️ فقط محور **inline** ثبت می‌شود، نه block.
      // دلیل: تلهٔ RTL منحصراً روی محور inline است (راست↔چپ). محور block
      // (بالا/پایین) هیچ ترجمه‌ای ندارد و اغلب والد انجامش می‌دهد — مثلاً
      // `Table.Cell` خودش عمودی وسط‌چین می‌کند، پس ثبتِ `justify:center` برای
      // یک ستون باعث می‌شد layout-diff مطالبه‌اش کند و ۴ خطای کاذب بسازد.
      // ثبتِ کمترِ درست بهتر از ثبتِ بیشترِ پرنویز است.
      const next: ContainerLayout = { ...spec }
      const rowLayout2 = d.layoutMode === 'HORIZONTAL'
      delete next.justify
      delete next.align
      if (rowLayout2) { if (d.justify) next.justify = d.justify }
      else { if (d.align) next.align = d.align }
      updates[cname] = next

      // اختلافِ مقدار قبلی (دستی) با مقدار حساب‌شده = همان کلاس باگ
      for (const key of ['justify', 'align'] as const) {
        const before = spec[key]
        const after = next[key]
        if (before && after && before !== after) {
          console.log(chalk.red(`     ✗ ${key} دستی «${before}» بود ولی هندسه «${after}» می‌گوید — همان کلاس باگ`))
        }
      }
      console.log()
    }

    if (opts.write && Object.keys(updates).length > 0) {
      writeLayoutSnapshot(projectRoot, comp, {
        containers: { ...containers, ...updates },
        _source: 'mcp',
      })
    }
  }

  console.log('─'.repeat(60))
  console.log(`${derived} container حساب شد${missing > 0 ? chalk.yellow(` · ${missing} بی‌nodeId/بی‌node`) : ''}`)
  console.log(opts.write
    ? chalk.green('✓ در snapshot نوشته شد\n')
    : chalk.gray('(نوشته نشد — با --write ذخیره کن)\n'))

  return missing === 0
}
