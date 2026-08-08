import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs'
import { dirname, resolve } from 'path'
import type { LayoutSnapshot, LayoutSnapshotCache } from './types.js'

// Local-only cache (project-specific, per-instance design facts — نه چیزی که بین پروژه‌ها shared باشه).
// هم‌خانواده‌ی figma-resolve.json ولی جدا، چون این یکی geometry/order هست نه component→code mapping.
const LOCAL_LAYOUT_CACHE = '.claude/context/figma-layout.json'

export function layoutCachePath(projectRoot: string): string {
  return resolve(projectRoot, LOCAL_LAYOUT_CACHE)
}

export function loadLayoutSnapshots(projectRoot: string): LayoutSnapshotCache {
  const path = layoutCachePath(projectRoot)
  if (!existsSync(path)) return {}
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as LayoutSnapshotCache
  } catch {
    return {}
  }
}

// snapshot یه کامپوننت رو می‌نویسه/آپدیت می‌کنه — مصرف‌کننده: STEP 2 دستی (MCP، توسط Claude)
// یا هر ابزار دیگه‌ای که بخواد بدون دست‌کاری مستقیم فایل، بنویسه.
export function writeLayoutSnapshot(
  projectRoot: string,
  componentName: string,
  snapshot: LayoutSnapshot
): void {
  const path = layoutCachePath(projectRoot)
  const existing = loadLayoutSnapshots(projectRoot)
  // ⚠️ merge است نه replace — پس بدون این، یک fact غلط هرگز قابل پس‌گرفتن نبود
  // (نمونهٔ واقعی 2026-08-08: childOrder با اسم‌های خیالی که با هیچ فرزندی match
  // نمی‌کرد و چک را بی‌صدا خاموش نگه می‌داشت؛ --set دوباره فقط رویش می‌نوشت).
  // قرارداد: مقدار `null` یعنی «این فیلد را حذف کن».
  const entry: Record<string, unknown> = {
    ...existing[componentName],
    ...snapshot,
    _synced: new Date().toISOString().slice(0, 10),
  }
  for (const [k, v] of Object.entries(entry)) {
    if (v === null) delete entry[k]
  }
  const merged: LayoutSnapshotCache = {
    ...existing,
    [componentName]: entry as LayoutSnapshot,
  }
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(merged, null, 2) + '\n')
}

export function layoutCacheAgeDays(snapshot: LayoutSnapshot): number | null {
  if (!snapshot._synced) return null
  const synced = new Date(snapshot._synced).getTime()
  if (Number.isNaN(synced)) return null
  return Math.floor((Date.now() - synced) / 86_400_000)
}
