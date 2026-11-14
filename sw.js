const CACHE = "mapa-lucumo-v3";

const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/estilos.css",
  "./js/app.js",
  "./js/datos.js",
  "./js/geo.js",
  "./js/idiomas.mjs",
  "./js/gps.js",
  "./js/mapa.js",
  "./js/navegacion.js",
  "./js/progreso.js",
  "./vendor/leaflet/leaflet.js",
  "./vendor/leaflet/leaflet.css",
  "./vendor/turf/turf.min.js",
  "./vendor/fonts/fraunces.woff2",
  "./vendor/fonts/archivo.woff2",
  "./Recursos/iconos/icon-192.png",
  "./Recursos/iconos/icon-512.png",
  "./Recursos/iconos/favicon.svg",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(
          claves
            .filter((clave) => clave.startsWith("mapa-lucumo-") && clave !== CACHE)
            .map((clave) => caches.delete(clave)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function redPrimero(request) {
  try {
    const respuesta = await fetch(request);
    if (respuesta && respuesta.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, respuesta.clone());
    }
    return respuesta;
  } catch {
    const cache = await caches.open(CACHE);
    return (await cache.match(request)) || Response.error();
  }
}

async function navegacionPrimero(request) {
  try {
    const respuesta = await fetch(request);
    if (respuesta && respuesta.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, respuesta.clone());
    }
    return respuesta;
  } catch {
    const cache = await caches.open(CACHE);
    return (
      (await cache.match(request)) ||
      (await cache.match("./index.html")) ||
      Response.error()
    );
  }
}

async function cachePrimero(request) {
  const guardada = await caches.match(request);
  if (guardada) {
    return guardada;
  }

  try {
    const respuesta = await fetch(request);
    if (respuesta && respuesta.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, respuesta.clone());
    }
    return respuesta;
  } catch {
    return Response.error();
  }
}

self.addEventListener("fetch", (evento) => {
  const { request } = evento;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.endsWith("/sw.js")) {
    return;
  }

  if (request.mode === "navigate") {
    evento.respondWith(navegacionPrimero(request));
    return;
  }

  const estatico =
    url.pathname.includes("/vendor/") ||
    url.pathname.includes("/Recursos/") ||
    url.pathname.endsWith("manifest.webmanifest");

  evento.respondWith(estatico ? cachePrimero(request) : redPrimero(request));
});
