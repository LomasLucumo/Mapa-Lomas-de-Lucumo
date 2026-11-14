# Guía del proyecto

- Es una PWA estática en español, sin gestor de paquetes, compilación ni suite de pruebas. `index.html` carga las versiones locales de Leaflet y Turf antes de `js/app.js`; conserva ese orden y evita dependencias de CDN.
- Para desarrollar, sirve la raíz del proyecto por HTTP en `localhost` (por ejemplo, `npx --yes serve .`). Abrir `index.html` mediante `file://` impide que funcionen los módulos ES y el modo offline. El GPS y los service workers requieren un contexto seguro: localhost o HTTPS. Mantén las URL relativas para los despliegues en subdirectorios de GitHub Pages.
- `js/datos.js` contiene las paradas, coordenadas de tramos, orden de circuitos y asignaciones de paradas a tramos. `js/geo.js` convierte `[lat, lng]` al formato `[lng, lat]` de Turf; `js/navegacion.js` suaviza y calibra la geometría esquemática a los totales indicados de 5 km y 7 km. Al editar rutas, conserva la continuidad de los tramos y comprueba el orden de las paradas y las distancias calibradas; no son recorridos GPS grabados.
- `js/app.js` coordina el GPS, los diálogos y la detección de llegada; `js/progreso.js` guarda el progreso separado de cada circuito en localStorage bajo `mapaLucumo:v1`. Ten en cuenta la compatibilidad con el progreso guardado al cambiar su estructura o los identificadores de las paradas.
- `sw.js` precarga los recursos de la aplicación y prioriza la caché para dependencias locales, iconos y el manifiesto. Añade los nuevos recursos necesarios en ejecución a `SHELL` e incrementa `CACHE` cuando cambies recursos que priorizan la caché, para que los clientes instalados reciban las actualizaciones. Prueba el modo offline solo después de una carga inicial con conexión y de la instalación del service worker.
- Comprobación de sintaxis de un módulo de navegador en Windows PowerShell: `Get-Content -Raw "js/app.js" | node --input-type=module --check`; para el service worker, usa `node --check sw.js`. Estas comprobaciones no ejecutan la aplicación en el navegador; verifica según corresponda la interfaz, el GPS, la persistencia y el modo offline.

## Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones
tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su
porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de
dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales). 

## Convenciones
- Textos de la interfaz disponibles en español, inglés y chino simplificado; nombres propios del código y comentarios en español.
- Código simple, nombres descriptivos y comentarios solo donde aporten.
- Diseño limpio y responsive; cualquier pantalla nueva debe verse bien en el móvil.

## Forma de trabajar
- Haz solo lo que se pide: no añadas funcionalidades por tu cuenta.
- Cambios pequeños y enfocados; no reescribas lo que ya funciona.
- Al terminar, resume qué has cambiado y cualquier decisión que deba revisar.
## Límites
- ✅ Siempre: actualizar `MEMORY.md` al terminar cada tarea. 
- ✅ Siempre: respetar las reglas de fechas y racha y los idiomas aprobados de la interfaz.
- ⚠️ Pregunta antes: crear archivos nuevos, cambiar el formato de los datos guardados.
- 🚫 Nunca: usar tesales o almacenar datos sensibles de usuarios
## Verificación
- No hay tests automáticos. Después de cada cambio, verifica con el MCP de Chrome DevTools: abre `index.html`, prueba la funcionalidad, revisa la consola y comprueba la vista móvil.
