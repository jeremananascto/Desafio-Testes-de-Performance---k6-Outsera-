# Análise do teste de carga

> Preencher somente após executar o perfil `full` contra um ambiente controlado e autorizado. Não registrar valores estimados como resultados medidos. Anexar/guardar `summary.html`, `summary.json` e `metrics.ndjson` da mesma execução.

## Configuração da execução
| Item | Valor |
|---|---|
| Data / responsável | PREENCHER |
| Alvo (`BASE_URL`) | PREENCHER (ambiente controlado/autorizado) |
| Perfil | full — rampa 1 min → 500 VUs por 5 min → descida 30 s |
| Versão/commit | PREENCHER |
| Ambiente do gerador de carga | PREENCHER (runner/máquina, CPU, RAM e rede) |
| Evidências | `reports/load/summary.html`, `summary.json`, `metrics.ndjson` |

## Resultados medidos
| Métrica | Valor medido | Threshold | Status |
|---|---:|---:|---|
| Requisições totais | PREENCHER | — | PREENCHER |
| Throughput (`http_reqs`/s) | PREENCHER req/s | — | PREENCHER |
| Taxa de falhas (`http_req_failed`) | PREENCHER % | < 1% | PREENCHER |
| Latência p95 (`http_req_duration`) | PREENCHER ms | < 800 ms | PREENCHER |
| Latência p99 | PREENCHER ms | < 1500 ms | PREENCHER |
| Checks aprovados | PREENCHER % | > 99% | PREENCHER |
| Erros de negócio (`business_errors`) | PREENCHER % | < 1% | PREENCHER |
| p95 por endpoint (list / get / create) | PREENCHER ms | 900 / 700 / 900 ms | PREENCHER |
| VUs máximos efetivamente atingidos | PREENCHER | 500 | PREENCHER |
| Iterações descartadas (`dropped_iterations`) | PREENCHER | 0 desejável | PREENCHER |

## Comportamento durante a rampa
Use `metrics.ndjson` e o resumo para descrever a tendência em intervalos de tempo:
- **0–1 min (rampa de subida):** registrar a evolução de latência, throughput e erros; indicar quando o p95 ultrapassou algum limite.
- **1–6 min (platô de 500 VUs):** dizer se latência/throughput estabilizaram, continuaram piorando ou se houve erros/timeouts.
- **6–6,5 min (rampa de descida):** verificar se a latência e a taxa de erros recuperaram após reduzir a carga.
- Registrar se o gerador de carga ficou saturado. Sem métricas de CPU/RAM do runner, não concluir que o gerador estava saudável apenas com base nas métricas HTTP.

## Potenciais gargalos identificados
1. PREENCHER com evidência observada (métrica, endpoint e intervalo).
2. PREENCHER com evidência observada (métrica, endpoint e intervalo).

## Conclusão e recomendações
PREENCHER: informar se os thresholds passaram, qual foi a carga efetivamente sustentada, limitações do teste e próximos passos. Não atribuir gargalos a CPU, banco ou rede sem evidência que sustente a hipótese.

## Interpretação de referência
- Latência crescendo junto com os VUs pode indicar saturação progressiva (CPU, pool de conexões, banco ou dependências).
- Latência estável com erros 429/5xx pode indicar rate limiting ou limite de capacidade.
- p99 muito acima do p95 sugere cauda longa, que pode estar associada a filas, pausas de GC, locks ou cold starts.
- `http_req_waiting` alto em relação a `http_req_connecting`/`tls_handshaking` pode apontar para tempo de processamento no servidor, mas requer confirmação no ambiente.
- `dropped_iterations` ou saturação de CPU do gerador pode invalidar a leitura da capacidade do alvo; repetir com mais recursos ou execução distribuída.
