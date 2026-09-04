> **A Eira** · portal do concelho de Penamacor.
> Ficheiro `07-METRICS.md` — métricas K-01 a K-08.
> Decisões em `decisions/ADR-*.md`. Mapa em `LEIA-PRIMEIRO.md`.

# 07 — Métricas

⚠ Sem instrumentação, todas as métricas abaixo são `[L]`. Ver decisão em
aberto no fim.

| ID | Métrica | Baseline | Alvo | Prazo | Como se mede |
|---|---|---|---|---|---|
| K-01 | Pessoas distintas por semana | 0 | 40 | 6 meses | `[L]` sem instrumentação |
| K-02 | Cartas geradas por mês | 0 | 8 | 6 meses | contagem no Worker (rota `/carta`) — por implementar |
| K-03 | Avisos publicados por semana | 0 | ≥2 | contínuo | contagem de chaves `aviso:` no KV |
| K-04 | Pessoas com permissão de publicar (calendário + gestão) | 1 | ≥3 | 3 meses | manual — mitiga R-01 |
| K-05 | Eventos vindos do Google Calendar por mês | 0 | ≥4 | 3 meses | contagem em `/agenda` por fonte |
| K-06 | Instalações no ecrã principal | 0 | 25 | 6 meses | `[L]` sem instrumentação |
| K-07 | Sugestões recebidas por mês | 0 | ≥3 | contínuo | contagem `sug:` no KV |
| K-08 | Dias sem avisos novos (saúde do projecto) | — | <7 | contínuo | data do último `aviso:` |

## As que já se medem sem fazer nada

K-03, K-04, K-05, K-07 e K-08 lêem-se do KV e da rota `/agenda`. **Não exigem
analytics nem consentimento de cookies.** K-08 é o melhor indicador isolado de
que o projecto está vivo.

## Decisão em aberto — `[L]` de maior impacto

K-01, K-02 e K-06 precisam de instrumentação. Opções:

| Opção | Custo | Privacidade | Nota |
|---|---|---|---|
| Nenhuma | 0 | perfeita | não se sabe se está a ser usado (agrava R-04) |
| Contadores agregados no Worker | baixo | boa: só totais, sem IP nem identificadores | recomendada `[A]` |
| Analytics de terceiros | baixo | má: contradiz a postura do projecto | desaconselhada |

Recomendação `[A]`: contadores agregados por dia no KV, sem identificar
ninguém — `contador:2026-09-15:carta = 3`. Chega para saber se o portal vive,
sem trair o princípio de não vigiar quem o usa. Abrir ADR-013.
