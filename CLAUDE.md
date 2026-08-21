# dev-stack — راهنمای کار با Claude

این مونوریپو engine، دانش مشترک پروژه‌ها، و skillها را با هم نگه می‌دارد.
Claude این فایل رو در هر session می‌خونه تا بدونه ساختار چیه و چطور باهاش کار کنه.

> **معماری کل سیستم + فلوی Figma→code + تصمیمات قطعی → [`knowledge/BLUEPRINT.md`](knowledge/BLUEPRINT.md)** (قانون اساسی).
> هر وقت گیج شدی «این کجا بره / چه فلویی»، اول اونجا.

---

## ساختار پوشه‌ها

→ درخت کامل + دستورهای build در [`README.md`](README.md). اینجا تکرار نمی‌شود.

سه چیزی که موقع **ویرایش** باید بدانی:

- سورس skill = `skills/src/<name>/SKILL.md` (متن، نه باینری). `skills/dist/*.skill`
  خروجی build است و در گیت نیست — هرگز آنجا ویرایش نکن.
- بعد از هر ویرایش: `pnpm build:skills` **و** نصب مجدد در اپ Claude. تا نصب مجدد
  نشود، نسخهٔ قدیمی فعال است.
- راهنمای trigger و خروجی هر skill: [`skills/README.md`](skills/README.md)

> **ارجاع مرده = خطای build.** `build:skills` اول `pnpm check:refs` را می‌زند:
> مسیرها، لینک‌ها، نام skillها و سطح فرمان `dev-engine` را برابر فایل‌سیستم و
> `cli.ts` اعتبارسنجی می‌کند. استثناها در `scripts/refs-allow.json`.
> جزئیات: [skills/README.md](skills/README.md).

---

## قوانین scope

### universal/
- فقط چیزهایی که بدون تغییر در **همه پروژه‌ها** صدق می‌کنن
- اگه یه نکته project-specific یا DS-specific داره، اینجا نذار

### context پروژه (در repo خودِ پروژه — نه اینجا)

| چه چیزی | کجا |
|---|---|
| قانون always-on (gate، DoD، معماری، توکن) | `Projects/<name>/CLAUDE.md` |
| تصمیم بصری (رنگ، چیدمان، responsive، a11y، motion، لحن) | `Projects/<name>/DESIGN.md` — **ریشه**، نه `.claude/` |
| باگ project-specific، قالب صفحه، cache فیگما | `Projects/<name>/.claude/context/` |
| وضعیت و کار معوق | `Projects/<name>/HANDOFF.md` |

- با repo پروژه سفر می‌کنه؛ `knowledge/` فقط دانش cross-project نگه می‌داره
- load: skill `<project>-context` (thin loader — محتوا رو از repo پروژه می‌خونه، embed نمی‌کنه)
- مرز `CLAUDE.md ↔ DESIGN.md` (کدام قانون کجا می‌ماند) → `knowledge/BLUEPRINT.md` §۴

### design-systems/<name>/
- راهنما، token، و نکات خاص اون DS
- قابل استفاده در چند پروژه‌ی مختلف

---

## Workflow استاندارد

1. **خوندن context** — قبل از هر کار مرتبط با پروژه، skill آن پروژه رو load کن
2. **ویرایش فایل‌ها** — با ابزارهای Read/Write/Edit
3. **Commit خودکار** — بعد از هر تغییر، skill `wf-commit` اجرا می‌شه

### اصل طلایی — قانون اجباری در always-on، نه skill

> **چرا قبلاً مرحله‌ها فراموش می‌شدن:** قوانین حیاتی (مثل «DS رو از MCP بگیر، rebuild نکن») فقط در skillهای on-demand بودن. skill اگه trigger نشه یا نصب نباشه = قانون در context نیست.

سلسله‌مراتب قابلیت اطمینان:

| محل | کِی لود میشه | برای چی |
|-----|-------------|---------|
| **CLAUDE.md پروژه** | هر پیام، خودکار | قانون اجباری + DoD (gate) |
| **knowledge/*.md** | وقتی صریح read شه | مرجع عمیق |
| **Skills** | فقط trigger match | شتاب‌دهنده (نه منبع قانون) |

→ هر چیزی که **نباید فراموش شه** باید در CLAUDE.md پروژه باشه. این قانونه، نه سلیقه.

### مثال:
```
User: روی Vitrina کار می‌کنم
Claude: [loads vitrina-project-context skill] → [reads Vitrina/DESIGN.md + .claude/context/*]
```

---

## Skills مرتبط

### wf — Workflow (مدیریت session و repo)
| Skill | کاربرد |
|-------|---------|
| `wf-commit` | آماده‌سازی commit message برای هر git repo (جنرال) |
| `wf-start` | briefing وضعیت پروژه در شروع session |
| `wf-update` | ذخیره وضعیت و آپدیت HANDOFF.md در هر مرحله (جنرال) |

### dev — Development (کدنویسی و پروژه)
| Skill | کاربرد |
|-------|---------|
| `dev-implement` ⭐ | **نقطه‌ی ورود واحد Figma→code** — کل pipeline رو orchestrate می‌کنه (preflight→fetch→impl→verify→commit). از dev-engine CLI استفاده می‌کنه |
| `dev-init-wizard` | ساخت پروژه جدید با scaffold کامل (gate Figma→Code رو در CLAUDE.md پروژه bake میکنه) |
| `dev-engine` | اجرای dev-engine — بررسی و auto-fix کد (token/hardcode هم همین‌جاست — جایگزین dev-token-review) |
| `dev-delivery-check` ⚙️ | بررسی خودکار checklist قبل از تحویل/merge/deploy — **external** (anthropic-skills، فایل در skills/ نیست) |

### Figma (رسمی — figma plugin، نصب‌شده)
| Skill | جهت | کاربرد |
|-------|-----|--------|
| `figma-use` | — | اجرای JS در Figma (prerequisite برای write/read منحصربه‌فرد) |
| `figma-implement-design` | Figma → code | pipeline قدم‌به‌قدم پیاده‌سازی |
| `figma-generate-design` | code → Figma | ساخت صفحه در Figma از کد |
| `figma-generate-library` | — | ساخت library در Figma |
| `figma-code-connect` | — | اتصال کد به کامپوننت Figma |

> **مهم:** قانون اجباری Figma→code (Component Resolution / DS MCP / DoD) در **CLAUDE.md هر پروژه** زندگی میکنه (always-on)، نه در skill. skill فقط شتاب‌دهنده‌ست. مرجع عمیق: `knowledge/universal/figma-to-code.md`.
> skill قدیمی `figma-page-implement` بازنشسته شد — محتوای اجباریش در `figma-to-code.md` + gate پروژه‌ها ادغام شد.

### Figma — نگهداری اتصال (فایل local در `skills/`، نه پلاگین رسمی)
| Skill | کاربرد |
|-------|---------|
| `figma-mcp-reconnect` | وقتی اتصال Figma MCP قطع شده/نیاز به authenticate مجدد داره، با computer-use مراحل reconnect در تنظیمات Claude Desktop رو خودکار می‌کنه. هرگز credential وارد نمی‌کنه — اگه فرم لاگین دید متوقف می‌شه |

### project context (نصب‌شده)
| Skill | کاربرد |
|-------|---------|
| `vitrina-project-context` | Load context پروژه Vitrina |
| `airport-project-context` | Load context پروژه Airport |
| `vitrina-figma-rules` | قوانین طراحی Figma برای Vitrina (code→Figma) |
| `ds-chakra-ui` | Load دانش Chakra UI v3 |

سورس skillها در `skills/src/` است. برای نصب/آپدیت: `pnpm build:skills` بعد نصب `skills/dist/*.skill` در اپ Claude.

---

## نکات مهم برای Claude

- **هیچ‌وقت session ID رو hardcode نکن** — از dynamic path detection استفاده کن:
  ```bash
  DN_PATH=$(ls -d /sessions/*/mnt/dev-stack/knowledge 2>/dev/null | head -1)
  ```
- بعد از هر تغییر فایل در این repo، بدون اینکه کاربر بخواد، `wf-commit` اجرا کن
- برای خطاهای git: `knowledge/universal/git-troubleshoot.md` رو ببین
- برای استفاده از dev-engine CLI: `knowledge/universal/dev-engine.md` رو ببین
