$ErrorActionPreference = 'Stop'
$BaseUrl = 'http://localhost:8000/api/v1'

Write-Host '1/3 Verificando Laravel en puerto 8000...'
$health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get
if ($health.status -ne 'ok') { throw 'Laravel no respondió correctamente.' }

Write-Host '2/3 Probando login JWT...'
$loginBody = @{ identifier = 'lic.jorgemendez@gmail.com'; password = 'password' } | ConvertTo-Json
$login = Invoke-RestMethod -Uri "$BaseUrl/fit/auth/login" -Method Post -ContentType 'application/json' -Body $loginBody
$token = $login.data.access_token
if (-not $token) { throw 'Laravel no devolvió el token JWT.' }

Write-Host '3/3 Consultando dashboard autenticado...'
$headers = @{ Authorization = "Bearer $token" }
$dashboard = Invoke-RestMethod -Uri "$BaseUrl/fit/dashboard" -Method Get -Headers $headers
if ($null -eq $dashboard.data.clients) { throw 'El dashboard no devolvió la estructura esperada.' }

Write-Host "INTEGRACION CORRECTA: Laravel=$($health.status), clientes=$($dashboard.data.clients), rutinas=$($dashboard.data.routines)" -ForegroundColor Green
