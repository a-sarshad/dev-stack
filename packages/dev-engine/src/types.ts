export type Direction = 'rtl' | 'ltr' | 'both'
export type Calendar = 'jalali' | 'hijri' | 'gregorian'
export type KnownDesignSystem = 'chakra-v3' | 'chakra-v2' | 'mui' | 'antd' | 'mantine' | 'generic'
export type DesignSystem = KnownDesignSystem | (string & {})
export type IconLibrary = 'lucide' | 'heroicons' | 'fa' | 'mdi' | 'generic'

export interface PathConfig {
  direction: Direction
  locale?: string
}

export interface ProjectConfig {
  direction: Direction
  locale: string
  calendar: Calendar
  ds: DesignSystem
  icon_lib: IconLibrary
  paths?: Record<string, PathConfig>
  ignore?: string[]
  ignore_custom_components?: string[]
  claude_api_key?: string
  modules?: string[]
  // override برای build-git check — اگه set شه عیناً اجرا می‌شه (مثلاً "npx tsc --noEmit").
  // خالی → auto-detect: `<pm> run build` که pm از lockfile پروژه میاد.
  build_command?: string
  // Figma sync (BLUEPRINT §6) — اول پروژه پرسیده و اینجا ذخیره می‌شه
  figma_source?: 'mcp' | 'rest'
  figma_file_key?: string
  ds_mcp?: string
  dev_knowledge_path?: string   // override برای پیدا کردن لایه DS cache
  import_alias?: string         // برای scan — مثلاً '@/' (پیش‌فرض)
  ds_contract?: number          // نسخهٔ contract لایهٔ DS رو pin می‌کنه — doctor روی mismatch hard-fail می‌کنه
}

export interface Violation {
  file: string
  line: number
  column?: number
  module: string
  rule: string
  message: string
  severity: 'error' | 'warning' | 'info'
  autoFixable: boolean
  fix?: string
  original?: string
  replacement?: string
}

export interface CheckResult {
  file: string
  violations: Violation[]
  fixed: number
  skipped: number
}

export interface CheckModule {
  id: string
  name: string
  description: string
  supportedDirections: Direction[]
  supportedDS?: DesignSystem[]
  check(filePath: string, content: string, config: ProjectConfig): Violation[]
  fix?(content: string, violations: Violation[]): string
}

export interface RunOptions {
  fix: boolean
  reportOnly: boolean
  changed: boolean
  modules?: string[]
  verbose: boolean
}

// ── Figma → code resolution cache (BLUEPRINT §6) ──────────────────────────────
// دو لایه: DS (shared، در dev-knowledge) + Local (در repo پروژه). merge با Local-first.
export interface FigmaResolveCache {
  components?: Record<string, string>   // Figma component name → code import (e.g. "Button": "@chakra-ui/react#Button")
  tokens?: Record<string, string>       // Figma var/token → code token (e.g. "color/primary/500": "colors.primary.500")
  variables?: Record<string, string>    // Figma boolean/string variable → معنی/flag
  _synced?: string                      // ISO date آخرین sync
  _source?: string                      // 'mcp' | 'rest' | 'seed'
}

export interface MergedResolve extends FigmaResolveCache {
  _layers: { ds: boolean; local: boolean }   // کدوم لایه‌ها contribute کردن
}

// ── Figma layout snapshot cache (layout-diff module) ──────────────────────────
// per-component snapshot از facts واقعی طرح فیگما (نه rule عمومی) — برای مقایسه
// با کد پیاده‌شده. population: MCP (Claude موقع STEP 2 dev-implement می‌نویسه).
// ⚠️ قرارداد کل این interface: هر مقدار جهت‌دار **semantic** است، نه فیزیکی.
//    start = سمت شروعِ خواندن (RTL: راست · LTR: چپ)
//    end   = سمت پایانِ خواندن (RTL: چپ  · LTR: راست)
// canvas فیگما همیشه LTR رندر می‌شه، پس مقدار خام فیگما (RIGHT/LEFT) را باید
// اول نسبت به direction پروژه به start/end ترجمه کرد، بعد اینجا نوشت.
export interface LayoutSnapshot {
  // ترتیب واقعی فرزندهای مستقیم root element (اسم tag/component)، به ترتیب visual طراحی —
  // در RTL یعنی از راست به چپ (چون first-in-DOM = rightmost)
  childOrder?: string[]
  // جهت auto-layout فیگما برای root
  layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'NONE'
  // سمت آیکون نسبت به متن، جهت‌آگاه (start = اول در DOM، مستقل از RTL/LTR)
  iconSide?: 'start' | 'end'
  // چیدمان متن، به‌صورت semantic (نه چپ/راست خام)
  textAlign?: 'start' | 'end' | 'center'
  // چیدمان محور اصلی (justify-content) — semantic
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  // چیدمان محور عرضی (align-items) — semantic
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline'
  // توکن رنگ آیکون که طرح می‌گه — مثلاً "fg.muted" یا "brand.solid" (نه hex خام)
  iconColor?: string
  // چیدمانِ containerهای *داخلی* که با marker در کد anchor شدن — پایینتر ببین.
  containers?: Record<string, ContainerLayout>
  _synced?: string   // ISO date
  _source?: 'mcp' | 'rest' | 'manual'
}

// ── چیدمان یک container داخلی، anchor شده با marker ────────────────────────────
// ⚠️ چرا این وجود داره — INCIDENT 2026-08-08 (Vitrina/DiscountCodesTable):
// فیلدهای `justify`/`align` بالا سطحِ **component** ان، ولی واقعیتِ چیدمان سطح
// **container** است. یک کامپوننت جدول ۸ ردیف افقی با intent متفاوت داره (۷ سلول
// باید start باشن، ستون عملیات باید end باشه). قبلاً layout-diff هر تطبیقِ
// justify در کل کامپوننت را با همان یک مقدار مقایسه می‌کرد، پس:
//   • مقدار درست را می‌نوشتی → ۷ خط درست پاس، ۱ خط درست false-positive
//   • پس عملاً هیچ‌کس این فیلد را پر نمی‌کرد → `if (!snap.justify) return []` → سکوت
// این دقیقاً در `_note` خودِ CampaignCard مستند شده بود («NO justify field here on
// purpose … any single value false-positives on one of the two lines») و بعد سه بار
// همان باگ ship شد (CampaignCard 08-03، NewCampaignDialog 08-03، DiscountCodes 08-08).
//
// راه‌حل: container را در کد با یک marker کامنت نام‌گذاری کن:
//     {/* @layout actionsCell */}
//     <Flex justify="end"> … </Flex>
// و در snapshot:
//     "containers": { "actionsCell": { "justify": "end" } }
// layout-diff تگِ بازِ **بلافاصله بعدِ** marker را چک می‌کند — نه کل کامپوننت.
// هر دو سمتِ نبودن هم warning می‌دهد (marker بی‌snapshot، snapshot بی‌marker)، پس
// دیگر «۰ issue» نمی‌تواند یعنی «هیچی چک نشد».
export interface ContainerLayout {
  // node فیگمای متناظر — تنها فیلدی که نمی‌شود از ذهن ساخت.
  // با این، `justify`/`align`/`childOrder` را `layout-derive` **حساب** می‌کند
  // (x + width در برابر لبهٔ والد) به‌جای اینکه دست آدم تایپ کند. نوشتن دستیِ
  // `"align":"start"` همان مرحله‌ای بود که سه بار برعکس نوشته شد.
  nodeId?: string
  justify?: LayoutSnapshot['justify']
  align?: LayoutSnapshot['align']
  textAlign?: LayoutSnapshot['textAlign']
  // ترتیب فرزندهای مستقیمِ همین container — به ترتیب visual طرح (RTL: راست→چپ).
  // `childOrder` سطح بالا فقط root را می‌گیرد؛ باگ‌های واقعی اغلب در زوج‌های
  // *داخلی* اند. INCIDENT 2026-08-08: قاعدهٔ «sort نزولی روی x» فقط روی ردیف
  // بیرونیِ DiscountCodeCard اعمال شد و سه زوج داخلی آینه‌ای ship شدند —
  // قاعده بازگشتی است و این فیلد همان بازگشت را قابل‌چک می‌کند.
  childOrder?: string[]
  _note?: string
}

// ── Rendered geometry snapshot (ماژول verify-render) ──────────────────────────
// از DOM واقعیِ preview دامپ می‌شه (getBoundingClientRect + getComputedStyle) و با
// LayoutSnapshot مقایسه می‌شه. این تنها لایه‌ایه که چیزهایی مثل «justify زیر dir=rtl
// برعکس resolve شد» رو قطعی می‌گیره، چون عدد اندازه‌گیری‌شده‌ست نه متن کد.
export interface RenderedChild {
  tag: string
  x: number        // left نسبت به viewport (فیزیکی)
  width: number
}

export interface RenderedSnapshot {
  children?: RenderedChild[]
  textAlign?: string    // computed style خام: left/right/center/start/end
  iconColor?: string    // computed color خام: rgb(...)
  x?: number
  width?: number
  // computed خام — برای مقایسه با ContainerLayout. مرورگر `start`/`flex-start`
  // را به مقدار resolve‌شدهٔ خودش برمی‌گرداند، پس این تنها جایی است که معلوم
  // می‌شود `dir` ارثی واقعاً چه چیزی را flip کرد.
  justifyContent?: string
  alignItems?: string
  flexDirection?: string
}

export interface RenderedSnapshotFile {
  _meta?: { dir?: 'rtl' | 'ltr'; viewport?: number; capturedAt?: string }
  [componentName: string]: RenderedSnapshot | RenderedSnapshotFile['_meta'] | undefined
}

export type LayoutSnapshotCache = Record<string, LayoutSnapshot>   // key: component name
