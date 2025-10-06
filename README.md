# TahfeezSuite — Auto Phases via GitHub Actions

هذا المستودع مهيّأ لبناء المشروع على مراحل تلقائيًا عبر GitHub Actions.
عند تشغيل الوركفلو، سيولّد ملفات المرحلة الحالية ويضيفها كـ commit جديد.

## كيف يعمل؟
- ملفات المرحلة موجودة في: `prompts/phase-N.md` وملف نظام عام في `prompts/system.md`.
- رقم المرحلة الحالية يُقرأ من: `state/current_phase.txt` (ابدأ بـ `1`).
- سكربت التنفيذ: `scripts/claude_phase.mjs`.
- الوركفلو: `.github/workflows/claude-phase.yml`.

## التشغيل
1) افتح تبويب **Actions** في هذا المستودع.
2) اختر **Claude Phase Builder** ثم **Run workflow**.
3) (اختياري) أدخل قيمة `forcePhase` لتشغيل مرحلة بعينها.
4) بعد نجاح التنفيذ، ستجد commit جديد يحتوي ملفات المرحلة.

## هيكلة المستودع
