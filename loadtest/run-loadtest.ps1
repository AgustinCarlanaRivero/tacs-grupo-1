# Load test con Vegeta.
# Uso:
#   .\run-loadtest.ps1                      # 50 req/s durante 30s
#   .\run-loadtest.ps1 -Rate 100 -Duration 60s
#
# Requisitos:
#   - Vegeta instalado (ver README.md).
#   - Backend corriendo en http://localhost:3000 con DISABLE_AUTH=true.

param(
    [int]$Rate = 50,
    [string]$Duration = "30s"
)

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path

# Usar el vegeta local (loadtest\vegeta.exe) si existe; si no, el del PATH.
$localVegeta = Join-Path $here "vegeta.exe"
$vegeta = if (Test-Path $localVegeta) { $localVegeta } else { "vegeta" }

$targets = Join-Path $here "targets.txt"
$bin     = Join-Path $here "results.bin"
$report  = Join-Path $here "report.txt"
$plot    = Join-Path $here "latencias.html"

Write-Host "Atacando $Rate req/s durante $Duration ..." -ForegroundColor Cyan

# attack -> resultados binarios
& $vegeta attack "-targets=$targets" "-rate=$Rate" "-duration=$Duration" "-output=$bin"

# reporte de texto (latencias, throughput, % exito, codigos HTTP)
& $vegeta report "$bin" | Tee-Object -FilePath $report

# grafico HTML de latencias en el tiempo
& $vegeta plot "$bin" | Set-Content -Path $plot -Encoding UTF8

Write-Host ""
Write-Host "Reporte:  $report" -ForegroundColor Green
Write-Host "Grafico:  $plot"   -ForegroundColor Green
