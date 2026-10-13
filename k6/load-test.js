import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

const BASE_URL = __ENV.BASE_URL || 'https://jsonplaceholder.typicode.com';
const PROFILE = __ENV.PROFILE || 'smoke';

const profiles = {
  smoke: {
    executor: 'constant-vus',
    vus: 5,
    duration: '30s',
  },
  full: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 500 }, 
      { duration: '5m', target: 500 }, 
      { duration: '30s', target: 0 }, 
    ],
    gracefulRampDown: '30s',
  },
};

export const options = {
  scenarios: { api_load: profiles[PROFILE] },
  thresholds: {
    http_req_failed: ['rate<0.01'], 
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
    checks: ['rate>0.99'],
    'http_req_duration{endpoint:list_posts}': ['p(95)<900'],
    'http_req_duration{endpoint:get_post}': ['p(95)<700'],
    'http_req_duration{endpoint:create_post}': ['p(95)<900'],
    business_errors: ['rate<0.01'],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

const businessErrors = new Rate('business_errors');
const createPostDuration = new Trend('create_post_duration', true);

const JSON_HEADERS = { headers: { 'Content-Type': 'application/json' } };

export default function () {
  group('Listar posts', () => {
    const res = http.get(`${BASE_URL}/posts`, { tags: { endpoint: 'list_posts' } });
    const ok = check(res, {
      'list: status 200': (r) => r.status === 200,
      'list: content-type JSON': (r) => (r.headers['Content-Type'] || '').includes('application/json'),
      'list: 100 itens': (r) => r.status === 200 && r.json().length === 100,
    });
    businessErrors.add(!ok);
  });

  group('Consultar post', () => {
    const id = Math.floor(Math.random() * 100) + 1;
    const res = http.get(`${BASE_URL}/posts/${id}`, { tags: { endpoint: 'get_post' } });
    const ok = check(res, {
      'get: status 200': (r) => r.status === 200,
      'get: id confere': (r) => r.status === 200 && r.json('id') === id,
    });
    businessErrors.add(!ok);
  });

  group('Criar post', () => {
    const payload = JSON.stringify({ title: `k6-${__VU}-${__ITER}`, body: 'carga', userId: 1 });
    const res = http.post(`${BASE_URL}/posts`, payload, {
      ...JSON_HEADERS,
      tags: { endpoint: 'create_post' },
    });
    createPostDuration.add(res.timings.duration);
    const ok = check(res, {
      'create: status 201': (r) => r.status === 201,
      'create: retorna id': (r) => r.status === 201 && r.json('id') !== undefined,
    });
    businessErrors.add(!ok);
  });

  group('Recurso inexistente (404 esperado)', () => {
    const res = http.get(`${BASE_URL}/posts/999999`, {
      tags: { endpoint: 'get_missing' },
      responseCallback: http.expectedStatuses(404), // 404 aqui é o comportamento correto
    });
    businessErrors.add(!check(res, { 'missing: status 404': (r) => r.status === 404 }));
  });

  sleep(Math.random() * 2 + 1); // think time de 1-3s
}

function htmlReport(data) {
  const m = data.metrics;
  const val = (name, key) => (m[name] && m[name].values[key] !== undefined ? m[name].values[key] : null);
  const fmt = (n) => (n === null ? '-' : Number(n).toFixed(2));
  const rows = [
    ['Requisições', val('http_reqs', 'count'), 'total'],
    ['Taxa de requisições', val('http_reqs', 'rate'), 'req/s'],
    ['Taxa de falhas', (val('http_req_failed', 'rate') || 0) * 100, '%'],
    ['Duração média', val('http_req_duration', 'avg'), 'ms'],
    ['Duração p90', val('http_req_duration', 'p(90)'), 'ms'],
    ['Duração p95', val('http_req_duration', 'p(95)'), 'ms'],
    ['Duração p99', val('http_req_duration', 'p(99)'), 'ms'],
    ['Duração máxima', val('http_req_duration', 'max'), 'ms'],
    ['VUs máximos', val('vus_max', 'max'), 'usuários'],
    ['Checks aprovados', (val('checks', 'rate') || 0) * 100, '%'],
  ];
  const thresholds = Object.entries(m).flatMap(([name, metric]) =>
    Object.entries(metric.thresholds || {}).map(([expr, t]) => [name, expr, t.ok]),
  );
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório de carga</title>
<style>body{font-family:system-ui;max-width:860px;margin:32px auto}table{border-collapse:collapse;width:100%;margin-bottom:24px}
td,th{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f4f4f4}.ok{color:#1b7f3b}.fail{color:#b00020}</style></head><body>
<h1>Relatório de carga (k6)</h1><p>Perfil: <b>${PROFILE}</b> | Alvo: <b>${BASE_URL}</b> | Gerado em ${new Date().toISOString()}</p>
<h2>Métricas</h2><table><tr><th>Métrica</th><th>Valor</th><th>Unidade</th></tr>
${rows.map(([n, v, u]) => `<tr><td>${n}</td><td>${fmt(v)}</td><td>${u}</td></tr>`).join('')}</table>
<h2>Thresholds</h2><table><tr><th>Métrica</th><th>Critério</th><th>Resultado</th></tr>
${thresholds.map(([n, e, ok]) => `<tr><td>${n}</td><td>${e}</td><td class="${ok ? 'ok' : 'fail'}">${ok ? 'APROVADO' : 'REPROVADO'}</td></tr>`).join('')}</table>
</body></html>`;
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    'reports/load/summary.json': JSON.stringify(data, null, 2),
    'reports/load/summary.html': htmlReport(data),
  };
}
