# MEMORY.md — Mapa Interactivo
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.
## Estado actual
- v1 funcionando: gps ,calculo de distancia entre puntos y guardado de progreso entre ambos circuitos
- Datos en localStorage.
## Decisiones (y por qué)
- Constitución aprobada en `docs/constitution.md`: seis principios para mantener el proyecto sencillo y accesible a principiantes.
- Especificación de idiomas en `specs/001-language/spec.md`: español inicial, inglés y chino simplificado; recordar la elección y usar español si falta una traducción. La constitución requiere aprobación de actualización antes de implementar.
- Plan técnico en `specs/001-language/plan.md`; el usuario autorizó actualizar las reglas y crear los archivos previstos.
- Tareas secuenciadas para idiomas en `specs/001-language/tasks.md`; incluyen aprobaciones previas y verificación con Node y navegador.
- Si falla el guardado del idioma, se muestra un aviso y se mantiene el idioma elegido durante la visita si está disponible; si no se recupera después, se usa español.
- Al cambiar el idioma, también deben actualizarse inmediatamente los diálogos, listas y avisos abiertos.
- La traducción incluye los títulos de la aplicación y las etiquetas para lectores de pantalla.
- Se acordó traducir también todos los nombres propios de lugares.
- El usuario confía la revisión de traducciones al asistente; no exige revisión externa para finalizar.
- Idiomas en implementación: selector, catálogo y preferencia local añadidos; `node --test` pasa 4 pruebas. Quedan tareas sin verificar, especialmente traducción integral, pruebas móviles, persistencia y offline. Revisar `specs/001-language/tasks.md` antes de continuar.
## Aprendizajes y errores a evitar
- (vacío por ahora)
## Próximos pasos
- (vacío por ahora) 
