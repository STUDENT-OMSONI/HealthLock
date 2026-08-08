# Fix: browser tab title (was 'Vite + React') + broken favicon

Write-Host "Applying title/favicon fix..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "public" | Out-Null

$content_0 = @'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HealthLock — Secure Health Records</title>
    <meta name="description" content="HealthLock keeps your health records encrypted end-to-end, organized in one place, and shared only with who you choose." />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

'@
Set-Content -Path "index.html" -Value $content_0 -NoNewline
Write-Host "Updated index.html" -ForegroundColor Green

$faviconB64 = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+CiAgPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNkYzI2MjYiLz4KICA8cmVjdCB4PSI5IiB5PSIxNSIgd2lkdGg9IjE0IiBoZWlnaHQ9IjExIiByeD0iMiIgZmlsbD0id2hpdGUiLz4KICA8cGF0aCBkPSJNMTIgMTV2LTNhNCA0IDAgMSAxIDggMHYzIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIuMiIgZmlsbD0ibm9uZSIvPgogIDxjaXJjbGUgY3g9IjE2IiBjeT0iMjAiIHI9IjEuNiIgZmlsbD0iI2RjMjYyNiIvPgo8L3N2Zz4K"
[IO.File]::WriteAllBytes("public\favicon.svg", [Convert]::FromBase64String($faviconB64))
Write-Host "Updated public\favicon.svg" -ForegroundColor Green

Write-Host "Done! Commit + push to redeploy on Vercel." -ForegroundColor Cyan