Assumptions:
- اللغة C#/.NET 8، SQL Server محلي (LocalDB أو SQLEXPRESS).
- الفرع الافتراضي main.
- تشغيل محلّي عبر dotnet CLI.

المطلوب في Phase 1:
1) إنشاء السولوشن بالمشاريع الأربعة:
   - Tahfeez.Shared (Class Library): الكيانات الأساسية (Student فقط لهذه المرحلة)، DTOs، Validation.
   - Tahfeez.Api (Minimal API): Program.cs كامل، DbContext، EF Core Migrations، Endpoints CRUD للطلاب، SeedData (20 طالب).
   - Tahfeez.Web (Blazor WASM PWA): App.razor, MainLayout, NavMenu (RTL)، صفحات الطلاب: List/Create/Edit/Details/Delete، HttpClient Typed للطلاب.
   - Tahfeez.Desktop (MAUI Blazor Hybrid): تهيئة أساسية لاستضافة نفس مكونات الويب (قد تبقى Placeholder الآن).

2) ربط الصفحات:
   - صفحة القائمة تعرض أزرار (تفاصيل/تعديل/حذف) تعمل.
   - زر "إضافة طالب" يفتح صفحة إنشاء، وبعد الحفظ يعود للقائمة.
   - صفحة التفاصيل تعرض الحقول وروابط رجوع/تعديل.

3) قاعدة البيانات:
   - Migration أولى وتشغيل `dotnet ef database update` في README.
   - ConnectionString في appsettings.Development.json.

4) README:
   - خطوات التشغيل: API أولاً ثم Web.
   - أوامر: استعادة الحزم، بناء، تشغيل.

5) التسليم:
   - أنشئ الملفات داخل مجلدات المشاريع.
   - أعد JSON يحوي الملفات والمحتوى بالكامل + commitMessage.
   - إذا اكتملت المرحلة بنجاح أعد nextPhaseReady=true.
