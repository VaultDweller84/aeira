/* ============================================================
   A Eira — service worker
   ------------------------------------------------------------
   Faz duas coisas:
   1. guarda o portal no telemóvel, para abrir sem rede
      (num sítio onde a rede vai e vem, isto conta);
   2. guarda a última agenda que chegou, para a mostrar mesmo
      quando não há internet.

   SEMPRE QUE PUBLICAR UMA VERSÃO NOVA DO PORTAL, mude o número
   da VERSAO aqui em baixo. É isso que faz os telemóveis das
   pessoas irem buscar a versão nova em vez da guardada.
   ============================================================ */

const VERSAO = 'v3';
const CACHE_CASCA = 'aldeia-casca-' + VERSAO;
const CACHE_DADOS = 'aldeia-dados-' + VERSAO;

const CASCA = [
  './',
  './index.html',
  './instalar.html',
  './manifest.webmanifest',
  './icone-192.png',
  './icone-512.png',
  './icone-maskable.png'
];

self.addEventListener('install', (ev) => {
  ev.waitUntil(
    caches.open(CACHE_CASCA)
      .then((c) => Promise.allSettled(CASCA.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(
        nomes.filter((n) => n.startsWith('aldeia-') && !n.endsWith(VERSAO))
             .map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (ev) => {
  const pedido = ev.request;
  if (pedido.method !== 'GET') return;

  const url = new URL(pedido.url);

  /* a agenda: primeiro a rede, e o que vier fica guardado.
     Sem rede, mostra-se a última que chegou.
     O mesmo para as notícias e avisos. */
  if (url.pathname.endsWith('/agenda') || url.pathname.endsWith('/noticias')) {
    ev.respondWith(
      fetch(pedido)
        .then((r) => {
          const copia = r.clone();
          caches.open(CACHE_DADOS).then((c) => c.put(pedido, copia));
          return r;
        })
        .catch(() => caches.match(pedido))
    );
    return;
  }

  /* nunca guardar as cartas nem as sugestões */
  if (url.pathname.endsWith('/carta') || url.pathname.endsWith('/sugestao')) return;

  /* só tratamos do que é do próprio site */
  if (url.origin !== self.location.origin) return;

  /* páginas: rede primeiro (para verem alterações), casca se não houver rede */
  if (pedido.mode === 'navigate') {
    ev.respondWith(
      fetch(pedido)
        .then((r) => {
          const copia = r.clone();
          caches.open(CACHE_CASCA).then((c) => c.put(pedido, copia));
          return r;
        })
        .catch(() => caches.match(pedido).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  /* o resto: o que está guardado primeiro, que é mais rápido */
  ev.respondWith(
    caches.match(pedido).then((guardado) => guardado || fetch(pedido).then((r) => {
      if (r.ok) {
        const copia = r.clone();
        caches.open(CACHE_CASCA).then((c) => c.put(pedido, copia));
      }
      return r;
    }).catch(() => guardado))
  );
});
