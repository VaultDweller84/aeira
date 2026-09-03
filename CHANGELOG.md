> **A Eira** · portal da Aldeia de João Pires, concelho de Penamacor.
> Ficheiro `CHANGELOG.md` — histórico de alterações por versão.
> Decisões em `decisions/ADR-*.md`. Mapa em `LEIA-PRIMEIRO.md`.

# CHANGELOG

Formato: data · o que mudou · porquê · IDs afectados.

## 2026-09-03 — v0.16 · As regras passam a ter quem as verifique

Sem alterações ao produto. **`D-020`**.

**Porquê.** A v0.14 foi para o `worker.js` do repositório e a documentação
ficou na v0.13 — descoberto por acaso, três sessões depois de a regra ter sido
escrita. Ser o primeiro ficheiro a ser lido garante que a regra é conhecida,
não que seja cumprida. O `LEIA-PRIMEIRO.md` não tinha gate nenhum.

**Dois ficheiros novos:** `.github/verificar-coerencia.sh` e
`.github/workflows/coerencia.yml`. A cada envio para o GitHub, verifica-se que
uma alteração a `codigo/` traz `VERSAO` nova no `sw.js`, e que uma alteração ao
produto traz `CHANGELOG.md`. Alterações só a `.md` passam em silêncio. Mexer no
`worker/` gera lembrete de colar no painel, sem falhar. `R-08`, `R-16`.

**Testado em dez casos** antes de ir: portal sem `VERSAO`, `sw.js` tocado com a
`VERSAO` igual, commit correcto, só documentação, Worker sem `CHANGELOG`, os
casos por ramo, e a junção do `desenho` ao `main`.

**Dois furos encontrados a testar, ambos corrigidos antes de publicar:** a regra
do `CHANGELOG` daria vermelho em todos os commits do ramo `desenho` e em todas
as junções para o `main` — ou seja, no caminho normal de publicação inteiro. Nos
dois casos passa a lembrete. Fica registado no ADR-020 que isso abre um buraco:
uma alteração ao portal pode chegar ao ar sem `CHANGELOG` se ninguém o escrever.
A alternativa era uma verificação que dá vermelho sempre, e essa deixa-se de ler.

**A regra do `CHANGELOG` não falha no ramo `desenho`.** O ADR-018 manda o
`codigo/` para lá e os `.md` para o `main`: um commit de desenho nunca traz o
`CHANGELOG`, e falhar aí ensinaria a ignorar a cruz vermelha. A regra da
`VERSAO` falha nos dois ramos — uma pré-visualização com a `VERSAO` velha mostra
a versão errada no telemóvel.

**Corre-se à mão**, sem GitHub: `bash .github/verificar-coerencia.sh HEAD~1 HEAD`.

**Vermelho no GitHub não quer dizer portal partido** — quer dizer que faltou uma
regra. Está escrito no topo dos dois ficheiros, para quem lá chegar daqui a seis
meses.

**Rejeitado:** comparar o `worker.js` do repositório com o que corre mesmo no
Cloudflare. Mataria o R-16, mas exige uma chave de API guardada no GitHub —
mais uma peça e mais um segredo, contra C-02 e C-03.

**O R-08 desce de 6 para 4.** O R-16 mantém-se: ninguém verifica o que está
colado no painel.

## 2026-09-03 — v0.15 · Queixa e pedido não são a mesma coisa

Encontrado a fazer a T-06 — passar um caso real pelo gerador. Um pedido de
apoio social produziu uma carta com um facto inventado, com cópia à Junta que
ninguém escolheu, e com a munícipe tratada no masculino. **`D-019`**.

**O facto inventado.** O campo «onde é o problema?» foi preenchido com a morada
de casa, por não haver outra coisa que lá coubesse, e a carta saiu a dizer que a
perda de emprego «ocorreu na residência do requerente». Não foi desobediência da
IA: a instrução mandava localizar a situação. `R-05`, `M-02.1`.

**A cópia à Junta vinha marcada de fábrica.** Uma carta que declara desemprego e
falta de meios seguia com conhecimento à União de Freguesias sem que ninguém o
tivesse escolhido. Numa terra onde toda a gente se conhece, isso é divulgar a
situação de alguém aos vizinhos. Passa a seguir o assunto e nunca vem marcada.
`M-01.1`.

**Não era defeito da IA.** O modelo escrito à mão — o caminho de degradação do
ADR-007 — escrevia sempre «2. A situação verifica-se em {local}», e com o campo
vazio escrevia `[o local]` à letra. Passa a calcular a numeração dos pontos: sem
local não há parágrafo de local. `M-01.1`, `D-007`.

**Cada assunto passa a declarar o que é.** `tipo` (`queixa`, `pedido`, `apoio`) e
`junta`. As perguntas 6 e 7 acompanham o tipo e a que não se aplica desaparece.
Num pedido de informação urbanística, a 6 passa a «A que casa ou terreno diz
respeito?» e a 7 sai. `M-01.1`, `E-05`.

**O apoio social sai do gerador.** Quem escolhe esse assunto recebe o caminho
certo — Ação Social do Município, 277 394 040, `gab.social@cm-penamacor.pt`,
morada e horário — e o conselho de telefonar antes. A informação já estava no
portal, na ficha do guia; era o gerador que a contradizia. Fica a porta aberta
para escrever, se já lá tiver ido e não tiver tido resposta. `M-01.1`, `F-01`.

**O género deixa de ser presumido.** As instruções do Worker proíbem «o
requerente», «o signatário» e equivalentes. Corrige-se sem enviar nada de novo:
não se diz à IA qual é o género, diz-se que não o marque. Atingia metade do
público em todas as cartas. `M-02.1`.

**A promessa de privacidade foi corrigida** para dizer a verdade: envia-se a
descrição e, se estiver preenchido, o local. Invariante nova, I-09.

**Documentação reposta.** A entrada da v0.14 nunca chegou ao repositório: o
`worker.js` foi actualizado mas o `CHANGELOG.md`, o `LEIA-PRIMEIRO.md` e o
`06-RISKS.md` ficaram na v0.13. Vão agora, com esta.

**Risco novo:** R-18 — assunto acrescentado sem `tipo` nem `junta` devolve o
defeito em silêncio.

**Verificado em produção a 3/9**, do lado de fora: o Worker devolve 12 notícias
do Município; o portal serve a v0.16 em `a-eira.pages.dev`; a aplicação
instalada no telemóvel apanhou a versão nova depois de fechada e reaberta.
**T-06 fechada** na parte que importava — foi ela que descobriu tudo isto.

**Escrito e por publicar (T-19):** a numeração das perguntas saltava de «6.»
para «8.» com a pergunta 7 escondida, e uma queixa sem local passava sem aviso.
Corrigido no ficheiro, `sw.js` v7, ainda não subido.

`sw.js` → **v6**. O `worker.js` mudou: vai a commit antes de ser colado no
painel (R-16).

## 2026-09-02 — v0.14 · O calendário passa a dizer a hora certa

Duas avarias no leitor do Google Calendar, encontradas a preparar a T-03 —
antes de o calendário estar ligado, portanto sem ninguém apanhado por elas.

**As horas ignoravam o fuso.** O `dataICS` lia os algarismos do `DTSTART` tal e
qual. O Google escreve as horas em hora universal (`...Z`) ou com etiqueta de
fuso (`TZID=`), e nenhuma das duas era tratada: no Verão saía **uma hora a
menos**, e num evento depois da meia-noite saía **o dia anterior**. Um arraial
às 00:30 de dia 9 aparecia no dia 8 às 23:30. Passa a converter para hora de
Portugal, com recurso ao fuso escrito no ficheiro. Se o fuso for desconhecido,
fica a hora escrita em vez de partir a agenda — ADR-007. `M-02.2`, `R-03`.

**Eventos que se repetem apareciam uma vez só.** Não havia tratamento de
`RRULE`: um ensaio às quartas entrava na primeira data e desaparecia depois de
passar, sem ninguém perceber porquê — no Google Calendar de quem o criou estava
lá certinho. Passa a desdobrar diários, semanais (com dias da semana), mensais
e anuais, com `INTERVAL`, `COUNT`, `UNTIL` e `EXDATE`. Até 60 repetições por
evento e um ano para a frente. Regras raras (`BYMONTHDAY`, `BYSETPOS`) ficam
deliberadamente de fora: mais vale dar trabalho a quem organiza do que inventar
datas. `M-02.2`, `E-01`, `R-03`.

**Testado antes de publicar:** 21 casos, incluindo o Verão e o Inverno, a
passagem da meia-noite, fusos estrangeiros, dia inteiro, quinzenal, «quartas e
sextas», mensal a 31 (que salta Fevereiro em vez de escorregar para Março), e
um ficheiro `.ics` completo de ponta a ponta.

**Sem alterações ao portal:** só `worker/worker.js`. A `VERSAO` do `sw.js` não
muda.

**Por decidir, e adiado de propósito:** de quem é a conta Google que fica dona
do calendário. Na conta pessoal do Hugo, o calendário da terra fica pendurado
nela — é o R-01 nos dados em vez do código. Fica para depois de se ver o
trabalho que a coisa dá, e antes da T-09.

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
