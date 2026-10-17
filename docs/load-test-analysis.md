# Análise do teste de carga

## 1. Configuração

| Item | Valor |
|---|---|
| Data | 16/10/2026 |
| Alvo | `http://127.0.0.1:3000` |
| Ambiente | API mock Node.js local |
| Perfil | Full — até 500 VUs |
| Duração da carga | Aproximadamente 6 min 30 s |
| Gerador | k6 executado localmente no Windows |
| Evidências | `reports/load/summary.html` e `reports/load/summary.json` |
| Métricas temporais | `metrics.ndjson` não disponível nesta execução |

## 2. Resultados medidos

| Métrica | Resultado | Limite | Status |
|---|---:|---:|---|
| Requisições HTTP | 345.768 | — | Informativo |
| Throughput médio | 881,40 req/s | — | Informativo |
| Falhas HTTP | 0% | < 1% | Passou |
| Latência p95 | 0,603 ms | < 800 ms | Passou |
| Latência p99 | 1,071 ms | < 1.500 ms | Passou |
| Checks | 100% (691.536/691.536) | > 99% | Passou |
| Erros de negócio | 0% | < 1% | Passou |
| p95 — listar posts | 0,594 ms | < 900 ms | Passou |
| p95 — consultar post | 0,636 ms | < 700 ms | Passou |
| p95 — criar post | 0,637 ms | < 900 ms | Passou |
| Pico de VUs | 500 | 500 | Passou |
| Iterações descartadas | Não confirmado | 0 desejável | Pendente |

## 3. Análise

O teste atingiu 500 usuários virtuais e concluiu 86.442 iterações. Foram realizadas 345.768 requisições HTTP, sem falhas HTTP, e todos os checks passaram.

Não foi possível analisar a evolução das métricas por intervalo porque o arquivo `metrics.ndjson` não estava disponível para essa execução.

O teste foi executado contra uma API mock na própria máquina. Portanto, os resultados validam o cenário local e não comprovam a capacidade de uma aplicação em produção.

## 4. Gargalos e limitações

Não foi identificado um gargalo específico com base nos dados agregados disponíveis.

Não há dados suficientes para concluir se o computador gerador de carga atingiu limites de CPU, memória ou rede.

## 5. Conclusão e próximos passos

Os thresholds configurados para falhas HTTP, latência, checks e erros de negócio passaram no ambiente local.

Próximas ações:

1. Gerar `metrics.ndjson` em uma nova execução controlada.
2. Verificar iterações descartadas e analisar a evolução temporal das métricas.
3. Registrar CPU e memória do gerador durante a execução.
4. Se houver necessidade de avaliar capacidade de produção, repetir o teste em ambiente representativo e autorizado.

Os resultados não devem ser extrapolados para produção, pois o alvo foi uma API mock local.

## Evidências adicionais: smoke test local

Em 16/10/2026, foi executado um smoke test contra a API mock local (`http://127.0.0.1:3000`), com 5 usuários virtuais durante 30 segundos.

| Métrica | Resultado |
|---|---:|
| Requisições HTTP | 316 |
| Throughput médio | 9,77 req/s |
| Falhas HTTP | 0% |
| Latência p95 | 1,03 ms |
| Latência p99 | 3,16 ms |
| Checks aprovados | 632/632 (100%) |
| VUs máximos | 5 |

Os resultados históricos da carga completa estão documentados separadamente. Os arquivos atualmente presentes em `reports/archive/full-500vus-20261016/` registram uma execução com apenas 5 VUs e não comprovam a execução de 500 VUs.

Os resultados do smoke test e da carga completa devem ser analisados separadamente, pois representam perfis e execuções diferentes.
