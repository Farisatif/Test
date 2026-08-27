<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Bazaar</title>
    <link rel="icon" href="/logo.svg">
    <link rel="stylesheet" href="/build/style.css">
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/build/app.js"></script>
</body>
</html>
