# We Do IT — Testes de Performance (k6)

Projeto **independente** de teste de carga com [k6](https://grafana.com/docs/k6/latest/). Separado da suíte funcional (API/E2E) para ter ciclo de execução, pipeline e infraestrutura próprios — carga pesada não deve competir com testes funcionais por recursos nem rodar a cada commit.

## O que o teste faz

Cada usuário virtual executa, em loop, com *think time* de 1–3 s:

1. `GET /posts` — listagem (valida 200, JSON, 100 itens)
2. `GET /posts/{id}` — consulta com ID aleatório (valida id retornado)
3. `POST /posts` — criação (valida 201 e id)
4. `GET /posts/999999` — recurso inexistente (404 é o resultado **esperado**, não conta como falha)

**Perfis**

| Perfil | Carga | Uso |
|---|---|---|
| `smoke` | 5 VUs por 30 s | sanidade / PRs |
| `full` | sobe a 500 VUs em 1 min, **mantém 500 VUs por 5 min**, desce em 30 s | requisito do desafio |

**Thresholds (critérios de aprovação)**: falhas < 1%; p95 < 800 ms; p99 < 1500 ms; checks > 99%; erros de negócio < 1%; p95 por endpoint (list 900 ms, get 700 ms, create 900 ms). Se qualquer um falhar, o k6 sai com código ≠ 0 e o pipeline reprova.

## Estrutura

```
.
├── k6/load-test.js                      # script, perfis, thresholds, handleSummary (JSON + HTML)
├── scripts/summary.js                   # resumo em Markdown (Job Summary do CI; --strict reprova)
├── docs/load-test-analysis.md           # modelo de análise dos resultados
├── .github/workflows/performance.yml    # pipeline próprio
├── package.json                         # atalhos npm (não há dependências Node)
├── .env.example · .gitignore
└── reports/                             # saída: load/summary.html e summary.json
```

## Versões e dependências

| Item | Versão |
|---|---|
| k6 | ≥ 1.0 |
| Node.js | ≥ 20 (apenas para `scripts/summary.js`; opcional) |

Não há `npm install`. Instale o k6: <https://grafana.com/docs/k6/latest/set-up/install-k6/> (macOS `brew install k6`, Windows `choco install k6`, Linux ver documentação). O script importa `textSummary` de `jslib.k6.io`, então a máquina precisa de acesso à internet na execução.

## Como executar e gerar o relatório

```bash
mkdir -p reports/load                 # o k6 grava aqui

npm run test:smoke                    # ou: k6 run -e PROFILE=smoke k6/load-test.js
K6_BASE_URL=http://localhost:3000 npm run test:load  # full exige alvo explícito controlado

# alvo diferente:
k6 run -e PROFILE=full -e BASE_URL=http://localhost:3000 k6/load-test.js

npm run summary                       # resumo em Markdown no terminal
```

**Relatórios gerados:** `reports/load/summary.html` (métricas e thresholds aprovados/reprovados), `reports/load/summary.json` (dados completos) e o resumo textual no terminal. Depois, preencha a análise em `docs/load-test-analysis.md`.

> ⚠️ **Proteção:** `full` exige `BASE_URL` explícita e bloqueia `jsonplaceholder.typicode.com`; não há fallback público. O agendamento semanal executa apenas `smoke`. Para executar carga completa, use um serviço de teste próprio ou outro ambiente autorizado e confirme que ele suporta os endpoints `/posts` e os comportamentos esperados pelo script.

## CI/CD

`.github/workflows/performance.yml`:
- push/PR → `smoke`;
- agendado (segundas, 06:00 UTC) → `smoke`;
- manual (*Run workflow*) → escolha o perfil. Para `full`, informe uma URL controlada/autorizada; `jsonplaceholder.typicode.com` é bloqueado.

Variável opcional do repositório: `K6_BASE_URL`. Artefato publicado: `load-report` (30 dias) + resumo no Job Summary.

## Limitações

O script e o pipeline não foram executados aqui (sem acesso a rede/k6 no meu ambiente); a análise em `docs/` é um modelo a preencher com a sua execução. Se o k6 reclamar de algum threshold ou de um check, ajuste os limites em `options.thresholds` conforme a capacidade do seu alvo.
