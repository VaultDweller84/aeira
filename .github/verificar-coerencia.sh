#!/usr/bin/env bash
# ============================================================
#  A Eira — verificação de coerência entre código e documentação
#  ------------------------------------------------------------
#  Corre a cada envio para o GitHub e falha, de forma ruidosa,
#  quando uma das três regras do LEIA-PRIMEIRO.md foi esquecida.
#
#  Não impede a publicação — o Cloudflare Pages publica na mesma.
#  Serve para a divergência deixar de ser silenciosa. Ver ADR-020.
#
#  Correr à mão, antes de enviar:
#      bash .github/verificar-coerencia.sh HEAD~1 HEAD
#
#  Terceiro argumento: o ramo. No `desenho`, a regra do CHANGELOG
#  é lembrete e não falha — ver ADR-018 e ADR-020.
# ============================================================
set -uo pipefail

BASE="${1:-}"
TOPO="${2:-HEAD}"
RAMO="${3:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo main)}"

if [ -z "$BASE" ] || [ "$BASE" = "0000000000000000000000000000000000000000" ]; then
  echo "Primeiro envio ou origem desconhecida — nada a comparar."
  exit 0
fi

if ! git cat-file -e "$BASE^{commit}" 2>/dev/null; then
  echo "A origem $BASE não existe neste histórico — nada a comparar."
  exit 0
fi

MUDOU=$(git diff --name-only "$BASE" "$TOPO")
# Junções de ramo trazem commits já verificados no ramo de origem, e o
# CHANGELOG costuma ter sido escrito antes. Ver ADR-020, limitação 2.
JUNCAO=$(git rev-list --merges "$BASE".."$TOPO" 2>/dev/null | head -1)
if [ -z "$MUDOU" ]; then
  echo "Sem ficheiros alterados."
  exit 0
fi

echo "Ficheiros alterados:"
echo "$MUDOU" | sed 's/^/  · /'
echo

tem() { echo "$MUDOU" | grep -q "$1"; }

FALHAS=0
aviso() { echo "✗ $1"; FALHAS=$((FALHAS+1)); }
bem()   { echo "✓ $1"; }

# ---- Regra 1: mexeu em codigo/ → a VERSAO do sw.js muda ----
if tem '^codigo/'; then
  if ! tem '^codigo/sw\.js$'; then
    aviso "Mexeu em codigo/ e não tocou no sw.js. A VERSAO tem de mudar no mesmo commit, senão quem tem o portal instalado continua a ver a versão antiga. (R-08, regra 1)"
  elif ! git diff "$BASE" "$TOPO" -- codigo/sw.js | grep -qE '^\+const VERSAO'; then
    aviso "O sw.js mudou mas a linha const VERSAO ficou igual. É essa linha que faz os telemóveis irem buscar a versão nova. (R-08, regra 1)"
  else
    NOVA=$(git diff "$BASE" "$TOPO" -- codigo/sw.js | grep -E '^\+const VERSAO' | head -1 | sed "s/.*'\(.*\)'.*/\1/")
    bem "codigo/ alterado e a VERSAO do sw.js passou a $NOVA"
  fi
fi

# ---- Regra 2: mudou o produto → o CHANGELOG muda ----
#  No ramo `desenho` isto é só lembrete: o ADR-018 manda o codigo/ para
#  lá e os .md directos para o main, portanto um commit de desenho nunca
#  traz o CHANGELOG. Falhar aqui seria ensinar a ignorar a cruz vermelha.
if tem '^codigo/' || tem '^worker/'; then
  if ! tem '^CHANGELOG\.md$'; then
    if [ "$RAMO" = "desenho" ]; then
      echo "! Ramo desenho: o CHANGELOG.md fica para o commit do main. (regra 2, adiada)"
    elif [ -n "$JUNCAO" ]; then
      echo "! Junção de ramo: o CHANGELOG.md terá sido escrito antes. Confirmar à mão que descreve esta versão. (regra 2, não verificável)"
    else
      aviso "Mudou o produto (codigo/ ou worker/) e o CHANGELOG.md ficou na mesma. O que não estiver escrito perde-se na sessão seguinte. (regra 2)"
    fi
  else
    bem "produto alterado e o CHANGELOG.md acompanha"
  fi
fi

# ---- Regra 3: mexeu no worker → lembrete de colar no painel ----
if tem '^worker/'; then
  echo "! O worker/worker.js mudou. O Cloudflare Pages NÃO o publica —"
  echo "  tem de ser colado à mão no painel do Worker. (R-16, regra 3)"
fi

echo
if [ "$FALHAS" -gt 0 ]; then
  echo "=================================================="
  echo " $FALHAS regra(s) por cumprir. Ver LEIA-PRIMEIRO.md."
  echo "=================================================="
  exit 1
fi

echo "Coerência verificada."
exit 0
