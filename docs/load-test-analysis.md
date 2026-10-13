# Análise do teste de carga

> Preencha após executar `npm run test:load` (perfil `full`: 500 VUs mantidos por 5 min). Os dados vêm de `reports/load/summary.html`.

## Configuração da execução
| Item | Valor |
|---|---|
| Data / responsável | |
| Alvo (`BASE_URL`) | |
| Perfil | full (rampa 1 min → 500 VUs por 5 min → descida 30 s) |
| Ambiente do gerador de carga | (CPU/RAM/rede da máquina ou runner) |

## Resultados
| Métrica | Valor | Threshold | Status |
|---|---|---|---|
| Requisições totais / req/s | | — | |
| Taxa de falhas (`http_req_failed`) | | < 1% | |
| Latência p95 (`http_req_duration`) | | < 800 ms | |
| Latência p99 | | < 1500 ms | |
| Checks aprovados | | > 99% | |
| Erros de negócio (`business_errors`) | | < 1% | |
| p95 por endpoint (list / get / create) | | 900 / 700 / 900 ms | |

## Como interpretar
- **Latência crescendo junto com os VUs** durante a rampa → saturação progressiva (CPU, pool de conexões, banco). Anote em que nº de VUs o p95 cruzou o limite.
- **Platô estável de latência, mas erros 429/5xx** → rate limiting ou limite de capacidade; veja `http_req_failed` por tag `endpoint`.
- **p99 muito acima do p95** → cauda longa (GC, locks, cold start, fila). Investigar com APM.
- **`http_req_waiting` alto vs `http_req_connecting`/`tls_handshaking`** → gargalo no servidor vs. na rede/TLS.
- **Gerador saturado** (CPU do k6 > 80%, `dropped_iterations` > 0) → o resultado mede a máquina de teste, não a API; refaça com mais recursos ou execução distribuída.

## Potenciais gargalos identificados
1. 
2. 

## Conclusão e recomendações
- 
