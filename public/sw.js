// Service worker mínimo: habilita a instalação sem guardar versões antigas do app.
// Sempre busca na rede (nunca serve páginas velhas do cache).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", () => {
  // Sem interceptação: o navegador segue direto para a rede.
});
