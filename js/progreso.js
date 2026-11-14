const CLAVE = "mapaLucumo:v1";
const VERSION = 1;

export function crearProgreso() {
  return {
    objetivo: 0,
    visitadas: [],
    inicio: null,
    fin: null,
    completado: false,
  };
}

export function cargarEstado() {
  const vacio = { version: VERSION, activo: null, circuitos: {} };
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (!guardado) {
      return vacio;
    }
    const datos = JSON.parse(guardado);
    if (!datos || datos.version !== VERSION) {
      return vacio;
    }
    return {
      version: VERSION,
      activo: datos.activo ?? null,
      circuitos:
        datos.circuitos && typeof datos.circuitos === "object"
          ? datos.circuitos
          : {},
    };
  } catch {
    return vacio;
  }
}

export function guardarEstado(estado) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch {
    return false;
  }
  return true;
}

export function asegurarCircuito(estado, circuito) {
  const total = circuito.paradas.length;
  if (!estado.circuitos[circuito.id]) {
    estado.circuitos[circuito.id] = crearProgreso();
  }

  const progreso = estado.circuitos[circuito.id];
  progreso.visitadas = Array.isArray(progreso.visitadas)
    ? progreso.visitadas.filter((id) => circuito.paradas.includes(id))
    : [];

  if (!Number.isFinite(progreso.objetivo)) {
    progreso.objetivo = progreso.visitadas.length;
  }

  progreso.objetivo = Math.max(0, Math.min(Math.floor(progreso.objetivo), total));

  if (progreso.visitadas.length >= total) {
    progreso.completado = true;
    progreso.objetivo = total;
  }

  if (progreso.completado) {
    progreso.objetivo = total;
    if (!progreso.fin) {
      progreso.fin = Date.now();
    }
  }

  if (!progreso.inicio) {
    progreso.inicio = Date.now();
  }

  return progreso;
}

export function reiniciarProgreso(estado, circuito) {
  estado.circuitos[circuito.id] = crearProgreso();
  estado.circuitos[circuito.id].inicio = Date.now();
  return estado.circuitos[circuito.id];
}

export function marcarVisitada(progreso, circuito, paradaId) {
  if (progreso.completado) {
    return false;
  }
  if (!progreso.visitadas.includes(paradaId)) {
    progreso.visitadas.push(paradaId);
  }
  progreso.objetivo = Math.min(
    circuito.paradas.length,
    progreso.objetivo + 1,
  );
  if (progreso.objetivo >= circuito.paradas.length) {
    progreso.completado = true;
    progreso.fin = Date.now();
  }
  return true;
}
