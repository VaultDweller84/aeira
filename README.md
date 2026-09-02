# A Eira

Portal comunitário da **Aldeia de João Pires**, concelho de Penamacor, Castelo Branco.

Serve gente de meia-idade e mais velha, com conhecimentos de informática muito
básicos. Seis áreas: notícias e avisos da terra, gerador de queixas para a
Câmara, guia «como se faz», agenda cultural do concelho, telefones úteis e
sugestões.

**Isto não é um site oficial da Câmara Municipal de Penamacor nem da União de
Freguesias.** É um projecto de um morador.

---

## Como está organizado

| Pasta | O que lá está |
|---|---|
| `codigo/` | **Tudo o que vai para o ar:** `index.html`, `instalar.html`, `manifest.webmanifest`, `sw.js` e os ícones. Só isto. |
| `worker/` | `worker.js` — o Cloudflare Worker que guarda a chave da IA e fala com o exterior |
| `decisions/` | Os ADR — o porquê de cada decisão |
| raiz | Documentação numerada `00-` a `08-`, `CHANGELOG.md`, `INSTALAR.md` |

Nada que não seja para publicar pode ficar dentro de `codigo/`: o Cloudflare
Pages publica essa pasta inteira, tal e qual.

## Como se publica

O site publica-se sozinho: cada alteração enviada para o ramo `main` faz o
Cloudflare Pages pôr a versão nova no ar.

Definições do projecto no Cloudflare Pages:

- Comando de construção (*build command*): **vazio**
- Pasta de saída (*build output directory*): **`codigo`**

**Sempre que se muda um ficheiro dentro de `codigo/`, muda-se também a constante
`VERSAO` no `sw.js`.** Sem isso, quem já tem o portal instalado no telemóvel
continua a ver a versão antiga — o *service worker* guarda cópia e não vai
buscar nada de novo.

O `worker/worker.js` **não** é publicado pelo Pages. Actualiza-se à parte, no
painel do Cloudflare Workers.

## Como se escrevem os commits

Um *commit* é uma alteração gravada no histórico, com uma mensagem a dizer o
que mudou. A mensagem é escrita uma vez e lida durante anos — normalmente por
alguém a tentar perceber porque é que uma coisa está como está. Escreve-se para
esse leitor, não para o próprio dia.

Formato:

```
area: o que mudou

Porquê, em uma ou duas frases. O que se partia sem isto, ou que
decisão manda nisto.

IDs: M-02.1, R-13
```

**Áreas** — sempre uma destas: `portal` (o `index.html`), `worker`, `pwa`
(`sw.js`, `manifest`, `instalar.html`), `conteudo` (textos, telefones, festas),
`docs`, `adr`, `infra` (Cloudflare, repositório, domínio).

**Regras:**

1. **Em português**, como o resto do dossiê.
2. **A primeira linha diz o que mudou, no infinitivo, e cabe numa linha**
   (60 caracteres). Sem ponto final.
3. **O corpo diz o porquê, não o como.** O que se fez já se vê na alteração;
   o motivo, esse, morre com quem o fez se não ficar escrito.
4. **Um assunto por commit.** Se a mensagem precisar de um «e», são dois
   commits.
5. **Mudou alguma coisa em `codigo/`? O mesmo commit muda a `VERSAO` no
   `sw.js`.** Não é um passo à parte — sem isso os telemóveis já instalados
   continuam na versão antiga, e ninguém se queixa porque ninguém percebe.
6. **Mudou o produto? O mesmo commit muda o `CHANGELOG.md`.** Decisão nova?
   O ADR entra no mesmo commit.
7. **IDs no fim**, os que existem — `M-`, `E-`, `F-`, `R-`, `D-`, `T-`, `K-`.
   Não se inventam nem se renumeram.
8. **Nunca escrever uma chave, uma palavra-passe ou um endereço de gestão numa
   mensagem de commit.** Apagar o ficheiro a seguir não a tira do histórico —
   fica lá para sempre, e num repositório público fica à vista de toda a gente.

**Assim:**

```
worker: subir o limite de saída para 3000 tokens

Os modelos novos gastam o orçamento a «pensar» antes de escrever, e a
carta saía cortada a meio de uma frase. Pior do que um erro: seria
enviada assim à Câmara.

IDs: M-02.1
```

```
pwa: esconder o botão da APK

Apontava para um ficheiro que ainda não existe. Quem lá carregasse
apanhava uma página de erro — precisamente o utilizador menos capaz
de perceber porquê.

IDs: M-03, T-12
```

**Assim não:** `update`, `correcções`, `vários ajustes`, `alterado o
maxOutputTokens de 900 para 3000` (isso vê-se na alteração; o que falta é
saber porquê).

No GitHub pelo browser, a caixa de cima é a primeira linha e a de baixo é o
corpo.

## Configuração

Nenhuma chave, palavra-passe ou endereço secreto vive neste repositório, e não
pode passar a viver.

No `codigo/index.html`, a constante `CONFIG.API` aponta para o endereço público
do Worker. No Worker, as variáveis e segredos definem-se no painel do
Cloudflare:

| Nome | O que é | Onde se define |
|---|---|---|
| `ORIGENS` | endereços do site autorizados a chamar o Worker, separados por vírgulas | variável |
| `FORNECEDOR` | qual o fornecedor de IA em uso | variável |
| `ROBO_CAMARA` | origem da agenda lida no site da Câmara | variável |
| `CALENDARIO_ICS` | calendário público das festas | variável |
| `API_KEY` | chave do fornecedor de IA | **segredo** |
| `CHAVE_ADMIN` | chave da página de gestão | **segredo** |

`CONFIG.API` e `ORIGENS` têm de apontar um para o outro. Mudar um sem o outro
parte as cartas, a agenda e as sugestões **em silêncio**, deixando as notícias a
funcionar — e é o género de avaria de que ninguém dá conta. Ver `06-RISKS.md`,
R-14.

## Princípios que não se contornam

1. **Dados pessoais não saem do telemóvel.** Nome, morada, telefone e email
   nunca são enviados para serviço nenhum. A carta é montada no browser.
2. **Nada é indispensável.** Se a IA falhar, se o Worker cair, se não houver
   rede, o portal continua a servir.
3. **Nomes de terras, santos, festas e instituições não se traduzem** — em
   inglês também se lê *A Eira*, *Nossa Senhora da Graça* e *Junta de
   Freguesia*, com a explicação ao lado.
4. **A IA nunca fala na voz do portal sobre factos oficiais.** A carta gerada é
   sempre mostrada, editável, com aviso para ler antes de enviar.
5. **Sem contas, sem palavras-passe, sem armazenamento no browser.**
6. Telemóvel como caso base. Português de Portugal e inglês do Reino Unido.

O porquê de cada uma está em `decisions/`.

---

*A Eira is a community portal for the village of Aldeia de João Pires
(Penamacor, Portugal). It is not an official council website. Place, saint,
feast and institution names are never translated.*
