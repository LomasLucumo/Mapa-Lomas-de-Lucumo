# Plan técnico: selección de idioma

## Condiciones previas

- Obtener aprobación para modificar el principio 6 de `docs/constitution.md` y la convención de textos en español de `AGENTS.md`; ambos impiden actualmente una interfaz en inglés o chino. Ninguno se modifica con este plan.
- Resolver y aprobar en `spec.md` la duda sobre el comportamiento cuando no se puede recordar la preferencia, además de las ambigüedades de aceptación identificadas en la revisión QA. No dar por aprobado RF-4 mientras siga abierta.
- Solicitar aprobación antes de crear los archivos previstos para la implementación y antes de cualquier cambio del formato de progreso. Este plan evita cambiarlo.

## Archivos previstos

| Archivo | Acción y responsabilidad | Requisitos |
| --- | --- | --- |
| `index.html` | Modificar: incorporar el selector accesible, disponible también durante la bienvenida; identificar los textos y atributos estáticos que deban actualizarse. Conservar español como contenido inicial y el orden de carga actual. | RF-1, RF-2, RF-3 |
| `css/estilos.css` | Modificar: adaptar el selector y textos largos a pantallas móviles y al foco de teclado. | RF-1, RF-3 |
| `js/idiomas.mjs` | Crear: catálogo local de los tres idiomas y funciones puras de selección, búsqueda, sustitución y presentación de textos; incluir traducciones de circuitos y paradas por sus identificadores existentes. | RF-1, RF-2, RF-3, RF-5 |
| `js/app.js` | Modificar: leer y guardar la preferencia separadamente, conectar el selector y actualizar textos estáticos y dinámicos sin reiniciar el recorrido; actualizar panel, bienvenida, lista, diálogos, avisos, confirmaciones, título, idioma del documento y etiquetas accesibles. Manejar errores de almacenamiento según la aclaración aprobada. | RF-1 a RF-5 |
| `js/mapa.js` | Modificar: actualizar títulos y etiquetas accesibles de los marcadores al cambiar el idioma sin alterar geometría ni progreso. | RF-2, RF-3 |
| `sw.js` | Modificar: añadir el catálogo y la lógica de idioma a `SHELL` y aumentar `CACHE` para la actualización offline. Mantener rutas relativas. | RF-4, RF-5 |
| `tests/idiomas.test.mjs` | Crear: pruebas con `node --test` de las funciones puras y de la integridad del catálogo. | RF-1, RF-2, RF-3, RF-5 |
| `specs/001-language/spec.md` | Modificar solo después de acordar las dudas y criterios de aceptación pendientes. | RF-2 a RF-5 |
| `docs/constitution.md`, `AGENTS.md` | Modificar únicamente tras aprobación explícita de los cambios necesarios para permitir textos en los tres idiomas; mantener nombres del código y comentarios en español. | RF-2, RF-3 |

No se prevén cambios de coordenadas, identificadores, orden de paradas ni estructura de `mapaLucumo:v1`. Las traducciones de nombres y descripciones se consultarán por identificador, sin sobrescribir los datos del recorrido. **RF-2, RF-3.**

## Funciones puras previstas

Funciones sin acceso al DOM, GPS, red ni almacenamiento; reciben datos y devuelven resultados:

- `normalizarIdioma`: comprueba los idiomas admitidos y determina el valor inicial; los valores inválidos y el tratamiento de errores quedan sujetos a la aclaración de la especificación. **RF-1, RF-2, RF-4.**
- `obtenerTexto`: busca una clave en el idioma elegido y, si falta o no está disponible, usa el texto español correspondiente. **RF-3, RF-5.**
- `formatearTexto`: inserta valores proporcionados, como nombre de parada, distancia o cantidad, en textos completos de cada idioma sin depender del orden español. **RF-3, RF-5.**
- `obtenerNombreCircuito`, `obtenerNombreParada` y `obtenerDescripcionParada`: resuelven textos por identificador estable mediante la misma regla de alternativa en español. **RF-3, RF-5.**

La lectura y escritura de la preferencia y la actualización de la interfaz permanecen fuera de estas funciones; los errores de almacenamiento no deben modificar el progreso.

## Decisiones y alternativas

1. **Catálogo local en un módulo ES:** permite uso offline, reutiliza el stack actual y facilita comprobar las traducciones. Se descarta un servicio externo de traducción por depender de red y añadir complejidad. **RF-3 a RF-5.**
2. **Módulo `.mjs` para la lógica comprobable:** Node y el navegador reconocen el formato ES sin añadir configuración de paquetes. Se descarta introducir un gestor de paquetes o compilación solo para las pruebas. **RF-1 a RF-5.**
3. **Preferencia en una clave local independiente:** conserva intacto `mapaLucumo:v1` y evita migrar el progreso. Se descarta añadir el idioma a su estructura existente por requerir aprobación y compatibilidad. El comportamiento ante fallo de lectura o escritura queda pendiente de decisión. **RF-2, RF-4.**
4. **Texto completo por idioma con parámetros:** evita construir frases según el orden español. Se descarta concatenar fragmentos traducidos, pues no garantiza frases correctas en los tres idiomas. **RF-3, RF-5.**
5. **Catálogo por identificadores existentes:** separa traducciones de geometría y estado del recorrido. Se descarta duplicar o alterar paradas y circuitos para cada idioma. **RF-2, RF-3.**
6. **Recursos precargados en el service worker:** permite volver a abrir y usar los tres idiomas sin conexión tras una instalación online completa. Se descarta descargar traducciones solo al seleccionarlas, porque no garantizaría su disponibilidad offline. **RF-4, RF-5.**

## Estrategia de pruebas

### Automáticas con Node

- Ejecutar desde la raíz `node --test tests/idiomas.test.mjs`, con una versión de Node compatible con `node --test`. No requiere dependencias ni gestor de paquetes.
- Comprobar los tres idiomas, español inicial, selección válida y valores inválidos según la decisión aprobada. **RF-1, RF-2, RF-4.**
- Comprobar claves presentes y ausentes, fallback por texto al español, parámetros y ausencia de literales vacíos; incluir datos de prueba controlados sin depender del almacenamiento ni del navegador. **RF-3, RF-5.**
- Comparar el catálogo con los identificadores reales de circuitos y paradas y comprobar cobertura de nombres y descripciones en los tres idiomas; no confundir una prueba deliberada de fallback con traducciones faltantes en el catálogo de producción. **RF-3, RF-5.**
- Estas pruebas no demuestran por sí solas persistencia, interfaz, GPS ni funcionamiento offline.

### Navegador con Chrome DevTools

- Probar primera visita y cambios entre los tres idiomas, también durante la bienvenida, en móvil y mediante teclado; revisar controles, textos dinámicos, marcadores, diálogos, títulos y nombres accesibles. **RF-1 a RF-3.**
- Registrar progreso de prueba, cambiar idiomas y circuitos, recargar y comprobar que circuito y progreso no cambian; usar un perfil aislado para no alterar datos reales. **RF-2, RF-4.**
- Instalar el service worker tras una carga online completa; después simular desconexión, cambiar de idioma, recargar offline y verificar traducciones y preferencia. Restaurar conexión al terminar. **RF-4.**
- Simular una traducción ausente y verificar el texto español y la continuidad de uso; probar fallos de almacenamiento conforme a la resolución aprobada. **RF-5, RF-4.**
- Revisar consola y red, comprobar GPS y llegada como regresión y documentar resultados y limitaciones. El asistente revisará también la calidad de las traducciones; no se exige revisión externa.
