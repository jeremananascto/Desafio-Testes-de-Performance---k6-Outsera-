// Resume reports/load/summary.json em Markdown (usado no Job Summary do GitHub Actions).
// Uso: node scripts/summary.js [--strict]  (--strict sai com código 1 se algum threshold falhou)
const fs = require('node:fs');

const file = 'reports/load/summary.json';
if (!fs.existsSync(file)) {
  console.error(`${file} não encontrado. Rode o teste antes.`);
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const val = (name, key) => {
  const m = data.metrics[name];
  return m ? (m.values ?? m)[key] : undefined;
};
const fmt = (n, d = 0) => (n === undefined ? '?' : Number(n).toFixed(d));

const failedThresholds = [];
for (const [name, m] of Object.entries(data.metrics)) {
  for (const [expr, t] of Object.entries(m.thresholds ?? {})) {
    if (!t.ok) failedThresholds.push(`${name}: ${expr}`);
  }
}

const lines = [
  '# Resumo do teste de carga (k6)',
  '',
  '| Métrica | Valor |',
  '|---|---|',
  `| Requisições | ${fmt(val('http_reqs', 'count'))} (${fmt(val('http_reqs', 'rate'), 1)} req/s) |`,
  `| Taxa de falhas | ${fmt((val('http_req_failed', 'rate') ?? 0) * 100, 2)}% |`,
  `| Latência p95 / p99 | ${fmt(val('http_req_duration', 'p(95)'))} ms / ${fmt(val('http_req_duration', 'p(99)'))} ms |`,
  `| VUs máximos | ${fmt(val('vus_max', 'max'))} |`,
  `| Thresholds | ${failedThresholds.length ? '❌ ' + failedThresholds.join('; ') : '✅ todos aprovados'} |`,
];
console.log(lines.join('\n'));
if (process.argv.includes('--strict') && failedThresholds.length) process.exit(1);
