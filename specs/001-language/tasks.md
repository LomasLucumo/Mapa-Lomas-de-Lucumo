# Tareas: selección de idioma

Cada tarea requiere como máximo 30 minutos de trabajo activo; la espera de aprobaciones o revisiones externas no cuenta como trabajo activo. Ejecutar en orden. No iniciar la implementación hasta completar las condiciones previas.

## Condiciones previas

- [x] **T01 — Acordar el comportamiento cuando falle el almacenamiento y los criterios de aceptación pendientes.** RF: RF-2, RF-3, RF-4, RF-5.
  - Hecho cuando: las decisiones están aprobadas y `spec.md` ya no contiene dudas abiertas que impidan verificar estos requisitos.
- [x] **T02 — Obtener aprobación para adaptar la constitución y las instrucciones de idioma.** RF: RF-2, RF-3.
  - Hecho cuando: la persona responsable ha aprobado explícitamente los cambios propuestos a `docs/constitution.md` y `AGENTS.md`.
- [x] **T03 — Aplicar los cambios aprobados a las reglas de idioma.** RF: RF-2, RF-3.
  - Hecho cuando: ambos documentos permiten los tres idiomas de interfaz y mantienen nombres propios del código y comentarios en español.
- [x] **T04 — Obtener autorización para crear los archivos de implementación y pruebas.** RF: RF-1, RF-2, RF-3, RF-4, RF-5.
  - Hecho cuando: se ha aprobado crear `js/idiomas.mjs` y `tests/idiomas.test.mjs` sin cambiar el formato de progreso existente.

## Catálogo y lógica

- [ ] **T05 — Inventariar los textos actuales de la interfaz.** RF: RF-3.
  - Hecho cuando: existe una lista de textos visibles, dinámicos, de accesibilidad y del mapa que necesitan traducción.
- [x] **T06 — Crear el módulo de idiomas y la selección válida.** RF: RF-1, RF-2, RF-4.
  - Hecho cuando: el módulo reconoce los tres idiomas y determina el inicial y los valores inválidos conforme a la especificación aprobada.
- [ ] **T07 — Incorporar las claves y textos españoles de la interfaz.** RF: RF-2, RF-3, RF-5.
  - Hecho cuando: el inventario de T05 tiene un texto español identificado para cada entrada aplicable.
- [ ] **T08 — Añadir las traducciones inglesas de la interfaz.** RF: RF-3.
  - Hecho cuando: cada entrada de interfaz inventariada dispone de texto inglés no vacío.
- [ ] **T09 — Añadir las traducciones de interfaz en chino simplificado.** RF: RF-3.
  - Hecho cuando: cada entrada de interfaz inventariada dispone de texto chino simplificado no vacío.
- [x] **T10 — Incorporar nombres y descripciones de circuitos y paradas en español e inglés.** RF: RF-3, RF-5.
  - Hecho cuando: todos los identificadores actuales de circuitos y paradas tienen los textos correspondientes en ambos idiomas.
- [x] **T11 — Incorporar nombres y descripciones de circuitos y paradas en chino simplificado.** RF: RF-3, RF-5.
  - Hecho cuando: todos los identificadores actuales de circuitos y paradas tienen los textos correspondientes en chino simplificado.
- [ ] **T12 — Añadir búsqueda de textos con alternativa en español.** RF: RF-3, RF-5.
  - Hecho cuando: una clave presente devuelve el texto seleccionado y una traducción ausente devuelve el texto español sin alterar el catálogo.
- [x] **T13 — Añadir formato de textos con parámetros.** RF: RF-3, RF-5.
  - Hecho cuando: nombres, distancias y cantidades pueden insertarse en textos completos de los tres idiomas sin imponer el orden español.
- [ ] **T14 — Añadir consultas de nombres y descripciones por identificador.** RF: RF-3, RF-5.
  - Hecho cuando: las consultas de circuitos y paradas utilizan identificadores existentes y aplican la misma alternativa en español.

## Pruebas unitarias

- [x] **T15 — Crear pruebas de selección e idioma inicial.** RF: RF-1, RF-2, RF-4.
  - Hecho cuando: `node --test tests/idiomas.test.mjs` comprueba los tres idiomas, el inicial y los valores inválidos aprobados.
- [ ] **T16 — Añadir pruebas de búsqueda, alternativa y parámetros.** RF: RF-3, RF-5.
  - Hecho cuando: las pruebas cubren traducciones presentes y ausentes, textos parametrizados y ausencia de efectos secundarios.
- [x] **T17 — Añadir pruebas de cobertura del catálogo.** RF: RF-3, RF-5.
  - Hecho cuando: las pruebas contrastan los identificadores reales y detectan textos vacíos o faltantes en los tres idiomas.

## Integración

- [ ] **T18 — Incorporar el selector accesible en la bienvenida y la aplicación.** RF: RF-1, RF-2.
  - Hecho cuando: el selector ofrece los tres idiomas, indica el elegido y puede utilizarse durante la bienvenida y en el recorrido.
- [ ] **T19 — Adaptar el selector y los textos largos a móvil y teclado.** RF: RF-1, RF-3.
  - Hecho cuando: a 375 px el control y sus opciones son visibles, utilizables y muestran foco de teclado.
- [ ] **T20 — Conectar el idioma inicial y el cambio de selección.** RF: RF-1, RF-2.
  - Hecho cuando: una primera visita comienza en español y cada selección actualiza el idioma activo sin cambiar el circuito ni el progreso.
- [ ] **T21 — Guardar y recuperar la preferencia de forma independiente.** RF: RF-2, RF-4.
  - Hecho cuando: la elección se recupera al recargar, los errores siguen la decisión de T01 y `mapaLucumo:v1` conserva su formato.
- [ ] **T22 — Actualizar textos estáticos y metadatos de la interfaz.** RF: RF-2, RF-3, RF-5.
  - Hecho cuando: controles, bienvenida, títulos, idioma del documento y etiquetas accesibles muestran el idioma elegido o su alternativa española.
- [ ] **T23 — Actualizar panel y estados del recorrido.** RF: RF-2, RF-3, RF-5.
  - Hecho cuando: nombres, distancias, cantidades, estados GPS y progreso se presentan en el idioma elegido sin reiniciar el recorrido.
- [ ] **T24 — Actualizar listas, fichas y resumen.** RF: RF-2, RF-3, RF-5.
  - Hecho cuando: circuitos, nombres y descripciones de paradas, listas y resumen muestran el idioma elegido, incluso si están abiertos al cambiarlo según la especificación aprobada.
- [ ] **T25 — Actualizar avisos y confirmaciones.** RF: RF-2, RF-3, RF-5.
  - Hecho cuando: los avisos de GPS, conexión, llegada y confirmación de reinicio utilizan el idioma seleccionado o el texto alternativo.
- [ ] **T26 — Actualizar los textos accesibles de los marcadores.** RF: RF-2, RF-3, RF-5.
  - Hecho cuando: títulos y nombres accesibles de los marcadores cambian de idioma sin modificar su geometría ni estado.
- [x] **T27 — Actualizar la precarga offline.** RF: RF-4, RF-5.
  - Hecho cuando: el módulo de idiomas está en `SHELL`, la versión de `CACHE` ha aumentado y las rutas siguen siendo relativas.

## Verificación final

- [x] **T28 — Ejecutar y registrar las pruebas automáticas.** RF: RF-1, RF-2, RF-3, RF-4, RF-5.
  - Hecho cuando: `node --test tests/idiomas.test.mjs` termina correctamente y el resultado queda documentado.
  - Resultado parcial: `node --test` ejecutó 4 pruebas correctamente; no verifica aún la interfaz ni el modo offline.
- [ ] **T29 — Comprobar idiomas y accesibilidad en navegador.** RF: RF-1, RF-2, RF-3, RF-5.
  - Hecho cuando: se han probado los tres idiomas en móvil y con teclado, incluidos bienvenida, textos dinámicos, diálogos, marcadores y alternativa en español.
- [ ] **T30 — Comprobar persistencia y aislamiento del progreso.** RF: RF-2, RF-4.
  - Hecho cuando: en un perfil de prueba se cambia idioma y circuito, se recarga y se comprueba que las elecciones y el progreso esperado se conservan.
- [ ] **T31 — Comprobar el funcionamiento offline.** RF: RF-4, RF-5.
  - Hecho cuando: tras instalar el service worker con conexión, se cambia de idioma, se recarga sin conexión y se verifican traducciones y preferencia; después se restaura la red.
- [ ] **T32 — Comprobar errores y regresiones GPS.** RF: RF-2, RF-4, RF-5.
  - Hecho cuando: se documentan pruebas de traducción ausente, errores de almacenamiento según T01, consola, red, GPS y llegada, sin modificar datos reales.
- [ ] **T33 — Validar las traducciones y cerrar resultados.** RF: RF-3.
  - Hecho cuando: el asistente ha revisado los textos de cada idioma y se han documentado los resultados, incidencias y limitaciones de las verificaciones.
