import { existsSync, readFileSync } from 'fs'
import { resolve, dirname, basename } from 'path'
import { homedir } from 'os'
import { fileURLToPath } from 'url'
import { globSync } from 'glob'

// config DS id → نام پوشه در dev-knowledge/design-systems/ — fallback وقتی هیچ
// ds.json منطبقی در registry نیست (مثلاً dev-knowledge هنوز mount نشده)
const DS_FOLDER: Record<string, string> = {
  'chakra-v3': 'chakra-ui-v3',
  'chakra-v2': 'chakra-ui-v3',
  'mui': 'mui',
  'antd': 'antd',
  'mantine': 'mantine',
  'generic': 'generic',
}

// config DS id → نام package برای چک نصب — همان fallback layer
const DS_PACKAGE: Record<string, string> = {
  'chakra-v3': '@chakra-ui/react',
  'chakra-v2': '@chakra-ui/react',
  'mui': '@mui/material',
  'antd': 'antd',
  'mantine': '@mantine/core',
}

// از startDir به سمت بالا دنبال rel می‌گردد. سقف ۸ سطح — از بی‌نهایت شدن روی
// فایل‌سیستم‌های عجیب جلوگیری می‌کند.
function findInAncestors(startDir: string, rel: string): string | null {
  let dir = startDir
  for (let i = 0; i < 8; i++) {
    if (existsSync(resolve(dir, rel))) return resolve(dir, rel)
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

// محل knowledge: env DN_PATH > config > مونوریپو (نسبت به خودِ engine) >
// مسیرهای legacy > Cowork mount.
//
// مسیر مونوریپو مقدم بر hardcode است: engine در dev-stack/packages/dev-engine/
// است و knowledge در dev-stack/knowledge/ — پس بالا رفتن از محل خودِ ماژول
// جواب می‌دهد، صرف‌نظر از اینکه repo کجای دیسک clone شده باشد. مسیرهای
// homedir زیر فقط fallback‌اند برای وقتی engine جای دیگری نصب شده (npm link).
export function findDevKnowledge(configPath?: string): string | null {
  const candidates: string[] = []
  if (process.env.DN_PATH) candidates.push(process.env.DN_PATH)
  if (configPath) candidates.push(configPath)

  // dev-stack/packages/dev-engine/{src,dist}/ → dev-stack/knowledge/
  const selfDir = dirname(fileURLToPath(import.meta.url))
  const inRepo = findInAncestors(selfDir, 'knowledge/design-systems')
  if (inRepo) candidates.push(dirname(inRepo))

  candidates.push(resolve(homedir(), 'Documents/GitHub/dev-stack/knowledge'))
  // legacy — چیدمان قبل از ادغام dev-agents + dev-knowledge
  candidates.push(resolve(homedir(), 'Documents/GitHub/Tools/dev-knowledge'))
  try {
    candidates.push(...globSync('/sessions/*/mnt/dev-stack/knowledge'))
    candidates.push(...globSync('/sessions/*/mnt/dev-knowledge'))
  } catch { /* /sessions نیست — local */ }
  return candidates.find(p => existsSync(p)) ?? null
}

// ── DS registry: data-driven، از dev-knowledge/design-systems/<folder>/ds.json ─
export interface DsManifest {
  id: string
  aliases?: string[]
  package?: string | null
  targets?: string | null
  contract?: number
  folder: string    // directory name, e.g. 'chakra-ui-v3'
  dir: string        // absolute path to the DS folder
}

// memoize بر اساس مسیر resolve‌شدهٔ dev-knowledge — دیسک فقط یک‌بار خونده می‌شه
const dsRegistryCache = new Map<string, DsManifest[]>()

export function loadDsRegistry(configPath?: string): DsManifest[] {
  const dk = findDevKnowledge(configPath)
  if (!dk) return []

  const cached = dsRegistryCache.get(dk)
  if (cached) return cached

  let manifestPaths: string[] = []
  try {
    manifestPaths = globSync('design-systems/*/ds.json', { cwd: dk, absolute: true })
  } catch {
    manifestPaths = []
  }

  const registry: DsManifest[] = []
  for (const manifestPath of manifestPaths) {
    const dsDir = dirname(manifestPath)
    const folder = basename(dsDir)
    if (folder.startsWith('_')) continue // template folders، نه design system واقعی

    try {
      const raw = readFileSync(manifestPath, 'utf8')
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object') continue

      const id = typeof parsed.id === 'string' && parsed.id.length > 0 ? parsed.id : folder
      registry.push({
        id,
        aliases: Array.isArray(parsed.aliases) ? parsed.aliases : undefined,
        package: parsed.package ?? null,
        targets: parsed.targets ?? null,
        contract: typeof parsed.contract === 'number' ? parsed.contract : undefined,
        folder,
        dir: dsDir,
      })
    } catch {
      continue // manifest خراب/غیرقابل‌parse — نادیده بگیر، throw نکن
    }
  }

  dsRegistryCache.set(dk, registry)
  return registry
}

export function findDs(ds: string, configPath?: string): DsManifest | null {
  const registry = loadDsRegistry(configPath)
  return (
    registry.find(m => m.id === ds) ??
    registry.find(m => m.aliases?.includes(ds)) ??
    registry.find(m => m.folder === ds) ??
    null
  )
}

export function dsFolder(ds: string): string {
  return findDs(ds)?.folder ?? DS_FOLDER[ds] ?? ds
}

export function dsPackage(ds: string): string | null {
  return findDs(ds)?.package ?? DS_PACKAGE[ds] ?? null
}
