> **A Eira** · portal da Aldeia de João Pires, concelho de Penamacor.
> Ficheiro `03-DATA-MODEL.md` — entidades E-01 a E-07 e invariantes.
> Decisões em `decisions/ADR-*.md`. Mapa em `LEIA-PRIMEIRO.md`.

# 03 — Modelo de dados

Não há base de dados relacional. Três formas de persistência: constantes no
portal (estático), Cloudflare KV (avisos e sugestões), e caches efémeras.

## E-01 Evento

Forma normalizada dentro do portal, vinda de três fontes.

| Campo | Tipo | Notas |
|---|---|---|
| `chave` | string | `fixo:<i>` \| `gcal:<uid>` \| `cm:<slug>` |
| `titulo` | string | **nunca traduzido** (D-02) |
| `local` | string | `local_en` só quando é descrição, não nome |
| `mapa`, `mapaNome` | string | consulta e rótulo do Google Maps |
| `descricao` | string | bilingue nos fixos; da fonte nos remotos |
| `ano`,`mes`,`dia`,`hora` | número/string | `hora` pode ser nula |
| `dataISO`, `dataFimISO` | `YYYY-MM-DD` | nulas se não se conseguiu ler |
| `fixo` | bool | repete-se todos os meses (mercado) |
| `nossa` | bool | é da aldeia — destacado |
| `fonte` | enum | `fixo` \| `agenda` \| `camara` |
| `link`, `imagem` | url | opcionais |

**Invariantes**
- I-01: sem `dataISO` não há botão de calendário nem `.ics`. `[F]`
- I-02: eventos sem mês vão para a secção «Sem data certa», nunca para um mês
  inventado. `[F]`
- I-03: `fonte === 'camara'` obriga a etiqueta + aviso de confirmação. `[F]`

## E-02 Aviso — KV `aviso:<ts>-<rand>`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | timestamp + aleatório |
| `titulo` | string ≤120 | obrigatório, ≥3 caracteres |
| `texto` | string ≤1200 | opcional |
| `categoria` | enum | `urgente` \| `servico` \| `comunidade` \| `luto` |
| `quando` | ISO | criação |
| `expira` | `YYYY-MM-DD` | por omissão: 3/7/14/10 dias conforme categoria |

**Invariantes**
- I-04: `expira < hoje` → não é devolvido por `/noticias`. Fica visível na
  gestão, marcado. `[F]`
- I-05: `categoria: luto` exige consentimento da família — regra humana, não
  técnica. Avisada na página de gestão. Ver R-06.

## E-03 Notícia — efémera, cache 3 h

`id`, `titulo`, `resumo`, `imagem`, `data`, `link`, `ordem`. Nunca persistida.

**Invariante I-06:** o portal só guarda título, resumo, data, imagem e
ligação. **Nunca o corpo do artigo.** `[F]` (D-09)

## E-04 Sugestão — KV `sug:<ts>-<rand>`

`id`, `tipo` (`melhoria`\|`evento`\|`erro`\|`outro`), `texto` ≤2000,
`nome` ≤120 (opcional), `contacto` ≤160 (opcional), `quando`, `tratada`.

**Invariante I-07:** contém dados pessoais voluntários. Devem ser apagados
depois de tratados. Sem apagamento automático — `[L]`, ver R-07.

## E-05 PedidoCarta — efémero, nunca persistido

Enviado ao Worker: `assunto`, `tipo` (`queixa`\|`pedido`), `rubrica`, `pedido`,
`descricao` ≤1500, `local` ≤200, `desde` ≤120, `fotos`, `grupo`.

**Invariante I-09:** `local` vazio é enviado vazio e **nunca substituído por um
texto de recheio**. O Worker é instruído a não escrever ponto de localização
quando não há local. `[F]` (D-019)

**Invariante I-08 (crítica):** `nome`, `morada`, `telefone` e `email` **não
constam deste objecto**. Verificado por teste. `[F]` (D-05)

## E-06 FichaGuia e E-07 Contacto — estáticos no portal

E-06: `cat`, `t_pt`/`t_en`, `k_pt`/`k_en` (palavras de procura), `c_pt`/`c_en`.
25 fichas. E-07: `q_pt`/`q_en`, `s_pt`/`s_en`, `num`, `urg`, `mapa`.
25 contactos. Nomes de instituições não traduzidos (D-02).

## Retenção

| Dado | Onde | Quanto tempo | Quem apaga |
|---|---|---|---|
| Dados pessoais da carta | memória do browser | a sessão | ninguém, some |
| Sugestões | KV | indefinido `[L]` | Hugo, à mão |
| Avisos | KV | indefinido após expirar `[L]` | Hugo, à mão |
| Agenda/notícias | cache CF + service worker | 6 h / 3 h | automático |
