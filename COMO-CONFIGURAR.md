# Como configurar o Projecto no Claude

Passo a passo, uma vez só. Depois disto, cada conversa nova já sabe tudo.

## 1. Criar

`claude.ai/projects` → **+ New Project**.

- **Nome:** `A Eira — Portal da Aldeia de João Pires`
- **Descrição:** `Portal comunitário do concelho de Penamacor`

⚠️ O Claude **não lê** o nome nem a descrição do Projecto. Servem só para si,
na sua lista. A identidade tem de estar nas instruções — e está.

## 2. Instruções

**Set project instructions** → colar o `INSTRUCOES-DO-PROJECTO.md` inteiro →
**Save instructions**.

É a parte que o Claude lê sempre, em todas as conversas. Leva as regras
invioláveis do produto e as regras de manutenção do dossiê.

## 3. Conhecimento — carregar por esta ordem

| # | Ficheiro | Porquê primeiro |
|---|---|---|
| 1 | `LEIA-PRIMEIRO.md` | mapa e estado; é o que orienta tudo o resto |
| 2 | `00-PROJECT.md` | objectivo e âmbito |
| 3 | `decisions/ADR-001…013.md` | **os 13, um a um** |
| 4 | `01-ARCHITECTURE.md` | |
| 5 | `02-MODULES.md` `03-DATA-MODEL.md` `04-FLOWS.md` | |
| 6 | `05-ROADMAP.md` `06-RISKS.md` `07-METRICS.md` | |
| 7 | `08-CONTEUDOS.md` | |
| 8 | `CHANGELOG.md` | |
| 9 | `codigo/INSTALAR.md` | |

## 4. O que **não** carregar

| Ficheiro | Porquê não |
|---|---|
| `codigo/index.html` | **146 KB.** É o erro que mais custa: quando o conhecimento cresce, o Claude passa a ir buscar pedaços em vez de ler tudo, e este ficheiro enche a pesca de CSS e de traduções em vez das respostas que procura. Guarde-o no Git e cole só o pedaço relevante quando precisar. |
| `codigo/worker.js` | 34 KB. Mesma razão, menos grave. Carregue **só** se andar a mexer no Worker com frequência. |
| `codigo/instalar.html` `sw.js` `manifest.webmanifest` | pequenos, mas não têm nada que o Claude precise de saber para pensar no projecto |
| ícones `.png` | nenhum valor em texto |

Regra simples: **o conhecimento serve para o Claude pensar sobre o projecto,
não para guardar o projecto.** O sítio do código é o repositório.

## 5. Confirmar que ficou bem

Abra uma conversa no Projecto e faça estas três perguntas. As respostas certas
estão à direita.

| Pergunta | O que tem de responder |
|---|---|
| «O que é A Eira e para quem é?» | portal comunitário da Aldeia de João Pires, público de meia-idade e mais velho com informática básica |
| «Porque é que a carta é sempre em português?» | ADR-006 — a Câmara trabalha em português; o objectivo é o munícipe ser atendido |
| «Qual é o risco mais alto e quanto vale?» | R-01, mantenedor único, score 20 |

Se falhar alguma, faltou carregar um ficheiro.

## 6. Manter vivo

- Ao fim de cada sessão que mude alguma coisa, peça: **«que ficheiros do
  conhecimento tenho de substituir?»** — as instruções já mandam responder.
- Substituir = apagar o antigo e carregar o novo. Não deixe duas versões do
  mesmo ficheiro: o Claude vai ler as duas e contradizer-se.
- Uma vez por mês, ou depois de várias alterações, corra **`/sync`** para
  reconciliar os ficheiros e apanhar contradições.
- Antes de mudanças grandes, **`/diagnose`**.

## 7. O que fica de fora do Projecto, e onde

| Coisa | Onde vive |
|---|---|
| Código | repositório Git (a montar) |
| Chaves de API e chave de gestão | Cloudflare, como Secret. **Nunca num ficheiro do Projecto.** |
| Avisos e sugestões dos munícipes | Cloudflare KV |
| Eventos | Google Calendar público |
| Factos sobre si (preferências, contexto pessoal) | a memória do Claude, que já o acompanha entre conversas e é independente do Projecto |

⚠️ **Nunca ponha a `CHAVE_ADMIN` nem a chave da API em nenhum ficheiro do
dossiê.** O conhecimento do Projecto não é um cofre.

## 8. Se o conhecimento encher

Nos planos pagos, ao aproximar-se do limite o Claude passa a ir buscar só os
pedaços relevantes. É por isso que cada ficheiro do dossiê começa com duas
linhas a dizer a que projecto pertence — um pedaço solto continua a
identificar-se. Se mesmo assim encher: tire o `08-CONTEUDOS.md` (é o maior e o
menos usado no raciocínio) e junte os ADRs antigos num ficheiro só.
