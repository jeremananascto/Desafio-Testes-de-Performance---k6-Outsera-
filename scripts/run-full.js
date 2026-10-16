// Exige alvo explícito e controlado antes de iniciar o perfil de 500 VUs.
const { spawnSync } = require('node:child_process');
const baseUrl = process.env.K6_BASE_URL;
if (!baseUrl) {
  console.error('Defina K6_BASE_URL para um ambiente controlado/autorizado. O perfil full não usa destino público como fallback.');
  process.exit(1);
}
if (baseUrl.toLowerCase().includes('jsonplaceholder.typicode.com')) {
  console.error('Destino bloqueado para full: jsonplaceholder.typicode.com.');
  process.exit(1);
}
const result = spawnSync('k6', ['run', '-e', 'PROFILE=full', '-e', `BASE_URL=${baseUrl}`, 'k6/load-test.js'], { stdio: 'inherit', shell: process.platform === 'win32' });
process.exit(result.status ?? 1);
