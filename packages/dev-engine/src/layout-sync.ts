import { existsSync, writeFileSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import chalk from 'chalk'
import type { LayoutSnapshotCache } from './types.js'
import { layoutCachePath, loadLayoutSnapshots, layoutCacheAgeDays } from './layout-cache.js'

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
