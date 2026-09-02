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
