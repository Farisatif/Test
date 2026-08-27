<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ config('app.name', 'Test') }}</title>
    <style>
        :root {
            color-scheme: dark;
            font-family: Tahoma, Arial, sans-serif;
        }

        * { box-sizing: border-box; }
        body {
            min-height: 100vh;
            margin: 0;
            color: #f8fafc;
            background: #020617;
        }

        main {
            display: flex;
            align-items: center;
            min-height: 100vh;
            max-width: 1100px;
            margin: 0 auto;
            padding: 64px 24px;
        }

        section {
            width: 100%;
            padding: 48px;
            border: 1px solid #1e293b;
            border-radius: 24px;
            background: rgba(15, 23, 42, .9);
            box-shadow: 0 24px 80px rgba(0, 0, 0, .35);
        }

        .eyebrow {
            margin: 0 0 16px;
            color: #34d399;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: .2em;
            text-transform: uppercase;
        }

        h1 {
            margin: 0 0 20px;
            font-size: clamp(36px, 7vw, 68px);
            line-height: 1.1;
        }

        .intro {
            max-width: 760px;
            margin: 0;
            color: #cbd5e1;
            font-size: 18px;
            line-height: 1.9;
        }

        .cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-top: 32px;
        }

        .card {
            padding: 20px;
            border-radius: 16px;
            background: #1e293b;
            color: #cbd5e1;
            line-height: 1.7;
        }

        .card strong {
            display: block;
            margin-bottom: 8px;
            color: #fff;
        }

        @media (max-width: 700px) {
            section { padding: 32px 24px; }
            .cards { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <main>
        <section>
            <p class="eyebrow">Laravel / PHP</p>
            <h1>مرحبًا بك في مشروع Test</h1>
            <p class="intro">
                تم تجهيز المشروع بهيكل Laravel قياسي، ويمكنك الآن إضافة النماذج، وحدات التحكم، المسارات، وواجهات Blade أو أي واجهة أمامية تحتاجها.
            </p>
            <div class="cards">
                <div class="card">
                    <strong>Backend</strong>
                    PHP وLaravel داخل مجلدات app وroutes وdatabase.
                </div>
                <div class="card">
                    <strong>Views</strong>
                    واجهات Blade داخل resources/views.
                </div>
                <div class="card">
                    <strong>Assets</strong>
                    ملفات CSS وJavaScript داخل resources عند الحاجة.
                </div>
            </div>
        </section>
    </main>
</body>
</html>
