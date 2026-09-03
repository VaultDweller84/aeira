> **A Eira** · portal da Aldeia de João Pires, concelho de Penamacor.
> Ficheiro `04-FLOWS.md` — fluxos F-01 a F-09.
> Decisões em `decisions/ADR-*.md`. Mapa em `LEIA-PRIMEIRO.md`.

# 04 — Fluxos

## F-01 Munícipe escreve uma queixa `[F]` testado

```
Separador Queixa → escolhe assunto (13)
  ├─ assunto de apoio social: não há carta — mostra-se a Ação Social do
  │   Município (telefone, email, morada, horário) e a ficha do guia. D-019
  └─ restantes: o formulário adapta-se ao tipo (perguntas 6 e 7, cópia à
      Junta) → 8 campos em linguagem corrente
  → «Escrever a minha carta»
      ├─ com Worker: espera ≤25 s → corpo redigido pela IA
      └─ sem Worker / falha / timeout: corpo pelo modelo + aviso tranquilizador
  → portal monta cabeçalho + corpo + assinatura COM os dados pessoais (locais)
  → mostra editável, com «leia antes de enviar»
  → copiar | email (Presidente + Secretaria, cc Junta) | imprimir
```
Ponto de fricção conhecido: quem não tem email tem de imprimir e entregar em
mão. Coberto pelo aviso com morada, horário da Junta e o pedido de
comprovativo de entrada.

## F-02 Munícipe procura como se faz `[F]` testado
Escreve uma palavra (sem acentos, em qualquer das duas línguas) ou toca numa
categoria → acordeão com passos numerados, telefones clicáveis, prazos.

## F-03 Munícipe lê as novidades — **fluxo diário, o mais importante** `[F]`
Abre o portal → cai directamente em Notícias e avisos (D-12) → avisos da terra
em cima com tempo relativo e NOVO até 48 h → notícias do Município → ligações
à imprensa regional. Sem rede: última versão guardada.

## F-04 Munícipe consulta a agenda e guarda um evento `[F]` testado
Agenda → meses a partir do actual → toca no evento → detalhe com descrição,
mapa, `.ics` (hora flutuante), Google Agenda, partilha, e ligação à fonte.

## F-05 Munícipe envia uma sugestão `[F]` testado
4 tipos → texto → nome e contacto opcionais → Worker/KV, ou mailto se não
houver Worker.

## F-06 Gestor publica um aviso `[F]` testado
`/admin?chave=…` no telemóvel → título, texto, tipo, validade → publicado.
Aparece em `/noticias` de imediato (os avisos não passam por cache).
Botões «Tirar já do portal» e «Apagar».

## F-07 Organizador acrescenta um evento — **fluxo de sustentabilidade**
Membro da Junta ou comissão de festas → aplicação Google Calendar do próprio
telemóvel → cria evento no calendário partilhado → aparece no portal em ≤6 h.
**Sem passar pelo Hugo e sem tocar em código.** É o que evita R-01.

## F-08 Instalação no telemóvel `[F]`
`instalar.html`: botão de instalação directa quando o browser o permite;
senão passos por marca (Android/iPhone); APK a seguir, com os avisos.

## F-09 Publicar uma versão nova `[F]`
Editar → **mudar `VERSAO` no `sw.js`** → publicar. Sem isso, quem tem o portal
instalado continua a ver a versão antiga. Falha recorrente e difícil de
diagnosticar — ver R-08.
