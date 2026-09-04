> **A Eira** · portal do concelho de Penamacor.
> Ficheiro `00-PROJECT.md` — visão, objectivo, público, restrições e não-objectivos.
> Decisões em `decisions/ADR-*.md`. Mapa em `LEIA-PRIMEIRO.md`.

# 00 — Projecto

## Identificação

| Campo | Valor |
|---|---|
| Nome | **A Eira** — portal do concelho de Penamacor (D-013, D-023) |
| Dono | Hugo Almeida `[F]` |
| Território | Concelho de Penamacor, Castelo Branco — nove freguesias e uniões `[F]` |
| Início | Setembro de 2026 `[F]` |
| Estado | No ar em `a-eira.pages.dev`; conteúdo do concelho por completar `[F]` |
| Âmbito | Concelho de Penamacor (D-023). Nasceu em Aldeia de João Pires `[F]` |
| Domínio alvo | `aeira.pt` — disponibilidade por verificar `[L]` |

## Origem

No grupo de Facebook da aldeia, criado por gente da terra, é visível que as
pessoas têm dificuldade em fazer uma queixa formal à Câmara ou pedidos
específicos. O Hugo ajudou conterrâneos a escrever ao Presidente da Câmara de
Penamacor, mas quer que passem a conseguir sozinhos. `[F]`

## Objectivo

Dar autonomia administrativa e informativa aos munícipes do concelho de
Penamacor, com uma ferramenta que uma pessoa de 70 anos com um telemóvel
consiga usar sem ajuda.

**Resultado mensurável** `[A]` — proposta, a confirmar em `07-METRICS.md`:
que ao fim de seis meses o portal seja usado por pelo menos 40 pessoas
distintas por semana e que pelo menos 10 exposições à Câmara tenham saído
dele.

## Público-alvo

| Segmento | Descrição | Peso |
|---|---|---|
| P-01 | Residentes do concelho, de meia-idade e mais velhos, informática muito básica | primário `[F]` |
| P-02 | Emigrantes e filhos da terra fora, que acompanham à distância | secundário `[A]` |
| P-03 | Proprietários estrangeiros de casa no concelho (obrigações legais, serviços) | secundário `[F]` |
| P-04 | Junta de Freguesia, comissões de festas, associações (produtores de conteúdo) | operacional `[F]` |

## Não-objectivos `[A]` — a confirmar

- Não é uma rede social nem tem comentários públicos.
- Não substitui os grupos de Facebook das aldeias; complementa-os.
- Não é um site oficial da Câmara nem da Junta, e diz isso no rodapé.
- Não aloja notícias de terceiros: liga a elas.
- Não tem contas de utilizador, perfis nem histórico por pessoa.
- Não recolhe estatísticas de comportamento individual.

## Restrições

| ID | Restrição | Origem |
|---|---|---|
| C-01 | Público com informática muito básica | `[F]` |
| C-02 | Custo de operação tendencialmente zero (níveis gratuitos) | `[F]` |
| C-03 | Sem equipa: um mantenedor, tempo livre | `[F]` |
| C-04 | Dados pessoais nunca saem do dispositivo | `[F]` decisão D-05 |
| C-05 | Português de Portugal e inglês do Reino Unido | `[F]` |
| C-06 | Tem de funcionar com rede fraca ou sem rede | `[F]` |
| C-07 | A Câmara não publica RSS, iCal nem API | `[F]` verificado |

## Recursos

| Recurso | Estado |
|---|---|
| Execução | Hugo, sozinho, em tempo livre `[F]` |
| Tempo disponível por semana | `[L]` |
| Alojamento | por escolher `[L]` |
| Domínio | por escolher `[L]` |
| Co-editores (Junta, comissões) | por recrutar `[L]` — ver R-01 |

## Extensão ao modelo canónico

Além dos ficheiros §2 do Project OS, este projecto tem `08-CONTEUDOS.md`:
o registo dos factos investigados (contactos, prazos legais, romarias, fontes)
com data de verificação. Justificação: são conteúdo de produto, não
arquitectura, e têm validade temporal própria — precisam de revisão anual
independente do código.
