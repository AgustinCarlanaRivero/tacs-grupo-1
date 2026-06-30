# Load test (Vegeta)

Prueba de carga del backend usando [Vegeta](https://github.com/tsenart/vegeta).

## 1. Instalar Vegeta (Windows)

Cualquiera de estas opciones:

```powershell
# con Scoop
scoop install vegeta

# o con Chocolatey
choco install vegeta

# o con Go
go install github.com/tsenart/vegeta/v12@latest
```

O descargar el binario `.exe` desde https://github.com/tsenart/vegeta/releases
y dejarlo en el PATH.

Verificar: `vegeta --version`

## 2. Levantar el backend

El test pega a varios endpoints (algunos requieren login), así que se corre con
el bypass de auth de desarrollo (`DISABLE_AUTH=true`, ya presente en `config/.env.dev`).

```powershell
# Mongo local
docker compose -f docker-compose.dev.yml up -d

cd backend
pnpm install
pnpm seed        # carga datos para que los endpoints devuelvan algo
pnpm dev
```

El backend queda en http://localhost:3000.

## 3. Correr el load test

Con el backend corriendo, desde otra terminal:

```powershell
cd loadtest
.\run-loadtest.ps1                      # 50 req/s durante 30s (default)
.\run-loadtest.ps1 -Rate 100 -Duration 60s
```

Genera:

- `report.txt`   — métricas: throughput, latencias (p50/p95/p99/max), % de éxito y códigos HTTP.
- `latencias.html` — gráfico de latencias en el tiempo (abrir en el navegador).

## 4. Buscar el punto de quiebre (opcional)

Sube la carga por escalones y marca dónde la app se degrada (success < umbral
o p99 por encima del umbral). Se frena solo en el primer escalón degradado.

```powershell
.\find-breakpoint.ps1                                    # escalones por defecto
.\find-breakpoint.ps1 -Rates 200,300,400,500 -Duration 12s
.\find-breakpoint.ps1 -P99LimitMs 200 -MinSuccess 99
```

Genera:

- `breakpoint-report.txt` — tabla por escalón + conclusión del punto de quiebre.
- `breakpoint-plot.html`  — gráfico con todas las etapas superpuestas (abrir en el navegador).

## Dónde ver los resultados

Todos los resultados quedan como archivos en esta carpeta (`loadtest/`):

| Archivo                  | Qué es                         | Cómo abrirlo            |
| ------------------------ | ------------------------------ | ----------------------- |
| `report.txt`             | métricas del test básico       | editor / consola        |
| `latencias.html`         | gráfico del test básico        | doble clic → navegador  |
| `breakpoint-report.txt`  | tabla + punto de quiebre       | editor / consola        |
| `breakpoint-plot.html`   | gráfico de todas las etapas    | doble clic → navegador  |

Los `.txt` también se imprimen en la consola al terminar el script.

## Endpoints bajo carga

Ver `targets.txt`. Mix de GET que ejercitan distintos módulos:
`/health` (baseline sin DB), `/stickers` y variantes, `/posts`, `/templates`.

## Interpretar el reporte

Ejemplo de salida de `vegeta report`:

```
Requests      [total, rate, throughput]  1500, 50.03, 50.01
Latencies     [min, mean, p50, p90, p95, p99, max]  1.2ms, 8.4ms, 6ms, 15ms, 22ms, 48ms, 120ms
Success       [ratio]                    100.00%
Status Codes  [code:count]               200:1500
```

- **throughput**: requests/seg efectivamente servidas.
- **p95 / p99**: el 95% / 99% de las requests respondió por debajo de ese tiempo.
- **Success ratio**: si baja de 100% hay errores (ver Status Codes para el detalle).
