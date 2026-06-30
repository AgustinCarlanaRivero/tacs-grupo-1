# Busca el "punto de quiebre": sube el rate por etapas y mide como responde la app
# en cada una. Marca la primera etapa donde la app se degrada (success < umbral
# o latencia p99 por encima del umbral).
#
# Uso:
#   .\find-breakpoint.ps1
#   .\find-breakpoint.ps1 -Rates 100,300,600,1000,1500,2000 -Duration 15s
#   .\find-breakpoint.ps1 -P99LimitMs 200 -MinSuccess 99
#
# Requisitos:
#   - Vegeta (loadtest\vegeta.exe o en el PATH).
#   - Backend corriendo en http://localhost:3000 con DISABLE_AUTH=true.

param(
    # Escalones de carga (requests/seg) que se prueban en orden.
    [int[]]$Rates = @(100, 300, 600, 1000, 1500, 2000, 3000),
    # Duracion de cada escalon.
    [string]$Duration = "15s",
    # Si el p99 supera esto (ms), se considera que la app se degrado.
    [double]$P99LimitMs = 200,
    # Si el % de exito baja de esto, se considera que la app se rompio.
    [double]$MinSuccess = 99
)

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path

$localVegeta = Join-Path $here "vegeta.exe"
$vegeta = if (Test-Path $localVegeta) { $localVegeta } else { "vegeta" }

$targets   = Join-Path $here "targets.txt"
$outDir    = Join-Path $here "breakpoint"
$summary   = Join-Path $here "breakpoint-report.txt"
$plot      = Join-Path $here "breakpoint-plot.html"

if (Test-Path $outDir) { Remove-Item $outDir -Recurse -Force }
New-Item -ItemType Directory -Path $outDir | Out-Null

$rows = @()
$binFiles = @()
$breakRate = $null

foreach ($rate in $Rates) {
    Write-Host "==> Escalon: $rate req/s durante $Duration ..." -ForegroundColor Cyan

    $bin = Join-Path $outDir "$rate.bin"
    $binFiles += $bin

    # -name etiqueta esta etapa para que aparezca en la leyenda del grafico.
    & $vegeta attack "-targets=$targets" "-rate=$rate" "-duration=$Duration" `
        "-name=$rate rps" "-output=$bin"

    # Reporte en JSON para extraer las metricas de forma estructurada.
    $json = & $vegeta report "-type=json" "$bin" | ConvertFrom-Json

    $successPct = [math]::Round($json.success * 100, 2)
    $p95ms = [math]::Round($json.latencies.'95th' / 1e6, 2)   # ns -> ms
    $p99ms = [math]::Round($json.latencies.'99th' / 1e6, 2)
    $throughput = [math]::Round($json.throughput, 1)

    $degraded = ($successPct -lt $MinSuccess) -or ($p99ms -gt $P99LimitMs)
    $estado = if ($degraded) { "DEGRADADO" } else { "OK" }

    $rows += [pscustomobject]@{
        Rate       = $rate
        Throughput = $throughput
        SuccessPct = $successPct
        P95ms      = $p95ms
        P99ms      = $p99ms
        Estado     = $estado
    }

    Write-Host ("    success={0}%  p95={1}ms  p99={2}ms  -> {3}" -f $successPct, $p95ms, $p99ms, $estado) `
        -ForegroundColor $(if ($degraded) { "Red" } else { "Green" })

    if ($degraded -and ($null -eq $breakRate)) {
        $breakRate = $rate
        # Una etapa mas para confirmar la tendencia y cortamos.
        break
    }
}

# ---- Resumen ----
$table = $rows | Format-Table -AutoSize | Out-String

$conclusion = if ($null -ne $breakRate) {
    "Punto de quiebre: la app empieza a degradarse a ~$breakRate req/s " +
    "(umbral: success >= $MinSuccess%, p99 <= $P99LimitMs ms)."
} else {
    "No se alcanzo el punto de quiebre con los rates probados (hasta $($Rates[-1]) req/s). " +
    "Probar con valores mas altos en -Rates."
}

$header = "Load test - busqueda de punto de quiebre`n" +
          "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n" +
          "Duracion por escalon: $Duration`n"

($header + $table + "`n" + $conclusion) | Tee-Object -FilePath $summary | Out-Null

Write-Host ""
Write-Host $table
Write-Host $conclusion -ForegroundColor Yellow

# Grafico con TODAS las etapas superpuestas (cada una con su color en la leyenda).
& $vegeta plot $binFiles | Set-Content -Path $plot -Encoding UTF8

Write-Host ""
Write-Host "Resumen:  $summary" -ForegroundColor Green
Write-Host "Grafico:  $plot"   -ForegroundColor Green
