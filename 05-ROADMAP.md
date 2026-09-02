> **A Eira** · portal da Aldeia de João Pires, concelho de Penamacor.
> Ficheiro `05-ROADMAP.md` — tarefas T-01 a T-16 priorizadas por RICE.
> Decisões em `decisions/ADR-*.md`. Mapa em `LEIA-PRIMEIRO.md`.

# 05 — Roadmap

Prioridade por RICE: `(Alcance × Impacto × Confiança) ÷ Esforço`.
Alcance = pessoas afectadas por mês. Impacto 0,25–3. Confiança 0–1.
Esforço em horas-pessoa.

## Fase 1 — Pôr no ar (agora)

| ID | Tarefa | R | I | C | E | RICE | Dono |
|---|---|---|---|---|---|---|---|
| T-01 | Escolher alojamento HTTPS e publicar os ficheiros | 200 | 3 | 1,0 | 2 | **300** | Hugo |
| T-02 | Publicar o Worker e definir as variáveis | 200 | 3 | 0,9 | 1,5 | **360** | Hugo |
| T-03 | Criar o Google Calendar público e ligar `CALENDARIO_ICS` | 150 | 2 | 0,9 | 0,5 | **540** | Hugo |
| T-04 | Criar o KV, ligar `SUGESTOES`, definir `CHAVE_ADMIN` | 200 | 2 | 1,0 | 0,5 | **800** | Hugo |
| T-05 | Chave do fornecedor de IA (Gemini ou Groq) | 100 | 2 | 0,9 | 0,5 | **360** | Hugo |
| T-06 | Testar com uma queixa real do grupo de Facebook | 200 | 3 | 0,8 | 1 | **480** | Hugo |

**Critério de aceitação da Fase 1:** um telemóvel de terceiro abre o portal
pelo domínio, instala-o no ecrã principal, gera uma carta com o assistente,
vê um aviso publicado nos 10 minutos anteriores, e tudo isto sem instruções.

## Fase 2 — Não morrer (primeiro mês) — **a fase que decide o projecto**

| ID | Tarefa | R | I | C | E | RICE | Dono |
|---|---|---|---|---|---|---|---|
| T-07 | Recrutar 2-3 co-editores: acesso ao calendário e chave de gestão | 200 | 3 | 0,7 | 4 | **105** | Hugo |
| T-08 | Publicar 3 avisos por semana nas primeiras 4 semanas | 200 | 3 | 0,9 | 3 | **180** | Hugo |
| T-09 | Anunciar no grupo de Facebook, com o botão de línguas explicado | 300 | 2 | 0,9 | 0,5 | **1080** | Hugo |
| T-10 | Levar o portal à Junta à quarta-feira, mostrar a quem lá estiver | 40 | 3 | 0,8 | 2 | **48** | Hugo |
| T-11 | Contadores agregados no Worker (ADR-013, por abrir) | 200 | 1 | 0,7 | 2 | **70** | Hugo |

**Critério de aceitação da Fase 2:** K-04 ≥ 3 pessoas com permissão de
publicar, e K-08 (dias sem avisos) nunca acima de 7.

## Fase 3 — Consolidar (2-6 meses)

| ID | Tarefa | R | I | C | E | RICE |
|---|---|---|---|---|---|---|
| T-12 | Gerar e publicar a APK (PWABuilder) | 30 | 1 | 0,8 | 2 | **12** |
| T-13 | Rever o prazo da limpeza de terrenos (todos os Março) | 150 | 2 | 1,0 | 0,25 | **1200** |
| T-14 | Verificar trimestralmente se o robô da Câmara ainda traz itens | 200 | 2 | 1,0 | 0,25 | **1600** |
| T-15 | Política de retenção: apagar sugestões tratadas | 20 | 2 | 1,0 | 0,5 | **80** |
| T-16 | Alargar o guia com o que aparecer nas sugestões | 100 | 2 | 0,6 | 4 | **30** |

## Ordem de execução recomendada

T-04 → T-02 → T-05 → T-03 → T-01 → T-06 → **T-09** → T-08 → T-07 → T-13/T-14
(rotinas) → T-11 → T-16 → T-12.

T-12 (APK) fica deliberadamente no fim: RICE mais baixo de toda a lista e é a
tarefa com risco associado (R-11).

## Sugestões (não implementadas)

| Ideia | Benefício | Custo | Risco de não fazer |
|---|---|---|---|
| Lembrar língua e tema com `localStorage` | menos atrito em cada visita | 1 h | baixo — contraria ADR-011, exige ADR novo |
| Notificações push de avisos urgentes | corte de água chega a quem não abriu | 6 h | médio — mas pede permissões e mina a simplicidade |
| Página pública de estatísticas do portal | transparência, mostra que está vivo | 3 h | baixo |
| Arquivo de avisos passados | memória da terra | 2 h | baixo |
| Fotografias da aldeia enviadas pelos moradores | pertença, retorno de visitas | 8 h | médio — implica moderação e direitos de imagem |
