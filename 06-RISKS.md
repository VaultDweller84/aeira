> **A Eira** · portal da Aldeia de João Pires, concelho de Penamacor.
> Ficheiro `06-RISKS.md` — registo de riscos R-01 a R-13.
> Decisões em `decisions/ADR-*.md`. Mapa em `LEIA-PRIMEIRO.md`.

# 06 — Riscos

Escala 1-5. Score = Probabilidade × Impacto.

| ID | Risco | P | I | Score | Mitigação | Sinal de alerta | Dono |
|---|---|---|---|---|---|---|---|
| R-01 | **Mantenedor único.** Ninguém além do Hugo publica avisos ou eventos; o portal desactualiza-se e morre | 4 | 5 | **20** | Dar edição do Google Calendar e a chave de gestão a 2-3 pessoas da terra (F-07) | duas semanas sem avisos novos | Hugo |
| R-02 | **Robô da Câmara parte.** O site muda e agenda/notícias perdem a fonte principal | 4 | 3 | **12** | Degradação já garantida; etiqueta de fonte; verificação periódica | `/agenda` ou `/noticias` devolve 0 itens da Câmara | Hugo |
| R-03 | **Datas mal lidas** pelo robô (reconhecimento de padrões no texto) levam alguém a uma festa no dia errado | 3 | 4 | **12** | Aviso visível nos eventos da Câmara + ligação à fonte | queixa de munícipe | Hugo |
| R-04 | **Adopção nula.** Portal publicado e ninguém usa | 3 | 5 | **15** | Notícias como separador inicial; avisos frequentes; lançamento no grupo de Facebook | <10 visitas/semana ao fim de um mês | Hugo |
| R-05 | **Texto da IA distorce o que o munícipe quis dizer** e é assinado por ele | 3 | 4 | **12** | Texto sempre mostrado, editável, com aviso; instruções proíbem inventar factos | queixa; carta com factos que o munícipe não escreveu | Hugo |
| R-06 | **Falecimento publicado sem consentimento da família** | 2 | 5 | **10** | Aviso permanente na página de gestão; regra escrita | reacção da família | quem publica |
| R-07 | **Dados pessoais acumulados em KV** (nomes e contactos em sugestões) sem política de retenção | 3 | 3 | **9** | Apagar periodicamente à mão | KV com centenas de registos antigos | Hugo |
| R-08 | **Esquecer de mudar `VERSAO` no `sw.js`** e os telemóveis ficarem presos a uma versão antiga | 4 | 2 | **8** | Documentado em F-09 e no INSTALAR | «não vejo a alteração» | Hugo |
| R-09 | **Chave de gestão exposta.** Quem souber o endereço publica avisos no portal | 2 | 4 | **8** | Chave longa, `noindex`, nunca em ficheiro do site | avisos que ninguém publicou | Hugo |
| R-10 | **Quota da IA esgotada ou fornecedor deixa de ser gratuito** | 3 | 2 | **6** | Degradação para modelo; troca de fornecedor por variável | erros 429/402 no Worker | Hugo |
| R-11 | **APK distribuída ensina a ignorar avisos de segurança**, expondo os mais vulneráveis a burlas | 3 | 4 | **12** | PWA como via principal; passo de desligar a autorização; linguagem explícita | — | Hugo |
| R-12 | **Confusão com fonte oficial.** Alguém toma o portal por site da Câmara | 2 | 3 | **6** | Rodapé identifica a origem comunitária; ligações à fonte oficial | — | Hugo |
| R-13 | **Modelo de IA desligado ou restringido pelo fornecedor.** O nome do modelo escrito no `worker.js` deixa de ser aceite e o assistente de escrita cala-se | 5 | 2 | **10** | Degradação para modelo escrito à mão (ADR-007); segunda tentativa sem `thinkingConfig`; diagnóstico escrito em comentário no próprio `worker.js` | portal responde `{"erro":"fornecedor","estado":404}` | Hugo |
| R-14 | **Desalinhamento entre `CONFIG.API` e `ORIGENS`.** Mudar o endereço do site ou do Worker sem mudar o outro | 3 | 3 | **9** | Ambos anotados no ADR-014; verificar as duas pontas em cada mudança de endereço | cartas, agenda e sugestões param **mas as notícias continuam** | Hugo |

## Top 3 por score

1. **R-01 (20)** — mantenedor único. Não é um risco técnico e não se resolve
   com código. É o risco que decide se isto existe daqui a um ano.
2. **R-04 (15)** — adopção. Um portal correcto que ninguém abre falhou.
3. **R-02 / R-03 / R-05 / R-11 (12)** — empatados.

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
