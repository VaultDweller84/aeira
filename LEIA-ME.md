# Código — estado em 2026-09-01

| Ficheiro | Papel | Vai para o site? |
|---|---|---|
| `index.html` | o portal inteiro (M-01) | **sim** |
| `instalar.html` | página de instalação (M-03) | **sim** |
| `manifest.webmanifest` | ficha da aplicação | **sim** |
| `sw.js` | funcionamento sem rede — **v2** | **sim** |
| `icone-*.png` | ícones da aplicação | **sim** |
| `worker.js` | Cloudflare Worker (M-02) | não — cola-se no Cloudflare |
| `INSTALAR.md` | guia de instalação passo a passo | não |

Antes de publicar: renomear nada — o `index.html` já tem o nome certo.
Configuração: bloco `CONFIG` no início do JavaScript do `index.html`.
A cada publicação: mudar `VERSAO` no `sw.js` (F-09, R-08).
