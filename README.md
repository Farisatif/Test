# Test — Laravel / PHP

تمت إعادة تنظيم مشروع **Test** ليكون تطبيق Laravel قياسيًا قابلًا للتوسعة باستخدام PHP وBlade، مع الاحتفاظ بنسخة العمل السابقة المبنية على Node.js وTypeScript داخل `legacy-node-workspace/` للرجوع إليها أثناء النقل التدريجي.

## المتطلبات

يحتاج المشروع إلى PHP 8.3 أو أحدث، وComposer، وامتداد SQLite أو قاعدة بيانات أخرى يحددها ملف البيئة. ويمكن استخدام Node.js وnpm فقط عند الحاجة إلى تجميع ملفات CSS وJavaScript عبر Vite.

## التشغيل المحلي

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
npm install
npm run build
php artisan serve
```

بعد ذلك افتح `http://127.0.0.1:8000` في المتصفح.

## البنية الأساسية

| المسار | الاستخدام |
|---|---|
| `app/Http/Controllers` | وحدات التحكم ومنطق استقبال الطلبات |
| `app/Models` | نماذج Eloquent المرتبطة بقاعدة البيانات |
| `database/migrations` | تعريف تغييرات مخطط قاعدة البيانات |
| `database/seeders` | البيانات الأولية للتجربة أو التطوير |
| `resources/views` | واجهات Blade |
| `resources/css` و`resources/js` | أصول الواجهة التي يعالجها Vite |
| `routes/web.php` | مسارات صفحات الويب |
| `routes/console.php` | أوامر Artisan المخصصة |
| `public` | نقطة الدخول والملفات العامة |
| `storage` | السجلات والملفات المولدة |
| `tests` | اختبارات الوحدة والميزات |

## نقطة البداية الحالية

المسار `/` مربوط بـ `HomeController@index` ويعرض `resources/views/home.blade.php`. يمكنك إضافة بقية الصفحات من خلال إنشاء Controller، ثم تعريف Route، ثم إنشاء View داخل `resources/views`.

## نقل الواجهة القديمة

توجد الملفات السابقة في `legacy-node-workspace/`. لا يحتاج Laravel إلى pnpm workspace الموجود هناك؛ ويمكن نقل المكونات أو التصميم تدريجيًا إلى Blade وملفات `resources/css` و`resources/js` حسب الحاجة.

## أوامر مفيدة

```bash
php artisan route:list
php artisan make:model Product -m
php artisan make:controller ProductController --resource
php artisan migrate
php artisan test
npm run dev
```

للمرجع الرسمي، راجع [توثيق Laravel](https://laravel.com/docs) و[توثيق PHP](https://www.php.net/docs.php).
