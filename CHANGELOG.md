> **A Eira** · portal do concelho de Penamacor.
> Ficheiro `CHANGELOG.md` — histórico de alterações por versão.
> Decisões em `decisions/ADR-*.md`. Mapa em `LEIA-PRIMEIRO.md`.

# CHANGELOG

Formato: data · o que mudou · porquê · IDs afectados.

## 2026-09-05 — Verificação em produção da v0.22

Sem alterações ao produto. Regista o que se confirmou depois de publicar, e duas
armadilhas de processo que apareceram pelo caminho.

**Worker `68fcc036` activo, 100% do tráfego.** Confirmado no painel, não
assumido. `/noticias` traz 12 notícias do Município e `/agenda` responde — o
código novo não partiu nada.

**O editor do Worker abre preso a uma versão antiga.** A Cloudflare só deixa
editar a mais recente e mostra um selector no topo: é preciso escolher a versão
marcada *Latest* e carregar em **Apply** antes de colar. Não é um detalhe de
interface — **publicar a partir de uma versão antiga faria voltar as variáveis
dessa altura**, e neste caso teria apagado o `CALENDARIO_ICS` ligado na
véspera, deixando a agenda sem os eventos do Google, em silêncio. Escrito na
regra 3 do `LEIA-PRIMEIRO.md`. `R-16`.

**O ramo `desenho` fica para trás sempre que um commit só de documentação vai
directo ao `main`,** e o `git checkout desenho` passa a recusar-se com uma
mensagem sobre ficheiros sobrescritos que não explica nada. A 4/9 isto pôs um
commit no ramo errado. A correcção é uma linha antes de começar —
`git branch -f desenho main` — e passa a estar escrita no `LEIA-PRIMEIRO.md`.
**É a lacuna do ADR-018:** aquele ADR descreve o caminho de ida e não diz nada
sobre manter o ramo alinhado.

**O evento de teste do calendário foi apagado**, e a limpeza foi verificada de
outra rede para escapar à cache de seis horas do `/agenda`: zero eventos com
`fonte: agenda`, sete eventos reais da Câmara. Fica provado que o leitor de
calendário funciona nos dois sentidos — o que se acrescenta aparece, o que se
apaga desaparece. **E fica a medida do que custou:** um único evento semanal de
teste desdobrou-se em **58 entradas até Outubro de 2027** e ocupou 88% da
agenda de um portal já publicado. Um evento de teste num calendário que se
repete não é um item — é uma inundação.

**T-24 nova.** O campo da gestão chama-se «Onde é» e o gerador de cartas tem a
pergunta «6. Onde é o problema?». O próprio autor do projecto leu «Onde é» e foi
ao formulário errado. Se lhe aconteceu a ele, acontece a qualquer co-editor da
T-07 — que é precisamente quem não pode tropeçar. Passa a «De que terra é este
aviso» quando houver outra ida ao Worker.

## 2026-09-04 — v0.22 · **O aviso passa a dizer de que terra é**

Fecha a **T-20** e a **T-23**. É o que faltava para o âmbito do concelho deixar
de ser só um subtítulo. `D-023`, `D-024`, `E-02`, `M-01.4`, `M-02.5`.

**Cada aviso tem agora uma terra, e sem ela não se publica** (invariante I-06).
A página de gestão passa a ter o campo, obrigatório e **sem valor por omissão**:
«Todo o concelho» tem de ser uma escolha consciente, não um descuido de quem
tinha pressa. Avisos criados antes disto contam como `concelho` — era o que
eram quando foram escritos.

**Filtro no cimo dos avisos**, com «Todas as terras» por defeito. Doze
povoações. A escolha guarda-se e sobrevive a fechar e abrir o portal.

**Duas regras de segurança ficaram escritas no código, não só na cabeça:**

1. **Os avisos «Todo o concelho» aparecem sempre**, seja qual for a terra
   escolhida. Um recenseamento ou um corte na estrada nacional não podem
   desaparecer porque alguém filtrou pela sua aldeia.
2. **Uma terra desconhecida nunca esconde o aviso** — o portal mostra a chave
   em vez de o omitir. Se as duas listas de localidades se separarem (R-21
   novo), o pior que acontece é um nome feio, não informação perdida.

**Preferências guardadas** — terra, tema, tamanho de letra e língua, tudo em
`try/catch` (ADR-024). A detecção do idioma do aparelho passa a valer só no
primeiro arranque. Os dois botões de língua continuam sempre visíveis lado a
lado, para que quem carregue em «English» por engano veja como voltar.

---

**E encontrou-se uma avaria que já estava no ar, mais grave do que tudo o que
esta versão acrescenta.**

**A barra de baixo saía do ecrã nos dois tamanhos de letra maiores.** Num ecrã
de 320 px a barra media **355 px no tamanho médio e 370 no maior** — o botão
«Sugerir» ficava cinquenta pixels para lá da margem direita, **invisível
precisamente para quem aumentou a letra por não ver bem.** Não vinha da v0.20:
já estava assim na v0.19, e provavelmente desde a v0.3.

A causa era uma linha: `grid-template-columns:repeat(6,1fr)`. O `1fr` é
`minmax(auto,1fr)`, e o mínimo `auto` deixa a coluna crescer até o nome caber —
seis nomes a crescer não cabem em 320 px. Passa a `minmax(0,1fr)`: seis colunas
iguais de 53 px, a acabar exactamente na margem, **nos três tamanhos**. E o modo
de falha muda de natureza: um nome que não caiba passa a duas linhas e a barra
fica mais alta, em vez de empurrar um botão para fora do ecrã. `R-17`.

**Como escapou às medições anteriores, e a lição que fica.** Mediu-se o
`scrollWidth` da página, que ficava nos 320 e dizia «não anda para o lado». Mas
a barra é `position:fixed` — **não estica o documento, e por isso não aparece
nessa medida.** Um elemento fixo que transborda é invisível ao teste mais
óbvio. A verificação do R-17 no `06-RISKS.md` passa a medir a barra
directamente, botão a botão, e não a página.

**O cabeçalho do aviso também transbordava** depois de lhe acrescentar a
etiqueta da terra: `.cabeca-aviso` passa a `flex-wrap:wrap`. Apanhado na mesma
sessão, antes de sair.

**Testado com um browser a sério**, a 320 px, nos três tamanhos de letra e nas
duas línguas: filtro presente, avisos certos por terra, avisos do concelho
sempre visíveis, aviso antigo sem terra tratado como concelho, escolha
sobrevive a recarregar, tema e letra sobrevivem, mensagem própria quando a
terra escolhida não tem avisos, e zero erros de JavaScript.

**«Telefones» durou uma hora.** Foi proposto na v0.20 para o nome da barra
bater certo com o do cartão, mediu-se, e recuou-se: ~58 px numa coluna de 53,
com o texto a encostar ao nome do botão do lado. Três nomes colados leem-se
como um só. Voltou a **«Números»**, e o cartão e a secção passaram a «Números
úteis» para continuarem a bater certo. O ícone do auscultador desfaz a
ambiguidade da palavra. Fica escrito no `02-MODULES.md` que **sete caracteres é
o tecto** num ecrã de 320 px.

**E ficou uma barreira no CSS** para isto não voltar: `max-width:100%` no nome
do botão. Um nome grande demais passa a partir em duas linhas — feio, mas
legível — em vez de invadir o botão do lado. `R-17`.

`sw.js` → **v12**. O `worker.js` mudou: **commit antes de colar no painel** (R-16).

## 2026-09-04 — v0.21 · Duas decisões, sem código ainda

Sem alterações ao produto. Duas decisões tomadas em conversa e escritas na
mesma sessão, como manda a regra 1. **`D-024`**.

**O `localStorage` deixa de estar proibido — para quatro preferências e nada
mais.** Aldeia escolhida, tema, tamanho de letra e língua. Substitui a
proibição absoluta do ADR-011; **contas, palavras-passe e cookies continuam
proibidos**, e é isso que aquele ADR realmente protegia. A frase que o
justifica continua verdadeira palavra por palavra: «não há contas, não há
senhas — se alguma coisa lhe pedir isso em nome deste portal, é burla».

**O que forçou a decisão foi um raciocínio simples: um filtro que esquece é
pior do que não haver filtro.** Quem escolhe «Meimoa» hoje e amanhã vê os
avisos todos outra vez não conclui que o portal não guarda preferências —
conclui que está avariado, ou que o aviso dela desapareceu. O mesmo já se
passava com o tamanho de letra, e aí atinge exactamente quem o aumentou por não
ver bem. `T-23`, `D-011`, `D-024`.

**O aviso ganha localidade obrigatória** — `E-02`, invariante **I-06** nova:
aviso sem localidade não se publica. Num portal de nove freguesias, «corte de
água» sem dizer onde é informação em falta disfarçada de informação. Avisos
criados antes do ADR-023 contam como `concelho`. `T-20`.

**Tarefa nova T-23** — o filtro de aldeia, com a escolha guardada. Fica logo a
seguir à T-20 na ordem de execução, e as duas juntas são o que torna o âmbito
do concelho verdadeiro em vez de anunciado.

**O filtro fica no cimo dos avisos, não na barra de topo**, e foi decidido
contra a proposta inicial. Duas razões: o cabeçalho foi reduzido de 60% para
26% do primeiro ecrã na v0.11 e não se volta a enchê-lo — vale o princípio
escrito de que cresce o texto que se lê, não a mobília; e um selector no topo
prometeria filtrar o portal inteiro quando só filtra uma secção, porque o guia,
a carta, os telefones e as notícias do Município são do concelho todo. `R-17`.

**Bandeiras em vez de «Português» e «English»: proposto e recusado.** As
bandeiras não herdam a cor do tema — o tema de alto contraste existe para quem
vê mal e passaria a ter dois rectângulos coloridos onde tinha duas palavras; em
emoji nem sequer aparecem no Windows, saem as letras «PT» e «GB»; e bandeira não
é língua, o que atinge o P-03, os proprietários estrangeiros, para quem «English»
diz o que a bandeira do Reino Unido não diz. É a mesma razão pela qual a v0.12
tirou os emoji da navegação. `D-002`, `D-017`, `M-01.7`.

**Sai da lista de sugestões por implementar** a linha «Lembrar língua e tema com
`localStorage`»: deixou de contrariar um ADR e passou a fazer parte da T-23.

## 2026-09-04 — v0.20 · **O portal passa a ser do concelho**

A maior mudança de âmbito desde que o projecto começou, e a que mais promete
sem ainda cumprir. **`D-023`**, que substitui a parte de âmbito do `D-013`.

**O portal deixa de ser da Aldeia de João Pires e passa a ser do concelho de
Penamacor** — nove freguesias e uniões. João Pires deixa de ser o dono e passa
a ser uma das localidades servidas, e é onde nasceu.

**O nome não muda, e isso não é sorte.** O ADR-013 escolheu «A Eira» com este
argumento escrito: *«todas as aldeias têm eira, por isso serve a Bemposta e a
Meimoa sem deixar de ser da terra»*. A decisão de hoje é a que aquele nome já
permitia. O `aeira.pt` também não muda. `D-013`, `D-016`.

**O subtítulo é a alteração mais delicada, e quase correu mal.** «Aldeia de
João Pires · concelho de Penamacor» passa a **«Concelho de Penamacor · feito
por gente da terra»**. A segunda metade não é enfeite: sem ela, um portal que
diz apenas «Concelho de Penamacor» fica **mais** parecido com o site da Câmara,
não menos — agravava o R-12 em vez de o deixar quieto. Quem mexer neste texto
tem de manter lá quem o faz. `M-01.7`, `R-12`.

**Os contactos das nove Juntas estão recolhidos** e no `08-CONTEUDOS.md`, com
uma reserva séria: as páginas individuais do Município têm data de actualização
de **Dezembro de 2020** e houve autárquicas pelo meio. Moradas, telefones e
emails entram; **nomes de presidentes e horários só entram confirmados por
telefone.** Risco novo **R-20**.

**Três tarefas novas, e a aritmética do roadmap mudou com elas.** O alcance
deixou de ser a população da aldeia e passou a ser a do concelho, o que empurra
estas à frente de quase tudo: **T-20** localidade no aviso, **T-21** Junta certa
por localidade, **T-22** romarias e contactos das outras oito freguesias.

**O anúncio (T-09) foi adiado de propósito.** Ficou decidido lançar como portal
do concelho — mas depois do conteúdo, não antes. Quem vier da Meimoa e
encontrar telefones que não são os dele fecha o separador e não volta. Nova
ordem: T-20 → T-22 → T-07 → T-17 → T-09.

**E a T-07 mudou de natureza.** Recrutar co-editores era desejável; com nove
freguesias passa a ser **condição do âmbito**. Um portal que promete nove
freguesias com avisos de uma parece abandonado em oito. `R-01`.

---

**Os botões, no mesmo dia.** Revisão dos nomes da navegação para quem tem 70
anos e informática básica. Sem alterações de estrutura — seis separadores,
mesmo destino, só os nomes.

**«Queixa» passa a «Escrever», e é a correcção que mais vale de toda a lista.**
O `D-019` decidiu que queixa e pedido são coisas diferentes e o gerador faz as
duas — mas o botão só dizia «Queixa». Quem queria *pedir* apoio social ou uma
informação não carregava ali. Uma palavra, e o separador deixa de excluir
metade de quem precisa dele. `M-01.1`, `D-019`.

**A barra e os cartões diziam coisas diferentes.** Queixa/«Escrever uma queixa
ou pedido», Guia/«Como se faz…», Números/«Telefones úteis»,
Sugerir/«Sugestões». Quem aprende pelo cartão e usa pela barra encontrava duas
palavras para a mesma coisa. Passa a haver **regra escrita** no
`02-MODULES.md`: o nome na barra é a primeira palavra do cartão e da secção, e
cabe em oito ou nove caracteres. `M-01.7`, `R-17`.

**«Sugerir» estava a esconder o que faz.** É por ali que se dá um aviso e se
anuncia uma festa — as Notícias e a Agenda mandam lá as pessoas —, mas o cartão
dizia «Sugestões», que soa a caixa de reclamações do portal. Passa a «Sugerir»,
com o subtítulo a dizer para que serve. `M-01.5`.

**Mudanças:** `bar1` Queixa→Escrever · `bar4` Números→Telefones · cartão e
secção do guia passam a «Guia: como se faz…» · cartão e secção das sugestões
passam a «Sugerir» e «Sugerir ou avisar». Em inglês: Letter→Write, Ideas→
Suggest, e os cartões alinhados da mesma maneira.

**Por verificar antes de juntar ao `main`:** «Telefones» tem nove caracteres e
a barra tem seis colunas. A `clamp` da v0.11 impede a letra de crescer e o
`hyphens:auto` parte a palavra em vez de a cortar, mas isto **não foi medido —
foi lido do CSS**. Tem de ser visto no ramo `desenho`, no telemóvel, nos três
tamanhos de letra, antes de ir para o ar. É exactamente o que o ADR-018 existe
para impedir. `R-17`.

`sw.js` → **v11**.

## 2026-09-04 — v0.19 · **A agenda da terra passa a existir**

Fecha a **T-03** e com ela a última fonte de conteúdo que faltava ligar. A
agenda deixa de mostrar só o que a Câmara publica e as romarias de sempre:
passa a haver um sítio onde quem organiza uma coisa na terra a põe, sem pedir
nada a ninguém. **`D-022`**, `M-04.1`, `T-03`, `R-01`.

**A conta é do projecto, não do Hugo.** Foi criada uma conta Google própria,
dona do calendário **Agenda de Penamacor**. A decisão estava adiada de propósito
desde a v0.14 e o raciocínio está no ADR-022: numa conta Google normal a
propriedade de um calendário não se transfere, e o que se decidiu foi o mesmo
que se decidiu para o código no ADR-015 — não tornar o projecto imortal,
torná-lo entregável.

**Sem alterações ao código.** Nem `codigo/`, nem `worker/`. Só a variável
`CALENDARIO_ICS` no Worker e a documentação. A `VERSAO` do `sw.js` não muda.

**O leitor de calendário da v0.14 viu um ficheiro real do Google pela primeira
vez, e passou.** Foi posto um evento de teste semanal para o pôr à prova:

- hora certa — 17h00 no Google, 17h00 no portal, com o fuso do Verão pelo meio;
- repetição desdobrada — 4, 11, 18 e 25 de Setembro, cada sexta a sua entrada;
- local e descrição chegam inteiros, e o local alimenta o mapa;
- ordenação certa, intercalado com os eventos da Câmara e com a etiqueta de
  origem correcta.

Verificado no portal publicado, não só na resposta do Worker. `M-01.3`,
`M-02.2`, `R-03`.

**Duas armadilhas do caminho, agora escritas no `INSTALAR.md`** — nenhuma delas
dá erro, as duas deixariam a agenda em silêncio:

1. **Marcar «tornar disponível ao público» repõe sozinho «ver apenas
   livre/ocupado».** O `.ics` sai com eventos sem título, sem local e sem
   descrição.
2. **Acrescentar uma variável no painel da Cloudflare não a põe a servir.** Cria
   uma versão nova que fica na história, com o tráfego todo na versão antiga.
   Foi o que aconteceu aqui: a primeira verificação deu a agenda sem um único
   evento do calendário, e a variável estava correcta. Faltava promover a
   versão. `R-16`.

**Risco novo: R-19** — a conta do calendário. O Google apaga contas ao fim de
dois anos sem ninguém entrar, e o Worker a ler o calendário não conta como
actividade. É uma forma de a agenda se esvaziar em silêncio, sem erro nenhum.

**Por fazer, e é agora a única peça que falta na Fase 1:** o domínio `aeira.pt`
(T-17). E a T-07 ficou mais fácil do que era — dar edição do calendário a duas
ou três pessoas deixou de significar dar acesso a uma conta pessoal.

## 2026-09-03 — v0.18 · Os contactos da Câmara, reconferidos

Sem decisão nova. Fecha o `[L]` do D-021 e corrige o que se encontrou pelo
caminho, lendo a página oficial de Contactos e Horários do Município,
actualizada por eles a 29/7/2026.

**O `serv.obras@` estava certo.** Obras e Urbanismo tem quatro endereços:
secretaria `serv.obras@` (entrada), obras particulares `arquitecto@`, obras
públicas `obras.publicas@` (empreitadas municipais) e fiscalização
`fiscalizacao@`. `D-021`, `08-CONTEUDOS`.

**A água estava errada no dossiê.** A página oficial lista
**`sas@cm-penamacor.pt`**; o dossiê tinha `sas.info@`, e foi esse que entrou no
portal na v0.17. Corrigido. A divergência fica registada para verificação —
podem existir os dois. `M-01.1`, `08-CONTEUDOS`.

**Obras e Urbanismo não é no edifício da Câmara** e fecha às **16h00**, hora e
meia antes dos outros serviços. Fica no antigo Quartel, Largo Tenente Coronel
Júlio Rodrigues da Silva. Quem lá vá às 17h encontra a porta fechada — e o
portal não dizia isto em lado nenhum. `M-01.2`.

**A ficha do guia sobre obras cresceu**, nas duas línguas: perguntar e requerer
são coisas diferentes (a Câmara tem 29 impressos, incluindo «Direito à
Informação» e «Pedido de Informação Prévia»); onde é e a que horas; e o aviso de
que **pedir a legalização de obra já feita é declarar por escrito que houve obra
sem licença** — caminho certo, mas convém telefonar antes. `M-01.2`, `D-002`.

**O executivo tem cinco membros, não três.** Faltavam o vereador Filipe André
Ramos Leitão Batista e a vereadora Noémia Campos Crucho. `08-CONTEUDOS`.

**Contactos novos no dossiê:** Protecção Civil, assessoria jurídica, arquivo,
tesouraria, execuções fiscais, Espaço do Cidadão, Assembleia Municipal, e a
**Plataforma de Denúncias** do Município, que o portal não sabia que existia.

**O Worker deixa de escrever jargão.** «Enquadramento instrutório»,
«esclarecimento cabal», «devidamente regularizada» e afins ficam proibidos por
instrução: formal é para ser entendido, não para encher. E a IA passa a ter
regra contra inflacionar a gravidade — dois dias de contentor cheio não
«compromete gravemente a salubridade pública». Exagerar tira credibilidade a
quem assina. `M-02.1`, `R-05`.

**Também nesta versão**, escrito e não registado na v0.17: a nota de
privacidade dizia «deste telemóvel» numa página que também se abre no
computador, e passou a «deste aparelho»; e os títulos dos grupos da lista de
assuntos passaram a maiúsculas entre travessões, porque a lista aberta é
desenhada pelo sistema e nem todos aceitam estilo.

`sw.js` → **v10**. O `worker.js` mudou: commit antes de colar no painel (R-16).

## 2026-09-03 — v0.17 · A carta vai a quem a trata

**`D-021`**. Notado a testar o D-019: um pedido de informação urbanística ia
para `presidente@` e `secretaria.gap@`, quando a Câmara tem `serv.obras@` para
urbanismo e `sas.info@` para a água — endereços que o guia do portal já usa.

**A carta continua dirigida ao Presidente**, e isso foi verificado, não
assumido: no RJUE a comunicação prévia é dirigida ao Presidente da Câmara e é a
ele que compete dirigir a instrução, com delegação nos serviços. Dirigir ao
serviço e pôr o Presidente em cópia inverteria a hierarquia. `M-01.1`.

**O que muda é o destino.** A carta ganha «Ao cuidado da Divisão de Obras,
Planeamento e Urbanismo» por baixo da morada, e o email passa a incluir o
serviço competente **além** do Presidente e da secretaria. Nenhum sai: a
secretaria faz a entrada e é o que faz o prazo correr, o Presidente é a quem a
carta é dirigida, o serviço é quem trata. `M-01.1`, `E-05`.

**O portal deixa claro que não substitui requerimentos.** O assunto das obras
mostra uma nota antes dos campos: serve para perguntar, não para licenciar.
Licenciar obra faz-se em impresso próprio, com plantas e termos de
responsabilidade. `M-01.2`, `M-01.1`.

**A lista dos assuntos passa a ter dois grupos** — problemas e pedidos. Treze
linhas seguidas obrigam a ler tudo. `M-01.1`, `D-019`.

**A dica do nome ficou mais firme:** pede o nome do cartão de cidadão e
desaconselha a alcunha. Numa exposição formal isso conta, e apareceu num teste
real. `M-01.1`.

**Por reconfirmar `[L]`:** apareceu em documentação de concursos do Município o
endereço `obras.publicas@cm-penamacor.pt`, ligado à Divisão de Obras,
Planeamento e Urbanismo. Provavelmente é para empreitadas municipais e o
`serv.obras@` para o munícipe — mas provável não chega. Ficou o que está
verificado no site oficial. Confirmar por telefone.

`sw.js` → **v8**.

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
