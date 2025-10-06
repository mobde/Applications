# TahfeezSuite — Auto Phases via Claude + GitHub Actions

## إعداد السر
- Settings → Secrets and variables → Actions → **New repository secret**
- Name: `ANTHROPIC_API_KEY`
- Value: مفتاح Claude

## صلاحيات الوركفلو
- Settings → Actions → General → **Workflow permissions: Read and write permissions**

## التشغيل
- يدويًا: تبويب **Actions** → Workflow: *Claude Phase Builder* → **Run workflow** (يمكن تمرير `forcePhase`).
- مجدول: يوميًا 09:00 بتوقيت الرياض.

## كيف يعمل؟
- يقرأ `prompts/system.md` و`prompts/phase-N.md`.
- يطلب من Claude إخراج JSON فيه ملفات لتُنشأ/تُحدّث.
- يكتب الملفات ويعمل commit/push.
- إذا `nextPhaseReady=true` يرفع رقم المرحلة في `state/current_phase.txt`.
