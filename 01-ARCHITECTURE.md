> **A Eira** · portal da Aldeia de João Pires, concelho de Penamacor.
> Ficheiro `01-ARCHITECTURE.md` — arquitectura, fronteiras de confiança e camadas de degradação.
> Decisões em `decisions/ADR-*.md`. Mapa em `LEIA-PRIMEIRO.md`.

# 01 — Arquitectura

## Princípio

Duas peças com responsabilidades separadas por uma razão de segurança: o
portal é público e não pode guardar segredos; o Worker guarda os segredos e
nunca é um proxy genérico.

## Vista geral

```
        TELEMÓVEL DO MUNÍCIPE
        ┌──────────────────────────────────────┐
        │  M-01 Portal (HTML/CSS/JS, 1 ficheiro)│
        │  ┌────────────────────────────────┐  │
        │  │ dados pessoais (nome, morada,  │  │  nunca saem
        │  │ telefone, email) — só aqui     │  │  ◄────────────
        │  └────────────────────────────────┘  │
        │  M-03 PWA: manifest + service worker │
        │  cache: casca + última agenda/notícias│
        └───────────────┬──────────────────────┘
                        │ HTTPS, CORS travado a ORIGENS
                        ▼
        ┌──────────────────────────────────────┐
        │  M-02 Worker (Cloudflare)             │
        │  /carta  /agenda  /noticias           │
        │  /sugestao  /admin                    │
        │  segredos: API_KEY, CHAVE_ADMIN       │
        └──┬────────┬─────────┬─────────┬──────┘
           │        │         │         │
           ▼        ▼         ▼         ▼
      M-04.3    M-04.1    M-04.2    M-04.4
      IA        Google    Site da   Cloudflare
      (Gemini   Calendar  Câmara    KV
       ou Groq) (ICS)     (HTML)    (avisos+sugestões)
```

## Fronteiras de confiança

| Fronteira | O que atravessa | O que nunca atravessa |
|---|---|---|
| Portal → Worker `/carta` | assunto, descrição, local, desde, fotos, grupo | nome, morada, telefone, email |
| Portal → Worker `/sugestao` | tipo, texto, nome*, contacto* | — (*opcionais, dados do próprio) |
| Worker → IA | descrição do problema + instruções escritas pelo Worker | prompt do cliente, dados pessoais |
| Worker → Portal | corpo da carta, eventos, avisos, notícias | segredos |
| Browser → armazenamento | nada | tudo (sem localStorage, sem cookies) |

## Camadas de degradação

Cada linha continua a funcionar quando a de cima falha. É a propriedade
central do sistema (D-07).

| Falha | Comportamento |
|---|---|
| IA indisponível ou lenta (>25 s) | carta feita pelo modelo escrito à mão + aviso |
| **Modelo de IA desligado ou restringido** (R-13) | idem — o portal responde `erro: fornecedor` e cai no modelo |
| **Fornecedor recusa o `thinkingConfig`** | Worker repete o pedido sem esse campo antes de desistir |
| `CONFIG.API` vazio | tudo em modo simples, sem espera nem aviso |
| Worker em baixo | agenda mostra romarias fixas; notícias mostram a última cache |
| Sem rede | service worker serve casca + última agenda/notícias |
| KV desligado | sugestões abrem o email da pessoa |
| Robô da Câmara parte | agenda e notícias perdem essa fonte, mantêm as outras |
| Google Calendar vazio | agenda mantém romarias fixas e Câmara |

A degradação existe **dentro** da chamada à IA e não só à volta dela. Foi
lição do dia da publicação: um parâmetro de afinação recusado pelo fornecedor
bastaria para ninguém receber carta nenhuma. Ver `06-RISKS.md`, R-13.

## Grafo de dependências

```
M-01.1 carta      → M-02.1 → M-04.3
M-01.3 agenda     → M-02.2 → M-04.1, M-04.2
M-01.4 notícias   → M-02.3 → M-04.2, M-04.4
M-01.5 sugestões  → M-02.4 → M-04.4
M-01.2 guia       → (nenhuma)
M-01.6 telefones  → (nenhuma)
M-03 PWA          → M-01
M-02.5 admin      → M-04.4
```

Sem ciclos. `[F]`

**Pontos únicos de falha:**

| PUF | Consequência | Mitigado por |
|---|---|---|
| Cloudflare Worker | perde IA, agenda remota, notícias, sugestões | camadas de degradação; portal continua útil |
| M-04.4 KV | perde avisos e sugestões | degradação para mailto; avisos não têm alternativa `[L]` |
| Mantenedor único | tudo pára | R-01 — metade técnica resolvida pelo ADR-015; a outra metade continua |
| ~~Código num disco só~~ | — | **resolvido a 2/9/2026:** repositório público, ADR-015 |
| Conta Cloudflare única | site, Worker e KV caem juntos | `[L]` sem mitigação; o código está fora dela desde o ADR-015 |

## Alojamento e publicação

**Decidido — ver ADR-014 (onde) e ADR-015 (como).** Cloudflare Pages, na mesma
conta do Worker, com o código num repositório Git público. O requisito duro
era HTTPS: sem ele não há PWA nem cache offline.

| Coisa | Nome | Endereço |
|---|---|---|
| Repositório | `VaultDweller84/aeira` | `https://github.com/VaultDweller84/aeira` |
| Site (Pages) | `a-eira` | `https://a-eira.pages.dev` |
| Worker | `aeira` | `https://aeira.hugompalmeida.workers.dev` |
| KV | `aeira-sugestoes` | ligado como `SUGESTOES` |
| Domínio | `aeira.pt` | decidido no ADR-016, **por comprar** |

**Como se publica.** Commit no ramo `main` → o Cloudflare Pages constrói e põe
no ar a pasta `codigo/`. Sem comando de construção. Cada alteração dentro de
`codigo/` obriga a mudar a `VERSAO` no `sw.js` **no mesmo commit** (R-08).

**O `worker.js` está fora deste caminho.** Vive em `worker/`, o Pages não lhe
toca, e continua a ser actualizado à mão no painel do Cloudflare. Regra para
não haver duas verdades: a alteração faz-se no ficheiro e vai a commit
**antes** de ser colada no painel (R-16).

**Acoplamento a vigiar (R-14):** o `CONFIG.API` no `index.html` aponta para o
Worker, e a variável `ORIGENS` no Worker autoriza o site. São duas pontas do
mesmo fio. Mudar uma sem a outra deixa o portal com ar de funcionar — as
notícias continuam a aparecer — enquanto as cartas, a agenda e as sugestões
falham em silêncio.

**Sobre a casa (R-15):** a Cloudflare está a empurrar os sites estáticos para
os Workers e trata os Pages como o caminho antigo. O portal é HTML estático
puro, portanto a mudança, quando vier, é configuração e não reescrita — mas é
uma mudança que há-de vir. T-18.
