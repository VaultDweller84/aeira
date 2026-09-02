> **A Eira** · portal da Aldeia de João Pires, concelho de Penamacor.
> Ficheiro `CHANGELOG.md` — histórico de alterações por versão.
> Decisões em `decisions/ADR-*.md`. Mapa em `LEIA-PRIMEIRO.md`.

# CHANGELOG

Formato: data · o que mudou · porquê · IDs afectados.

## 2026-09-02 — v0.13 · Ver antes de a aldeia ver

Sem alterações ao produto. Muda a forma de publicar desenho. **`D-018`**.

**Ramo `desenho`**, permanente, publicado pelo Cloudflare em
`https://desenho.a-eira.pages.dev` e autorizado no `ORIGENS` do Worker.
Alterações ao `codigo/` passam por lá, vêem-se no telemóvel, e só depois vão ao
`main`. Alterações só a `.md` continuam a ir directas.

**Um artefacto de pré-visualização foi considerado e rejeitado:** essas páginas
não podem chamar servidores de fora, e o portal vai buscar tudo ao Worker —
ver-se-ia a casca sem notícias, sem agenda e sem carta, que é onde o desenho
mais se nota. E aprovava-se uma adaptação do ficheiro, não o ficheiro.

**É a mitigação que faltava ao R-17**, e estreou-se no mesmo dia: a linguagem
visual da v0.12 foi vista em pré-visualização antes de ir para o ar.

## 2026-09-02 — v0.12 · Desenho

O portal funcionava e parecia barato. Cinco mudanças de acabamento, nenhuma de
estrutura, conteúdo ou comportamento. **`D-017`**.

**A letra passa a ser a do telemóvel** — `system-ui`: SF no iPhone, Roboto no
Android, Segoe UI no Windows. A Verdana era o sinal mais forte de página
antiga. Sem letra descarregada: seria um pedido de rede a mais, contra o
ADR-007.

**Os ícones da navegação deixam de ser emoji.** Doze SVG escritos dentro do
próprio ficheiro, monocromáticos, a herdar a cor do tema. Os emoji mudavam de
desenho conforme o telemóvel e ficavam coloridos mesmo no tema de alto
contraste. O separador activo passa a ter uma pastilha atrás do ícone em vez do
botão todo pintado.

**Linha fina e sombra ténue** em vez de moldura de 2 px, em cartões, avisos,
notícias, eventos, telefones e campos. Cantos maiores e mais espaço por dentro.

**Menos cor a competir.** Os blocos de mês deixam o verde e passam a maiúsculas
pequenas; os títulos de secção trocam o sublinhado grosso por uma barra curta
da cor da marca.

**O tema de alto contraste mantém tudo grosso e sem sombra**, em regras
próprias. Quem o usa precisa de limites visíveis.

Medido outra vez, porque a letra mudou e com ela todas as larguras: em 320 e
375 px, nos três tamanhos de letra, sem nada cortado na barra e sem a página
andar para o lado. `R-17`.

`sw.js` → **v5**.

**Por fazer:** junção dos separadores Notícias + Agenda, que mexe na navegação
e no ADR-012 e abre ADR próprio.

## 2026-09-02 — v0.11 · O portal aguenta a letra grande

Três avarias de desenho, encontradas a medir o portal publicado num ecrã de
telemóvel nos três tamanhos de letra. Nenhuma dava erro; todas atingiam
exactamente quem aumenta a letra por não ver bem.

**A página andava para o lado.** No tamanho maior, o conteúdo ficava mais largo
do que o ecrã: Notícias 496 px, Telefones 483, Agenda 432, contra 375 do ecrã.
A culpa era de palavras que não partem — sobretudo emails como
`cspenamacor@ulscb.min-saude.pt`. Uma linha resolve: `overflow-wrap:break-word`
no `body`. `M-01`, **`R-17`**.

**Os nomes na barra de baixo saíam cortados.** Seis botões a 63 px com
`overflow:hidden`: no tamanho médio perdia-se o «Números», no maior o
«Notícias», «Agenda», «Números» e «Sugerir». O nome do separador passou a ter
um tecto de crescimento (`clamp`) e deixou de ser cortado. `M-01.7`, `R-17`.

**O cabeçalho comia o primeiro ecrã** — 37% no tamanho normal, 60% no maior. No
telemóvel, o título e o subtítulo passam a crescer menos do que o texto que se
lê, e a língua e as opções ficam na mesma linha. Passou a 21% e 26%. O rótulo
«Língua» saiu: os botões dizem «Português» e «English». `M-01.7`, `R-17`.

**Princípio que fica escrito:** o botão de letra grande existe para o texto que
se lê crescer, não a mobília. Cabeçalho, barra e botões crescem menos.

`sw.js` → **v4**.

**Risco novo:** R-17, regressão silenciosa de desenho com a letra grande. O
`06-RISKS.md` passa a ter as três medidas a verificar antes de publicar, com os
números de antes e depois.

**Por decidir:** modernização visual (letra de sistema, ícones desenhados,
menos molduras) e junção dos separadores Notícias + Agenda. Ficou acordado o
princípio; falta o ADR e o trabalho.

## 2026-09-02 — v0.10 · **Repositório e publicação automática**

O código deixou de viver num disco só. É a primeira mitigação técnica do R-01
desde que o projecto começou.

**Repositório.** `github.com/VaultDweller84/aeira`, público. Antes de subir,
verificou-se ficheiro a ficheiro que não há uma única chave, palavra-passe ou
endereço de gestão em nenhum ficheiro: os `A-SUA-CHAVE` do `INSTALAR.md` são
marcadores e o `worker.js` lê tudo de `env`. Sem isso a decisão teria sido
repositório privado. **`D-015`**, `R-01`.

**Estrutura.** `worker.js` saiu de `codigo/` para `worker/`, e o `INSTALAR.md`
e o `LEIA-ME.md` saíram de `codigo/` para a raiz. O Pages publica a pasta
`codigo/` tal e qual, e não havia motivo para servir o Worker e as instruções
de configuração a quem escrevesse o endereço. `publicar/` ficou fora do
repositório. `D-015`.

**Site novo.** Projecto Pages `a-eira` → `https://a-eira.pages.dev`, ligado ao
ramo `main`, sem comando de construção, pasta de saída `codigo`. Teve de ser
um projecto **novo**: a Cloudflare não converte um projecto de upload directo
em projecto ligado ao Git. Criou-se ao lado, confirmou-se, e só depois se
apagou o antigo — o portal nunca esteve em baixo. `D-014`, `D-015`.

O nome `aeira` não estava disponível: `aeira.pages.dev` pertence a outra
pessoa, com conteúdo ofensivo. Verificado antes de criar seja o que for.

**Verificado em produção**, do lado de fora: `a-eira.pages.dev` serve o portal
e o `instalar.html`; as notícias trazem 12 itens do Município e a agenda mostra
as romarias fixas e os eventos da Câmara pela ordem certa. Como ambas vêm do
Worker, isto prova que o `ORIGENS` ficou bem.

**`ORIGENS`.** Passou a `https://a-eira.pages.dev`, e o endereço antigo saiu
quando o `aeira-portal` foi apagado. `R-14`.

**Convenção de commits**, fixada no `README.md`: `área: o que mudou`, linha em
branco, o porquê, IDs no fim. Duas regras não são de estilo — mexer em
`codigo/` obriga a mudar a `VERSAO` no `sw.js` no mesmo commit, e mudar o
produto obriga a mexer neste ficheiro no mesmo commit. `R-08`, `D-015`.

**Domínio decidido:** `aeira.pt`, por comprar. O `aldeia.pt` foi verificado e
rejeitado: está à venda por 2 800 USD e, mesmo de graça, contraria o ADR-013 —
um domínio genérico promete um serviço nacional de aldeias e apaga a
identidade que o nome «A Eira» carrega. **`D-016`**.

**Riscos novos:** R-15 (Cloudflare Pages em fim de vida — a Cloudflare empurra
os estáticos para os Workers) e R-16 (`worker.js` do repositório diferente do
que está a correr, porque o Worker continua a ser actualizado à mão).
O R-08 desceu de 8 para 6 e o R-01 mantém o score mas perdeu a metade técnica.

**Documentação:** `README.md` novo (porta de entrada do repositório, com a
convenção de commits), `.gitignore` novo. Actualizados `01-ARCHITECTURE.md`,
`05-ROADMAP.md`, `06-RISKS.md` e `LEIA-PRIMEIRO.md`.

**Por fazer:** comprar o `aeira.pt` (T-17), o calendário Google (T-03), o teste
real em telemóvel (T-06). O `INSTALAR.md` ainda descreve a publicação por
upload manual e precisa de uma revisão numa próxima sessão.

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
