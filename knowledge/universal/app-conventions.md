# App Conventions — Cross-Project (همه پروژه‌ها)
> updated: 2026-06-06 | scope: همه پروژه‌ها (framework-agnostic)
> این قوانین در همه taskها اجباری‌ان. معادل always-on در `CLAUDE.md` هر پروژه زندگی می‌کنه.

این فایل قوانین cross-framework اپلیکیشن رو نگه می‌داره (مستقل از DS).
قوانین مخصوص Chakra → `design-systems/chakra-ui-v3/chakra-ui-v3.md`.

---

## ۱. Sidebar — active/selected item اجباری

هر صفحه‌ای که باز می‌شه، **item متناظرش در Sidebar باید حالت selected/active** نشون بده.

- شامل sub-itemها هم می‌شه: روی sub-route که هستی، هم parent باید active دیده بشه (یا auto-open)، هم خودِ sub-item.
- **route-aware** باشه (مثل `NavLink isActive` یا `useLocation` match) — نه state دستی که با ناوبری sync نمی‌مونه.
- بدون این، کاربر نمی‌دونه کجای app هست.

**checklist هر صفحه جدید:** route اضافه شد → مطمئن شو sidebar item همون route حالت active می‌گیره (parent + sub-item).

---

## ۲. Responsive / Mobile — asset مخصوص view را بپرس

وقتی صفحه یا component لوکال در حالت responsive/mobile ساخته می‌شه و **لینک یا تصویر مخصوص اون view بهت داده نشده**:

- **ماژولار بپرس** — «برای حالت موبایل/responsive لینک یا تصویر جدا داری، یا از همون desktop استفاده کنم؟»
- حدس نزن، asset دلخواه نذار.
- کاربر گفت نه/همون → ادامه بده با asset موجود.
