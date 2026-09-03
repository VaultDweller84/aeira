# Portal da Aldeia de João Pires — guia de instalação

Tudo funciona sem configuração nenhuma. Se publicar só os ficheiros e não fizer
mais nada, o portal já serve: as cartas saem por modelo, a agenda mostra as
romarias de todos os anos, e as sugestões abrem o email da pessoa. Só a página de
notícias fica vazia — essa precisa mesmo do Worker.

Este guia é para ligar as partes que precisam de serviços: o assistente de escrita,
a agenda cultural, as notícias e avisos, e a caixa de sugestões. E, no fim, para
gerar a APK.

---

## Os ficheiros

Publique estes, todos na mesma pasta:

| Ficheiro | O que é |
|---|---|
| `index.html` | o portal |
| `instalar.html` | a página que ensina a pôr o portal no telemóvel |
| `manifest.webmanifest` | ficha da aplicação: nome, cores, ícones |
| `sw.js` | o que faz o portal funcionar sem rede |
| `icone-192.png` `icone-512.png` `icone-maskable.png` | ícones |

Fora da pasta pública, para si:

| Ficheiro | O que é |
|---|---|
| `worker.js` | o proxy do Cloudflare, com as cinco rotas |
| `INSTALAR.md` | isto |

**Tem de ser servido por HTTPS.** Sem isso o telemóvel não deixa instalar a
aplicação nem guardar nada para funcionar sem rede. O GitHub Pages, o Netlify e o
Cloudflare Pages dão HTTPS de graça.

---

## Passo 1 — Publicar o Worker

1. Conta gratuita em <https://dash.cloudflare.com>.
2. **Compute (Workers)** → **Create** → **Start with Hello World** → **Deploy**.
   O nome em uso é `aeira`.
3. **Edit code**, apague tudo, cole o `worker.js`, **Deploy**.
4. Guarde o endereço. O actual é `https://aeira.hugompalmeida.workers.dev`.

> ⚠️ **Depois de cada Deploy, vá a Deployments e confirme que a versão nova
> ficou como _Active deployment_.** O Cloudflare guarda versões sem as pôr a
> servir — sobretudo quando se acrescentam variáveis. Se não estiver activa,
> no menu `...` dessa versão escolha **Promote version**. Foi a primeira
> armadilha em que caímos no dia da publicação: tudo configurado, e o Worker
> a servir a versão anterior.

Depois, no portal, procure o bloco `CONFIG` logo no início do JavaScript e ponha
lá esse endereço, **sem barra no fim**:

```js
var CONFIG = {
  API: 'https://aeira.hugompalmeida.workers.dev',
  TEMPO_LIMITE: 25000
};
```

É a única alteração ao portal. As rotas — `/carta`, `/agenda`, `/noticias` e
`/sugestao` — saem daí sozinhas.

---

## Passo 2 — Variáveis do Worker

No painel do Worker: **Settings** → **Variables and Secrets**.

| Nome | Valor | Tipo |
|---|---|---|
| `ORIGENS` | o endereço do portal, sem barra no fim — hoje `https://aeira-portal.pages.dev` | Text |
| `FORNECEDOR` | `gemini` ou `groq` | Text |
| `API_KEY` | a chave do fornecedor (Passo 3) | **Secret** |
| `CALENDARIO_ICS` | endereço `.ics` do Google Calendar (Passo 4) | Text |
| `ROBO_CAMARA` | `sim` para ler a agenda **e as notícias** da Câmara, `nao` para desligar | Text |
| `CHAVE_ADMIN` | uma palavra-passe longa que invente, para publicar avisos e ver sugestões | **Secret** |

**Carregue em Deploy outra vez.** As variáveis só passam a valer depois disso.

Sobre `ORIGENS`: é a lista de sites autorizados a usar o Worker, separados por
vírgula. É isto que impede outra pessoa de apontar um site qualquer ao seu Worker
e gastar-lhe a quota. Para testar no seu computador acrescente
`http://localhost:8000`. Não deixe em branco.

---

## Passo 3 — Chave do assistente de escrita

Escolha **um**. Ambos têm nível gratuito suficiente para uma aldeia.

> ⚠️ **O nome do modelo é a peça que mais depressa apodrece.** A Google
> desliga modelos ao fim de um ou dois anos e chega a reservar os mais
> antigos a quem já os usava — uma chave nova recebe **404 mesmo para modelos
> que aparecem na sua própria listagem**. Não confie na documentação da
> Google sobre o que a *sua* chave pode usar. Pergunte à chave: abra numa
> janela anónima
> `generativelanguage.googleapis.com/v1beta/models?key=A-SUA-CHAVE`, escolha
> um nome com «flash» que tenha `generateContent` entre os métodos
> suportados, e escreva-o na constante `MODELOS` do `worker.js`. O modelo em
> uso é o `gemini-3.5-flash`. Enquanto isto estiver partido, as cartas saem
> pelo modelo escrito à mão e ninguém fica sem serviço.

**Gemini (sugestão):** <https://aistudio.google.com/apikey> → **Create API key**.
Não pede cartão. Note que no nível gratuito a Google pode usar os pedidos para
melhorar os modelos — como o portal só envia a descrição do problema e nunca
nome, morada ou telefone, o risco é baixo, mas é justo sabê-lo.

**Groq:** <https://console.groq.com/keys> → **Create API Key**. Responde mais
depressa; tem limites por minuto.

Se um dia quiser trocar, muda `FORNECEDOR` e `API_KEY` e faz Deploy. O portal não
precisa de alteração.

---

## Passo 4 — A agenda cultural

A agenda junta três fontes numa lista só.

**1. As romarias de todos os anos** já estão dentro do portal, no array `FESTAS`.
Funcionam sem rede e sem Worker. Se quiser acrescentar ou corrigir, é aí.

**2. Um Google Calendar público** — é por aqui que entra tudo o que se organiza
no concelho e que a Câmara não publica: arraiais, provas, convívios, reuniões de
associações.

1. Em <https://calendar.google.com>, crie um calendário novo:
   **Outros calendários → +  → Criar calendário**. Chame-lhe *Agenda de Penamacor*.
2. Abra **Definições** desse calendário → **Autorizações de acesso** →
   ligue **Tornar disponível ao público**.
3. Ainda nas definições, desça até **Integrar calendário** e copie o
   **Endereço público em formato iCal** (termina em `/public/basic.ics`).
4. Cole esse endereço na variável `CALENDARIO_ICS` do Worker e faça **Deploy**.

O que a agenda aproveita de cada evento: o **título**, a **data e hora**, o
**local** (usado para o mapa — escreva-o como o escreveria no Google Maps, por
exemplo `Largo da Igreja, Aldeia de João Pires`) e a **descrição**.

**Isto é o que resolve o problema de fundo:** em **Definições → Partilhar com
pessoas específicas**, dê **«Fazer alterações a eventos»** a quem trata das festas
— alguém da Junta, da comissão de festas, do rancho. Passam a acrescentar eventos
pelo telemóvel, na aplicação Google Calendar que já conhecem, sem lhe pedir nada e
sem tocar em código. É a diferença entre um portal que depende de si e um portal
da terra.

**Horas e eventos que se repetem.** O Worker converte as horas do Google para
hora de Portugal — o ficheiro do Google escreve-as em hora universal ou com
etiqueta de fuso, e ler os algarismos tal e qual dava uma hora a menos no Verão
e o **dia errado** em qualquer coisa depois da meia-noite. Eventos que se
repetem também funcionam: diários, semanais (incluindo «às quartas e sextas»),
mensais e anuais, com intervalo, número de repetições, data-limite e datas
saltadas. Ficam de fora regras raras — «na terceira quarta-feira do mês», por
exemplo. Quem precisar disso cria os eventos um a um: mais vale dar trabalho do
que inventar datas. São mostradas até 60 repetições de cada evento e até um ano
para a frente.

**3. A agenda da Câmara**, lida automaticamente uma vez de seis em seis horas.
Ligue ou desligue com `ROBO_CAMARA`.

> ⚠️ **Isto é o ponto frágil de todo o sistema.** A Câmara não publica RSS nem
> iCal, por isso o robô lê o HTML das páginas. As datas são apanhadas por
> reconhecimento de padrões no texto — funciona, mas pode enganar-se, sobretudo em
> eventos de vários dias. Por isso os eventos vindos da Câmara aparecem com a
> etiqueta *Câmara Municipal*, com um aviso a dizer para confirmar, e com ligação
> à página original. Se um dia a Câmara mudar o site, o robô deixa de trazer
> eventos — mas a agenda **não parte**: continuam a aparecer o Google Calendar e
> as romarias fixas. Vale a pena espreitar de vez em quando.
>
> Se a Câmara alguma vez publicar um feed em condições, diga-me e substitui-se o
> robô por dez linhas fiáveis.

---

## Passo 5 — As notícias e os avisos da terra

A página **Notícias e avisos** — o separador que abre por omissão, porque é o que
se lê todos os dias — junta duas coisas diferentes.

**Em cima, os avisos da terra.** Escreve-os na página de gestão (Passo 6): corte de
água, farmácia de serviço, missa mudada de hora, a carrinha que não vem. Cada aviso
apaga-se sozinho na data que escolher, para a página não encher de coisas velhas.
Os prazos por omissão são 3 dias para urgente, 7 para serviços, 14 para comunidade
e 10 para falecimentos.

**São estes avisos que fazem o portal ter leitores.** A Câmara publica duas a
quatro notícias por semana; isso não é leitura diária. O pequeno e o frequente é
que cria o hábito. Publique mesmo as coisas que lhe pareçam sem importância.

**Em baixo, as notícias do Município**, lidas do site da Câmara de três em três
horas — só o título, o resumo e a ligação. **O texto nunca é copiado para o
portal:** quem quiser ler vai ao site de origem. Liga-se e desliga-se com a mesma
variável `ROBO_CAMARA` da agenda.

Não raspamos os jornais regionais. A Reconquista e o Diário Digital de Castelo
Branco não publicam RSS e não têm secção por concelho, e copiar-lhes as manchetes
seria frágil e seria tirar-lhes o que os sustenta. Em vez disso a página termina
com ligações aos sites deles. Se um dia quiser mudar essa lista, está no HTML do
portal, na secção `id="noticias"`.

> **Uma coisa que decidimos não fazer:** resumir as notícias com o assistente de
> IA. Um erro num prazo de candidatura ou num valor de apoio, escrito na voz do
> portal, faz estragos reais em quem confia nele. Os títulos e resumos são os da
> Câmara, tal e qual.

---

## Passo 6 — As sugestões e a página de gestão

1. No Cloudflare: **Storage & Databases** → **KV** → **Create a namespace**.
   O nome em uso é `aeira-sugestoes`.
2. No Worker: **Settings** → **Bindings** → **Add** → **KV namespace**.
   - Variable name: `SUGESTOES` (tem de ser este nome)
   - KV namespace: o que acabou de criar
3. **Deploy**.

A mesma ligação KV guarda os avisos e as sugestões — não é preciso criar outra.

Para publicar avisos e ler as sugestões, abra:

```
https://aeira.hugompalmeida.workers.dev/admin?chave=A-SUA-CHAVE-ADMIN
```

A página tem três partes: um formulário para publicar avisos, a lista dos avisos
já publicados (com botões para tirar já do portal ou apagar), e as sugestões dos
munícipes. Funciona bem no telemóvel — pode publicar um aviso do café.

Não está listada em lado nenhum e tem `noindex`, mas **quem souber o endereço
entra** — trate a chave como uma palavra-passe. Guarde-a no gestor de senhas e não
a ponha em nenhum ficheiro do site.

**Sobre publicar falecimentos:** é a informação que mais faz abrir um portal destes
numa aldeia, e é a mais sensível. Tenha o acordo da família antes de publicar. Um
nome publicado sem autorização não se apaga da memória de ninguém, e o portal
perde de vez a confiança que demorou a ganhar. A página de gestão tem esse aviso à
vista, de propósito.

O nome e o contacto que o munícipe deixa são opcionais e servem só para lhe
responder. Como isso são dados pessoais, apague as sugestões já tratadas de vez em
quando, em vez de as deixar lá para sempre.

---

## Passo 7 — A aplicação no telemóvel

Não é preciso fazer nada: com os ficheiros publicados em HTTPS, o Android e o
iPhone já oferecem instalar. A página `instalar.html` ensina o processo às pessoas.

**Sempre que publicar uma versão nova do portal, mude o número da versão no
`sw.js`:**

```js
const VERSAO = 'v1';   →   const VERSAO = 'v2';
```

Se se esquecer disto, os telemóveis que já têm o portal instalado continuam a
mostrar a versão antiga, porque a têm guardada. É o erro mais comum e o mais
irritante de diagnosticar.

---

## Passo 8 — Gerar a APK

Só depois do site estar publicado em HTTPS.

1. Vá a <https://www.pwabuilder.com>.
2. Escreva o endereço do portal e carregue em **Start**.
3. Corrija o que ele apontar (deve estar tudo bem — o manifesto e o service
   worker já vão preparados).
4. **Package for stores** → **Android** → **Generate**.
5. Escolha **Signed APK**. Guarde o ficheiro `signing.keystore` e a palavra-passe
   **num sítio seguro** — sem eles não consegue publicar actualizações da mesma
   aplicação, nunca mais.
6. Do ficheiro `.zip` que descarrega, tire o `.apk` e ponha-o no site em
   `app/a-eira.apk` — é o caminho que a página `instalar.html` já espera.
7. **Volte a ligar a secção da APK no `instalar.html`.** Está comentada de
   propósito desde 1/9/2026: sem o ficheiro lá, o botão dava erro 404 a quem
   carregasse. As instruções para a repor estão no próprio ficheiro, no sítio.

Duas notas honestas sobre a APK:

- **Cada actualização obriga a reinstalar à mão.** O PWA actualiza-se sozinho, a
  APK não. Quem instalar a APK fica com a versão desse dia até voltar a
  descarregar. Para um portal que se vai mexendo, isto é um problema real.
- **O Play Protect vai avisar.** É normal em aplicações fora da loja. Mas repare
  no que isso significa: está a ensinar pessoas de idade a ignorar avisos de
  segurança do telemóvel. É por essa mesma porta que entram as burlas por SMS que
  andam a apanhar tanta gente. A página `instalar.html` foi escrita a apontar
  primeiro o caminho do «Adicionar ao ecrã principal» e a explicar isto —
  recomendo que a deixe assim.

---

## O que o Worker protege

- **As chaves nunca chegam ao browser.** Ficam no Cloudflare.
- **A rota da carta não aceita textos livres.** Recebe campos com nomes fixos e é
  o Worker que escreve as instruções para o modelo. Ninguém pode usar a sua chave
  para gerar outra coisa.
- **Só responde aos sites em `ORIGENS`.**
- **Travões por endereço de internet:** 20 cartas e 10 sugestões por hora.
- **A página de gestão escapa todo o HTML** que lhe for escrito, seu ou de terceiros.
- **Limites de tamanho** em todos os campos.
- **Dados pessoais não passam pelo Worker.** Nome, morada, telefone e email de
  quem escreve a carta ficam no telemóvel — a carta é montada lá. O Worker só vê
  a descrição do problema e o local.

## O que continua a depender de si

- Vigiar o consumo do fornecedor nos primeiros dias.
- Espreitar as sugestões e apagar as já tratadas.
- **Publicar avisos.** É a única parte que não se automatiza — e é a que decide se
  o portal é lido todos os dias ou uma vez por mês.
- Confirmar, de tempos a tempos, que o robô da Câmara ainda traz eventos.
- Mudar a `VERSAO` no `sw.js` a cada publicação.
- Confirmar todos os anos, em Março, o prazo da limpeza de terrenos que está no
  guia — muda de ano para ano.

---

## Afinar as cartas

As instruções dadas ao modelo estão na constante `SISTEMA`, no `worker.js`, em
português e comentadas. É aí que se muda o tom, o número de pontos ou o que o
modelo pode e não pode dizer. Mexer aí não obriga a republicar o portal — só o
Worker.

## Desligar seja o que for

- **Assistente de escrita:** ponha `API: ''` no portal, ou tire a `API_KEY`.
- **Robô da Câmara:** `ROBO_CAMARA` = `nao`.
- **Google Calendar:** apague a `CALENDARIO_ICS`.
- **Sugestões:** tire a ligação KV — o formulário passa a abrir o email da pessoa.
- **Notícias do Município:** `ROBO_CAMARA` = `nao`. Os avisos da terra continuam.

Em qualquer dos casos o portal continua a funcionar. Foi feito assim de propósito:
nenhuma peça é indispensável.
