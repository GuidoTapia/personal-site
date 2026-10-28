// The Gatsby version of this site registered a service worker (gatsby-plugin-offline) at /sw.js
// that keeps serving the old cached app to returning visitors. Browsers re-check this URL, find
// this file, and this worker clears the caches, unregisters itself and reloads open tabs.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(client => client.navigate(client.url));
    })(),
  );
});
