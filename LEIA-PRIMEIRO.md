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
| Versão | v0.9 |
| Última alteração | 2026-09-01 · **portal publicado** |
| **No ar** | site `aeira-portal.pages.dev` · Worker `aeira.hugompalmeida.workers.dev` |
| Verificado em produção | notícias, agenda, carta gerada pela IA de ponta a ponta |
| Em falta | Google Calendar (T-03), teste em telemóvel (T-06), repositório Git, domínio |
| Fase | 6/7 Publicação |
| Bloqueio | nenhum |
| Risco principal | R-01 mantenedor único, score 20 |

## Endereços e nomes no Cloudflare

| Coisa | Nome | Endereço |
|---|---|---|
| Site (Pages) | `aeira-portal` | `https://aeira-portal.pages.dev` |
| Worker | `aeira` | `https://aeira.hugompalmeida.workers.dev` |
| KV | `aeira-sugestoes` | ligado ao Worker como `SUGESTOES` |
| Página de gestão | — | `…workers.dev/admin?chave=` + `CHAVE_ADMIN` |

Ver ADR-014. **Estes dois apontam um para o outro:** o `CONFIG.API` no
`index.html` aponta para o Worker, e a variável `ORIGENS` no Worker autoriza
o site. Mudar um sem o outro parte cartas, agenda e sugestões em silêncio,
deixando as notícias a funcionar — R-14.

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
| instalar e configurar tudo | `codigo/INSTALAR.md` |

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

## Vocabulário

**Câmara** = Câmara Municipal de Penamacor. **Junta** = União de Freguesias de
Aldeia do Bispo, Águas e Aldeia de João Pires. **Worker** = o Cloudflare Worker
(`worker.js`), publicado como `aeira`. **Portal** = o `index.html`, publicado
como `aeira-portal`. **Avisos** = mensagens curtas da terra, escritas na
página de gestão. **Notícias** = o que a Câmara publica. **Romarias fixas** =
as festas dentro do `index.html`, que funcionam sem rede.

## Regras de manutenção deste dossiê

1. Decisão tomada em conversa **não existe** até estar num ADR. O histórico de
   conversas do Projecto não é conhecimento: não é lido nas sessões seguintes.
2. Quem muda o produto muda o ficheiro afectado **e** o `CHANGELOG.md`, na
   mesma sessão.
3. ADRs não se editam para mudar de ideias — abre-se um novo que substitui o
   anterior, e marca-se o antigo como substituído.
4. IDs (`M-`, `E-`, `F-`, `R-`, `D-`, `T-`, `K-`) nunca se reutilizam nem se
   renumeram.
5. Este ficheiro leva sempre a data e a versão actuais.
6. **Publicar é manual** enquanto não houver repositório: arrastar os
   ficheiros para o Cloudflare Pages e **mudar a `VERSAO` no `sw.js`** (R-08).
