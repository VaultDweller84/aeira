> **A Eira** · portal da Aldeia de João Pires, concelho de Penamacor.
> Ficheiro `06-RISKS.md` — registo de riscos R-01 a R-18.
> Decisões em `decisions/ADR-*.md`. Mapa em `LEIA-PRIMEIRO.md`.

# 06 — Riscos

Escala 1-5. Score = Probabilidade × Impacto.

| ID | Risco | P | I | Score | Mitigação | Sinal de alerta | Dono |
|---|---|---|---|---|---|---|---|
| R-01 | **Mantenedor único.** Ninguém além do Hugo publica avisos ou eventos; o portal desactualiza-se e morre | 4 | 5 | **20** | Dar edição do Google Calendar e a chave de gestão a 2-3 pessoas da terra (F-07); **código em repositório público desde 2/9/2026 (ADR-015)** — outra pessoa pode pegar-lhe | duas semanas sem avisos novos | Hugo |
| R-02 | **Robô da Câmara parte.** O site muda e agenda/notícias perdem a fonte principal | 4 | 3 | **12** | Degradação já garantida; etiqueta de fonte; verificação periódica | `/agenda` ou `/noticias` devolve 0 itens da Câmara | Hugo |
| R-03 | **Datas mal lidas** pelo robô (reconhecimento de padrões no texto) levam alguém a uma festa no dia errado | 3 | 4 | **12** | Aviso visível nos eventos da Câmara + ligação à fonte; **desde 2/9/2026 as horas do Google Calendar são convertidas para hora de Portugal e os eventos repetidos desdobrados** | queixa de munícipe | Hugo |
| R-04 | **Adopção nula.** Portal publicado e ninguém usa | 3 | 5 | **15** | Notícias como separador inicial; avisos frequentes; lançamento no grupo de Facebook | <10 visitas/semana ao fim de um mês | Hugo |
| R-05 | **Texto da IA distorce o que o munícipe quis dizer** e é assinado por ele | 3 | 4 | **12** | Texto sempre mostrado, editável, com aviso; instruções proíbem inventar factos; **desde 3/9/2026 proíbem também inventar local e marcar género (D-019)** | queixa; carta com factos que o munícipe não escreveu | Hugo |
| R-06 | **Falecimento publicado sem consentimento da família** | 2 | 5 | **10** | Aviso permanente na página de gestão; regra escrita | reacção da família | quem publica |
| R-07 | **Dados pessoais acumulados em KV** (nomes e contactos em sugestões) sem política de retenção | 3 | 3 | **9** | Apagar periodicamente à mão | KV com centenas de registos antigos | Hugo |
| R-08 | **Esquecer de mudar `VERSAO` no `sw.js`** e os telemóveis ficarem presos a uma versão antiga | 2 | 2 | **4** | Documentado em F-09 e no INSTALAR; regra escrita de commit desde o ADR-015; **verificada sozinha a cada envio desde o ADR-020** | cruz vermelha no GitHub; «não vejo a alteração» | Hugo |
| R-09 | **Chave de gestão exposta.** Quem souber o endereço publica avisos no portal | 2 | 4 | **8** | Chave longa, `noindex`, nunca em ficheiro do site; verificado a 2/9/2026 antes de o código passar a público | avisos que ninguém publicou | Hugo |
| R-10 | **Quota da IA esgotada ou fornecedor deixa de ser gratuito** | 3 | 2 | **6** | Degradação para modelo; troca de fornecedor por variável | erros 429/402 no Worker | Hugo |
| R-11 | **APK distribuída ensina a ignorar avisos de segurança**, expondo os mais vulneráveis a burlas | 3 | 4 | **12** | PWA como via principal; passo de desligar a autorização; linguagem explícita | — | Hugo |
| R-12 | **Confusão com fonte oficial.** Alguém toma o portal por site da Câmara | 2 | 3 | **6** | Rodapé identifica a origem comunitária; ligações à fonte oficial | — | Hugo |
| R-13 | **Modelo de IA desligado ou restringido pelo fornecedor.** O nome do modelo escrito no `worker.js` deixa de ser aceite e o assistente de escrita cala-se | 5 | 2 | **10** | Degradação para modelo escrito à mão (ADR-007); segunda tentativa sem `thinkingConfig`; diagnóstico escrito em comentário no próprio `worker.js` | portal responde `{"erro":"fornecedor","estado":404}` | Hugo |
| R-14 | **Desalinhamento entre `CONFIG.API` e `ORIGENS`.** Mudar o endereço do site ou do Worker sem mudar o outro | 3 | 3 | **9** | Anotado nos ADR-014 e ADR-015; verificar as duas pontas em cada mudança de endereço | cartas, agenda e sugestões param **mas as notícias continuam** | Hugo |
| R-15 | **Cloudflare Pages em fim de vida.** A Cloudflare está a empurrar os sites estáticos para os Workers e trata os Pages como caminho antigo; um dia fecha a porta e o portal tem de mudar de casa | 3 | 3 | **9** | O site é HTML estático puro — a migração é configuração, não reescrita; T-18 avalia quando | anúncio de descontinuação; opção de criar Pages desaparece do painel | Hugo |
| R-16 | **`worker.js` do repositório diferente do que está a correr.** O Pages publica `codigo/` sozinho, mas o Worker continua a ser actualizado à mão no painel — uma correcção feita no painel e não no repositório perde-se; uma feita no repositório e não no painel nunca chega ao ar | 3 | 4 | **12** | Regra: qualquer alteração ao Worker faz-se no ficheiro e vai a commit **antes** de ser colada no painel; **desde 3/9/2026 (ADR-020), mexer em `worker/` gera lembrete automático** — mas ninguém verifica o que está colado no painel | comportamento do Worker que não se explica pelo código do repositório | Hugo |
| R-17 | **Regressão silenciosa de desenho com a letra grande.** Qualquer alteração ao CSS pode voltar a cortar nomes na barra, empurrar o conteúdo para fora do ecrã ou encher o primeiro ecrã de mobília — e nada disto dá erro | 4 | 3 | **12** | Ramo de pré-visualização `desenho` (ADR-018) + as três medidas antes de publicar (ver secção abaixo) | página anda para o lado; nomes cortados na barra; conteúdo só abaixo da dobra | Hugo |

| R-18 | **Assunto novo sem `tipo` nem `junta`.** Acrescentar um assunto ao gerador sem declarar o tipo e a cópia à Junta devolve, em silêncio, o defeito que o D-019 corrigiu: campos que não se aplicam, vocabulário errado e cópia à Freguesia num assunto pessoal | 3 | 4 | **12** | Regra escrita no D-019 e no `02-MODULES.md`; a lista `ASSUNTOS` tem os dois campos em todas as entradas | assunto na lista sem `tipo:` | Hugo |

## Top 3 por score

1. **R-01 (20)** — mantenedor único. Não é um risco técnico e não se resolve
   com código. O repositório público (ADR-015) tirou-lhe a metade técnica — o
   código deixou de morrer com um disco. A metade que importa continua igual:
   ninguém além do Hugo publica.
2. **R-04 (15)** — adopção. Um portal correcto que ninguém abre falhou.
3. **R-02 / R-03 / R-05 / R-11 / R-16 / R-17 / R-18 (12)** — empatados.

## Riscos aceites por escrito

- **Scraping do site da Câmara** (R-02, R-03): aceite. Não há alternativa —
  a Câmara não publica feed. Mitigado por degradação e por etiquetagem
  honesta da fonte.
- **Nível gratuito do Gemini pode usar os pedidos para treino** (`[F]`):
  aceite, porque só a descrição do problema é enviada, nunca dados pessoais.
- **Nomes de modelo fixos no código** (R-13): aceite. A alternativa —
  descobrir o modelo em tempo de execução — acrescenta uma chamada e um modo
  de falha novo para poupar uma edição de uma linha de dois em dois anos.
  Não compensa.
- **Código público** (ADR-015): aceite. Sem segredos no repositório, o que
  fica exposto é a lógica do Worker. Em troca, o projecto deixa de depender de
  uma pessoa e de um disco.

## Como se verifica o desenho antes de publicar (R-17)

Três medidas, num ecrã estreito (320 px é o pior caso realista) e nos três
tamanhos de letra. Nenhuma delas dá erro visível — todas passam por «está
publicado».

1. **A página não anda para o lado.** A largura do documento tem de ser igual à
   do ecrã em todos os separadores. Se for maior, há uma palavra que não parte —
   quase sempre um email ou um endereço.
2. **Nenhum nome da barra de baixo está cortado.** Seis botões num ecrã de
   telemóvel dão cerca de 60 px cada; o nome tem de caber nesses 60 px no
   tamanho de letra maior.
3. **O cabeçalho não come o primeiro ecrã.** Referência: abaixo de um terço da
   altura, no tamanho de letra maior.

Medições de 2/9/2026, antes e depois da correcção, num ecrã de 375 px:

| Medida | Antes (letra grande) | Depois |
|---|---|---|
| Largura da página — Notícias | 496 px num ecrã de 375 | 375 |
| Largura da página — Telefones | 483 px | 375 |
| Nomes cortados na barra | 4 de 6 | nenhum |
| Cabeçalho no primeiro ecrã | 60% | 26% |

## Nota sobre o dia 3/9/2026: a carta do apoio social

A T-06 — testar com um caso real — apanhou o que nenhum teste técnico apanharia.
Um pedido de apoio social passado pelo gerador de queixas produziu uma carta
que dizia que a perda de emprego *«ocorreu na residência do requerente»*,
seguia com cópia à Junta de Freguesia **sem ninguém ter escolhido isso**, e
tratava uma mulher no masculino do princípio ao fim.

Três lições:

1. **A opção marcada de fábrica não é uma escolha.** A cópia à Junta vinha
   `checked` no HTML. Para o público deste portal, uma caixa já marcada é uma
   decisão tomada por ele — e neste caso era divulgar a situação financeira de
   alguém aos vizinhos.
2. **O campo que não se aplica é pior do que o campo em falta.** Obrigado a
   pôr alguma coisa em «onde é o problema?», o utilizador pôs a morada, e a IA
   teve de a usar. O defeito estava no formulário, não no modelo.
3. **A degradação também herda os defeitos do desenho.** O modelo escrito à
   mão produzia a mesma frase. Ter caminho de degradação (ADR-007) não protege
   de um formulário errado — protege de uma falha de rede.

## Nota sobre o R-13, que deixou de ser hipótese

No dia da publicação, 1/9/2026, o `worker.js` chamava `gemini-2.0-flash`.
Falhou à primeira tentativa: a Google tinha desligado esse modelo. A correcção
óbvia — `gemini-2.5-flash` — falhou também, com **404 apesar de o modelo
aparecer na lista da chave**: a Google passou a reservar os modelos 2.5 a
quem já os usava. Só `gemini-3.5-flash` funcionou.

Três lições, que valem mais do que o incidente:

1. **A documentação do fornecedor não é fonte fiável** sobre o que uma chave
   concreta pode usar. A única fonte que não mente é
   `generativelanguage.googleapis.com/v1beta/models?key=…`, com a chave real.
2. **A degradação do ADR-007 funcionou em condições reais.** O portal esteve
   publicado mais de uma hora com a IA em baixo e continuou a servir cartas
   pelo modelo escrito à mão. Ninguém teria dado por nada.
3. **A degradação tem de existir também dentro da chamada**, não só à volta
   dela. Uma afinação de velocidade (`thinkingConfig`) recusada pelo
   fornecedor bastaria para matar a carta; por isso o Worker tenta segunda
   vez sem ela.

## Nota sobre o dia 2/9/2026, que vale para o R-01

A passagem para o repositório correu em cinco tentativas com quatro enganos,
todos apanhados por verificação e nenhum por sorte:

- a primeira subida ao GitHub levou os ficheiros soltos e **deixou as três
  pastas para trás** — o repositório ficou com a documentação toda e nenhum
  código;
- o `instalar.html` (página do portal) e o `INSTALAR.md` (manual de
  configuração) trocaram de sítio, pelo nome parecido;
- o painel da Cloudflare abriu o caminho dos Workers em vez do dos Pages, com
  um `Deploy` que teria criado um projecto errado a ocupar o nome;
- o `ORIGENS` levou os dois endereços separados por **espaço em vez de
  vírgula**, o que teria partido o portal novo *e* o antigo em silêncio.

A lição não é sobre distracção — é sobre o processo. **Nenhuma destas coisas
dá erro visível.** Todas passariam por «publicado com sucesso». Confirmar o
resultado do lado de fora, e não confiar no ecrã que diz *Success*, é o que
separa um portal que funciona de um que parece funcionar.
