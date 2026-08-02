export type Direction = 'rtl' | 'ltr' | 'both'
export type Calendar = 'jalali' | 'hijri' | 'gregorian'
export type DesignSystem = 'chakra-v3' | 'chakra-v2' | 'mui' | 'antd' | 'mantine' | 'generic'
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
  _synced?: string   // ISO date
  _source?: 'mcp' | 'rest' | 'manual'
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
}

export interface RenderedSnapshotFile {
  _meta?: { dir?: 'rtl' | 'ltr'; viewport?: number; capturedAt?: string }
  [componentName: string]: RenderedSnapshot | RenderedSnapshotFile['_meta'] | undefined
}

export type LayoutSnapshotCache = Record<string, LayoutSnapshot>   // key: component name
