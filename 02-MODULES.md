> **A Eira** · portal da Aldeia de João Pires, concelho de Penamacor.
> Ficheiro `02-MODULES.md` — módulos M-01 a M-04 com IDs estáveis.
> Decisões em `decisions/ADR-*.md`. Mapa em `LEIA-PRIMEIRO.md`.

# 02 — Módulos

## M-01 Portal `index.html`

Ficheiro único, sem dependências externas, ~146 KB. Estático.

| ID | Módulo | Estado | Depende de |
|---|---|---|---|
| M-01.1 | Gerador de cartas para a Câmara | feito | M-02.1 (opcional) |
| M-01.2 | Guia «Como se faz» — 25 fichas, 4 categorias | feito | — |
| M-01.3 | Agenda cultural | feito | M-02.2 (opcional) |
| M-01.4 | Notícias e avisos (separador inicial) | feito | M-02.3 |
| M-01.5 | Sugestões | feito | M-02.4 (opcional) |
| M-01.6 | Telefones úteis — 25 contactos | feito | — |
| M-01.7 | i18n, temas, tamanho de letra, navegação | feito | — |

### M-01.1 Gerador de cartas
13 assuntos pré-definidos. 8 campos. Monta a exposição formal localmente;
o corpo pode vir da IA ou do modelo. Saídas: copiar, mailto (com cópia à
Junta), imprimir. Opção de subscrição por vários moradores.

### M-01.2 Guia
Procura insensível a acentos e bilingue simultânea (procurar «agua» ou
«water» encontra a mesma ficha). Filtros por categoria. Acordeão.

### M-01.3 Agenda
Funde eventos fixos (array `FESTAS`, 21 entradas) com remotos. Agrupa por mês
a partir do mês actual, dando a volta ao ano com indicação do ano. Vista de
detalhe com mapa, `.ics`, Google Agenda e partilha.

### M-01.4 Notícias e avisos
Avisos da terra em cima (4 categorias, cor por categoria, etiqueta NOVO até
48 h, tempo relativo), notícias do Município em baixo (título, resumo, data,
ligação externa). Termina com ligações à imprensa regional.

### M-01.5 Sugestões
4 tipos. Nome e contacto opcionais. Degrada para mailto.

### M-01.7 Camada transversal
- Línguas: `pt` (defeito) / `en`; detecta o idioma do dispositivo no arranque.
- Temas: `sereno` (defeito), `terra`, `contraste`. Só variáveis CSS.
- Letra: 19 / 23 / 28 px, aplicada à raiz.
- Navegação: barra inferior de 6 separadores em telemóvel; grelha de cartões
  em ecrã largo.

## M-02 Worker `worker.js`

Cloudflare Worker, ~34 KB, sem dependências.

| ID | Rota | Método | Cache | Travão |
|---|---|---|---|---|
| M-02.1 | `/carta` | POST | — | 20/h/IP |
| M-02.2 | `/agenda` | GET | 6 h | — |
| M-02.3 | `/noticias` | GET | 3 h (só notícias) | — |
| M-02.4 | `/sugestao` | POST | — | 10/h/IP |
| M-02.5 | `/admin` | GET/POST | — | chave |

Notas:
- M-02.1 **não aceita prompts**. Recebe campos fixos e escreve ele as
  instruções para o modelo (D-04).
- M-02.3 lê os avisos **sempre frescos**: um corte de água não espera 3 h.
- M-02.5 escapa todo o HTML de entrada. Verificado. `[F]`

## M-03 PWA

`manifest.webmanifest`, `sw.js` (v2), `icone-192/512/maskable.png`,
`instalar.html`. Estratégias: rede-primeiro para páginas e dados, cache
primeiro para estáticos, `CACHE_DADOS` separado para `/agenda` e `/noticias`.
Nunca guarda `/carta` nem `/sugestao`.

## M-04 Fontes externas

| ID | Fonte | Natureza | Fragilidade |
|---|---|---|---|
| M-04.1 | Google Calendar público (ICS) | contrato estável | baixa |
| M-04.2 | cm-penamacor.pt (HTML) | scraping | **alta** — R-02 |
| M-04.3 | Gemini ou Groq | API | média (quota, preços) |
| M-04.4 | Cloudflare KV | armazenamento | baixa |
