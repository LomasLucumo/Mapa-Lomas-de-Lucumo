# Especificación: selección de idioma

## Contexto y objetivo

Mapa Lúcumo está disponible en español. Se quiere permitir que más visitantes comprendan la información y utilicen la aplicación en español, inglés o chino simplificado.

La constitución permite los tres idiomas aprobados para la interfaz.

## Usuarios

- Visitantes que prefieren consultar el recorrido en español, inglés o chino simplificado.

## Historias de usuario

- Como visitante, quiero cambiar el idioma para entender los controles, las rutas y las paradas.
- Como visitante, quiero conservar mi elección entre visitas y sin conexión para no tener que seleccionarla de nuevo.
- Como visitante, quiero ver el contenido en español cuando falte una traducción para poder seguir usando la aplicación.

## Requisitos funcionales

### RF-1. Idiomas disponibles

- El sistema deberá ofrecer un control para elegir español, inglés o chino simplificado.
- Mientras la persona consulta las opciones, el sistema deberá permitirle reconocer el idioma seleccionado.

### RF-2. Idioma inicial y cambio

- Cuando una persona abra la aplicación por primera vez, el sistema deberá mostrarla en español.
- Si no existe una preferencia válida, el sistema deberá utilizar español como idioma inicial.
- Cuando la persona seleccione un idioma disponible, el sistema deberá mostrar los textos de la aplicación en ese idioma.
- Cuando la persona cambie de idioma, el sistema deberá actualizar inmediatamente los diálogos, listas y avisos que estén abiertos.
- Cuando la persona cambie de idioma, el sistema deberá conservar el circuito y el progreso existentes.

### RF-3. Contenido traducido

- Mientras esté seleccionado un idioma, el sistema deberá presentar en ese idioma los controles, avisos y demás textos de la aplicación.
- Mientras esté seleccionado un idioma, el sistema deberá presentar en ese idioma los títulos de la aplicación y las etiquetas destinadas a lectores de pantalla.
- Mientras esté seleccionado un idioma, el sistema deberá presentar en ese idioma los nombres y descripciones de todos los circuitos y paradas.
- Mientras esté seleccionado un idioma, el sistema deberá presentar también los nombres propios de lugares en ese idioma, incluido el nombre de Lomas de Lúcumo.

### RF-4. Preferencia entre visitas

- Cuando la persona vuelva a abrir la aplicación después de elegir un idioma, el sistema deberá recuperar su elección.
- Mientras la aplicación se utilice sin conexión, el sistema deberá permitir seleccionar un idioma y utilizar las traducciones disponibles.
- Cuando la persona vuelva a abrir la aplicación sin conexión después de elegir un idioma, el sistema deberá recuperar su elección.
- Si no es posible guardar la preferencia de idioma, el sistema deberá mostrar un aviso.
- Si no es posible guardar la preferencia de idioma, el sistema deberá mantener el idioma elegido durante la visita actual mientras esté disponible.
- Si al abrir la aplicación no se puede recuperar una preferencia de idioma, el sistema deberá usar español.

### RF-5. Traducciones ausentes

- Si una traducción falta o no está disponible, el sistema deberá mostrar el texto correspondiente en español.
- Si una traducción está vacía, el sistema deberá tratarla como una traducción ausente.
- Si falta también el texto en español, el sistema deberá mostrar «Contenido no disponible» y mantener la aplicación utilizable.
- Si una traducción falta o no está disponible, el sistema deberá mantener la aplicación utilizable.
- Si no es posible usar el idioma elegido, el sistema deberá mostrar el contenido en español.

## Requisitos no funcionales

- El selector y sus opciones deben poder leerse y utilizarse a 375 px de ancho, sin recortes ni desplazamiento horizontal.
- El selector debe poder alcanzarse y utilizarse con teclado, mostrar el foco y exponer su nombre y selección a lectores de pantalla.
- Los títulos, avisos, etiquetas accesibles y contenidos propios de la aplicación forman parte de los textos traducibles; los mensajes propios del navegador quedan fuera de su control.
- Las traducciones deben ser comprensibles y apropiadas para el contexto turístico.
- Las traducciones serán revisadas por el asistente; no se exige una revisión externa como condición de finalización.
- La funcionalidad debe respetar la privacidad y preservar el progreso existente.
- Las traducciones deben poder consultarse sin conexión después de la primera visita con conexión.

## Casos límite

- Falta una traducción concreta: se muestra ese texto en español, sin impedir la consulta del resto.
- La persona cambia de idioma durante un recorrido: conserva su circuito y progreso.
- La persona cambia de idioma con diálogos, listas o avisos abiertos: sus textos se actualizan inmediatamente.
- La persona cambia de idioma sin conexión: puede consultar las traducciones disponibles y conservar su elección para una visita posterior.
- No es posible guardar la preferencia: se muestra un aviso y se mantiene el idioma elegido durante la visita actual mientras esté disponible; si en una visita posterior no se puede recuperar, se usa español.
- La preferencia está vacía, dañada o contiene un idioma no admitido: se usa español.
- Se borran los datos guardados o se usa otro navegador o dispositivo: se considera una visita sin preferencia y se usa español.
- La primera carga no se ha completado con conexión: no se garantiza la apertura ni la disponibilidad de las traducciones sin conexión.
- Una traducción es larga: debe seguir siendo legible y accesible a 375 px de ancho.
- Falta también el texto español: se muestra «Contenido no disponible» sin bloquear la aplicación.

## Fuera de alcance

- Idiomas distintos del español, inglés y chino simplificado, incluido el chino tradicional.
- Traducción automática de idiomas adicionales o de contenido aportado por visitantes.
- Sincronización de la preferencia entre dispositivos, navegadores o pestañas abiertas.
- Traducción de mensajes propios del navegador, como solicitudes de permisos.

## Criterios de finalización

- La actualización necesaria de la constitución está aprobada.
- Todos los requisitos funcionales se comprueban en los tres idiomas, en móvil y con teclado.
- Se verifican la persistencia de la elección, el modo sin conexión, el texto alternativo en español y la conservación del progreso.
- Se revisa que los nombres y descripciones de todos los circuitos y paradas estén traducidos.
- Las dudas abiertas están resueltas y las pruebas y sus resultados están documentados.

## Dudas abiertas

- Ninguna pendiente para esta versión.
