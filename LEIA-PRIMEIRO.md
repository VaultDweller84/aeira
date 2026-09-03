> **A Eira** · portal da Aldeia de João Pires, concelho de Penamacor.
> Ficheiro `LEIA-PRIMEIRO.md` — mapa do projecto e estado actual.
> É o primeiro ficheiro a ler numa sessão nova.

# A Eira — mapa do projecto

## O que é

Portal comunitário da Aldeia de João Pires (concelho de Penamacor, Castelo
Branco), feito pelo Hugo Almeida. Serve gente de meia-idade e mais velha, com
informática muito básica. Seis áreas: notícias e avisos da terra, gerador de
queixas para a Câmara, guia «como se faz», agenda cultural do concelho,
telefones úteis e sugestões.

**Não é um site oficial da Câmara nem da Junta.**

## Estado — actualizar a cada sessão que mude alguma coisa

| Campo | Valor |
|---|---|
| Versão | v0.16 |
| Última alteração | 2026-09-03 · repositório Git, publicação automática, correcções com a letra grande, linguagem visual nova, ramo de pré-visualização, leitor de calendário corrigido e separação entre queixa e pedido |
| **No ar** | site `a-eira.pages.dev` · Worker `aeira.hugompalmeida.workers.dev` |
| **Código** | `github.com/VaultDweller84/aeira` · público |
| Verificado em produção | 3/9: v0.16 no ar, portal instalado em telemóvel, carta gerada de ponta a ponta, Worker a devolver 12 notícias |
| Em falta | domínio `aeira.pt` (T-17), Google Calendar (T-03), T-19 (numeração e aviso de local, escritos e por publicar) |
| Fase | 6/7 Publicação |
| Bloqueio | nenhum |
| Risco principal | R-01 mantenedor único, score 20 |

## Endereços e nomes

| Coisa | Nome | Endereço |
|---|---|---|
| Repositório | `VaultDweller84/aeira` | `https://github.com/VaultDweller84/aeira` |
| Site (Pages) | `a-eira` | `https://a-eira.pages.dev` |
| Pré-visualização | ramo `desenho` | `https://desenho.a-eira.pages.dev` |
| Worker | `aeira` | `https://aeira.hugompalmeida.workers.dev` |
| KV | `aeira-sugestoes` | ligado ao Worker como `SUGESTOES` |
| Página de gestão | — | `…workers.dev/admin?chave=` + `CHAVE_ADMIN` |
| Domínio | `aeira.pt` | decidido no ADR-016, **por comprar** |

Ver ADR-014 (onde) e ADR-015 (como). **O site e o Worker apontam um para o
outro:** o `CONFIG.API` no `index.html` aponta para o Worker, e a variável
`ORIGENS` no Worker autoriza o site. Mudar um sem o outro parte cartas, agenda
e sugestões em silêncio, deixando as notícias a funcionar — R-14.

## Como se publica

**Alteração ao `codigo/`? Passa primeiro pelo ramo `desenho`** (ADR-018):
sobe-se para lá, vê-se em `desenho.a-eira.pages.dev` **no telemóvel** — três
tamanhos de letra, três temas, notícias e agenda a carregar —, e só depois se
junta ao `main`. O ramo não se apaga: o endereço só existe enquanto ele existir.

**Alteração só a `.md`? Vai directa ao `main`.** Documentação não muda nada no ar.

**Commit no `main`.** O Cloudflare Pages constrói sozinho e põe no ar a pasta
`codigo/`. Sem comando de construção, pasta de saída `codigo`.

Três regras que viajam com cada alteração:

1. Mexeu em `codigo/`? Muda a `VERSAO` no `sw.js` **no mesmo commit** (R-08).
2. Mudou o produto? Muda o `CHANGELOG.md` **no mesmo commit**.
3. Mexeu no Worker? A alteração faz-se no ficheiro `worker/worker.js` e vai a
   commit **antes** de ser colada no painel do Cloudflare (R-16). O Pages não
   publica o Worker.

Formato das mensagens de commit: no `README.md`.

**As três regras são verificadas sozinhas** a cada envio, pelo
`.github/verificar-coerencia.sh` (ADR-020). Cruz vermelha no GitHub não quer
dizer portal partido — quer dizer que faltou uma delas. Para correr à mão:
`bash .github/verificar-coerencia.sh HEAD~1 HEAD`.

## Onde está cada coisa

| Preciso de… | Vou a… |
|---|---|
| perceber o objectivo e o que está fora de âmbito | `00-PROJECT.md` |
| perceber como as peças encaixam e o que acontece quando falham | `01-ARCHITECTURE.md` |
| saber o que é o M-01.4 ou o M-02.3 | `02-MODULES.md` |
| saber os campos de um evento, aviso ou sugestão | `03-DATA-MODEL.md` |
| perceber o que o munícipe faz, passo a passo | `04-FLOWS.md` |
| saber o que se faz a seguir e por que ordem | `05-ROADMAP.md` |
| saber o que pode correr mal | `06-RISKS.md` |
| saber o que se mede | `07-METRICS.md` |
| telefones, prazos legais, romarias, fontes | `08-CONTEUDOS.md` |
| **saber porque é que uma coisa foi feita assim** | `decisions/ADR-*.md` |
| saber o que mudou e quando | `CHANGELOG.md` |
| instalar e configurar tudo | `INSTALAR.md` (raiz) |
| entrar no repositório pela primeira vez | `README.md` |

## As decisões, em uma linha cada

| ADR | Decisão |
|---|---|
| 001 | Ficheiro HTML auto-alojado, não Artifact nem WordPress |
| 002 | Bilingue PT-PT/EN-GB; **nomes próprios nunca se traduzem** |
| 003 | Mobile first; temas por variáveis CSS; alto contraste |
| 004 | Worker próprio com a chave; **não é proxy genérico** |
| 005 | **Dados pessoais nunca saem do dispositivo** |
| 006 | A carta é sempre em português |
| 007 | **Degradação garantida: nenhuma peça é indispensável** |
| 008 | Agenda: romarias fixas + Google Calendar + robô da Câmara |
| 009 | Notícias sem resumo por IA; sem scraping da imprensa |
| 010 | PWA como via principal, APK como segunda via |
| 011 | Sem contas e sem armazenamento no browser |
| 012 | Notícias e avisos como separador inicial |
| 013 | Nome «A Eira»; identidade da aldeia, conteúdo do concelho |
| 014 | **Alojamento no Cloudflare Pages, mesma conta do Worker** |
| 015 | **Repositório Git público; publicação automática a partir do `main`** |
| 016 | Domínio `aeira.pt`; `aldeia.pt` rejeitado por preço e por âmbito |
| 017 | **Linguagem visual:** letra do sistema, ícones desenhados, linha fina e sombra |
| 018 | **Desenho passa pelo ramo `desenho` antes do `main`;** artefacto rejeitado |
| 019 | **Queixa e pedido são coisas diferentes;** apoio social sai do gerador; cópia à Junta nunca marcada de fábrica |
| 020 | **Verificação automática das três regras de commit** no GitHub |

## Vocabulário

**Câmara** = Câmara Municipal de Penamacor. **Junta** = União de Freguesias de
Aldeia do Bispo, Águas e Aldeia de João Pires. **Worker** = o Cloudflare Worker
(`worker/worker.js`), publicado como `aeira`. **Portal** = o `codigo/index.html`,
publicado como `a-eira`. **Avisos** = mensagens curtas da terra, escritas na
página de gestão. **Notícias** = o que a Câmara publica. **Romarias fixas** =
as festas dentro do `index.html`, que funcionam sem rede.

## Regras de manutenção deste dossiê

1. Decisão tomada em conversa **não existe** até estar num ADR. O histórico de
   conversas do Projecto não é conhecimento: não é lido nas sessões seguintes.
2. Quem muda o produto muda o ficheiro afectado **e** o `CHANGELOG.md`, no
   mesmo commit.
3. ADRs não se editam para mudar de ideias — abre-se um novo que substitui o
   anterior, e marca-se o antigo como substituído.
4. IDs (`M-`, `E-`, `F-`, `R-`, `D-`, `T-`, `K-`) nunca se reutilizam nem se
   renumeram.
5. Este ficheiro leva sempre a data e a versão actuais.
6. **O repositório manda.** Os ficheiros carregados no conhecimento do Projecto
   Claude são uma cópia de trabalho: no fim de cada sessão que mude alguma
   coisa, recarregam-se os que mudaram.
