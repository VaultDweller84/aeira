> **A Eira** · portal da Aldeia de João Pires, concelho de Penamacor.
> Ficheiro `CHANGELOG.md` — histórico de alterações por versão.
> Decisões em `decisions/ADR-*.md`. Mapa em `LEIA-PRIMEIRO.md`.

# CHANGELOG

Formato: data · o que mudou · porquê · IDs afectados.

## 2026-09-01 — v0.9 · **No ar**

O portal deixou de ser um ficheiro no disco. Fase 1 do roadmap fechada,
excepto o calendário (T-03) e o teste real em telemóvel (T-06).

**Publicado.** Site em `https://aeira-portal.pages.dev` (Cloudflare Pages,
upload directo) e Worker em `https://aeira.hugompalmeida.workers.dev`, com o
KV `aeira-sugestoes` ligado como `SUGESTOES`. Variáveis definidas: `ORIGENS`,
`FORNECEDOR`, `ROBO_CAMARA`, e os segredos `API_KEY` e `CHAVE_ADMIN`.
`T-01`, `T-02`, `T-04`, `T-05`, **`D-014`**.

**Verificado em produção:** `/noticias` devolve 12 notícias do Município,
`/agenda` devolve 5 eventos, e a carta é gerada de ponta a ponta em ~10 s,
completa e com a estrutura certa.

**`worker.js` — modelo de IA.** `gemini-2.0-flash` (desligado pela Google) →
`gemini-3.5-flash`. O `gemini-2.5-flash` foi tentado pelo meio e recusado com
404 apesar de constar na lista da chave: a Google reserva os modelos 2.5 a
quem já os usava. Ver `06-RISKS.md`, R-13. `M-02.1`, `R-13`.

**`worker.js` — carta truncada.** `maxOutputTokens` 900 → 3000 e
`thinkingConfig.thinkingBudget: 0`. Os modelos novos gastam o orçamento de
saída a «pensar» antes de escrever, e a carta saía cortada a meio de uma
frase — pior do que um erro, porque seria enviada assim. A espera baixou de
~14 s para ~10 s. `M-02.1`.

**`worker.js` — segunda tentativa.** Se o fornecedor recusar o
`thinkingConfig` com 400, o Worker repete o pedido sem esse campo. Uma
afinação de velocidade não pode ser motivo para ninguém ficar sem carta.
Extensão do princípio do ADR-007 ao interior da chamada. `M-02.1`, `D-007`.

**`instalar.html` — botão da APK escondido.** Apontava para `app/a-eira.apk`,
que não existe e não vai existir antes da T-12. Quem lá carregasse apanhava
uma página de erro — precisamente o utilizador menos capaz de perceber
porquê. A secção fica comentada, com instruções no sítio para a repor.
`M-03`, `T-12`.

**`index.html` — `CONFIG.API`** preenchido com o endereço do Worker. É a
única alteração ao portal prevista no `INSTALAR.md`. `M-01`.

**Riscos novos:** R-13 (modelo de IA desligado ou restringido) e R-14
(desalinhamento entre `CONFIG.API` e `ORIGENS`).

**Por fazer, e assumido:** não há repositório Git. O código vive num disco
só. É a mitigação por fazer mais óbvia do R-01.

## 2026-09-01 — v0.8 · Dossiê preparado para o Projecto Claude
Cada ficheiro passa a começar por duas linhas de auto-identificação, para
continuar a fazer sentido quando o Claude lê pedaços em vez de ficheiros
inteiros. Novos: `LEIA-PRIMEIRO.md` (mapa e estado) e `COMO-CONFIGURAR.md`
(procedimento). Instruções do Projecto ganham as regras de manutenção.
Sem alterações ao produto.

## 2026-09-01 — v0.7 · Nome
O portal passa a chamar-se **A Eira**, com subtítulo «Aldeia de João Pires ·
concelho de Penamacor». Âmbito fixado: identidade da aldeia, conteúdo aberto
ao concelho. Rodapé passa a declarar que não é site oficial.
`D-013`. `sw.js` → v3. Ficheiro da APK renomeado para `a-eira.apk`.

## 2026-09-01 — v0.6 · Notícias e avisos
Sexto separador, que passa a ser o inicial. Avisos da terra em KV com validade
automática; notícias da Câmara por scraping, sem resumo por IA; ligações à
imprensa regional. Página de gestão passa a publicar avisos.
`M-01.4`, `M-02.3`, `M-02.5`, `E-02`, `E-03`, `F-03`, `F-06`, `D-009`, `D-012`.
`sw.js` → v2.

## 2026-09-01 — v0.5 · Agenda, sugestões e aplicação instalável
Festas passam a agenda cultural com detalhe, mapa, `.ics` e Google Agenda.
Quinto separador de sugestões com armazenamento em KV e página de gestão.
PWA: manifesto, service worker, ícones, `instalar.html`.
`M-01.3`, `M-01.5`, `M-02.2`, `M-02.4`, `M-03`, `E-01`, `E-04`, `D-008`, `D-010`.
Regressão corrigida: painel recolhível de letra e cores, perdido na
reconstrução da v0.4.

## 2026-09-01 — v0.4 · Assistente de escrita
Botão de gerar carta passa a chamar um Cloudflare Worker próprio. Dados
pessoais nunca saem do dispositivo. Degradação para modelo escrito à mão.
`M-01.1`, `M-02.1`, `E-05`, `D-004`, `D-005`, `D-007`.

## 2026-09-01 — v0.3 · Mobile first, temas, mapas
CSS reescrito para telemóvel como caso base; barra inferior. Três temas por
variáveis CSS. Regra dos nomes próprios não traduzidos. Ligações de mapa.
`M-01.7`, `D-002`, `D-003`.

## 2026-09-01 — v0.2 · Bilingue
Português de Portugal e inglês do Reino Unido num só ficheiro.
`M-01.7`, `D-002`, `D-006`.

## 2026-09-01 — v0.1 · Primeira versão
Gerador de cartas por modelo, guia de 25 fichas, romarias, telefones.
Investigação de contactos, prazos e romarias — ver `08-CONTEUDOS.md`.
`M-01.1`, `M-01.2`, `M-01.6`, `D-001`.
