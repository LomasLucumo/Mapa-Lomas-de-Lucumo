import { CIRCUITOS } from "./datos.js";
import { crearMapa } from "./mapa.js";
import { iniciarGPS } from "./gps.js";
import { evaluar, prepararCircuito } from "./navegacion.js";
import { normalizarIdioma, obtenerTexto } from "./idiomas.mjs";
import {
  asegurarCircuito,
  cargarEstado,
  guardarEstado,
  marcarVisitada,
  reiniciarProgreso,
} from "./progreso.js";

const $ = (id) => document.getElementById(id);

const claveIdioma = "mapaLucumo:idioma";
let idioma = "es";
try {
  idioma = normalizarIdioma(localStorage.getItem(claveIdioma));
} catch {
  idioma = "es";
}
const textosOriginales = new WeakMap();
const atributosOriginales = new WeakMap();
let observadorIdioma;

function actualizarIdioma() {
  observadorIdioma?.disconnect();
  document.documentElement.lang = idioma;
  const arbol = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  while (arbol.nextNode()) {
    const nodo = arbol.currentNode;
    if (nodo.parentElement?.closest('script, style, option, select')) continue;
    const actual = nodo.nodeValue;
    if (!actual.trim()) continue;
    let anterior = textosOriginales.get(nodo);
    if (!anterior || anterior.renderizado !== actual) anterior = { original: actual };
    const traducido = obtenerTexto(anterior.original.trim(), idioma);
    const renderizado = anterior.original.replace(anterior.original.trim(), traducido);
    textosOriginales.set(nodo, { original: anterior.original, renderizado });
    if (actual !== renderizado) nodo.nodeValue = renderizado;
  }
  document.querySelectorAll('[aria-label], [title]').forEach((elemento) => {
    const guardados = atributosOriginales.get(elemento) || {};
    for (const atributo of ['aria-label', 'title']) {
      if (!elemento.hasAttribute(atributo)) continue;
      const actual = elemento.getAttribute(atributo);
      let anterior = guardados[atributo];
      if (!anterior || anterior.renderizado !== actual) anterior = { original: actual };
      const renderizado = obtenerTexto(anterior.original, idioma);
      guardados[atributo] = { original: anterior.original, renderizado };
      if (actual !== renderizado) elemento.setAttribute(atributo, renderizado);
    }
    atributosOriginales.set(elemento, guardados);
  });
  document.querySelectorAll('.idioma-opciones').forEach((selector) => { selector.value = idioma; });
  observadorIdioma?.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'title'] });
}

function iniciarIdiomas() {
  observadorIdioma = new MutationObserver(actualizarIdioma);
  document.querySelectorAll('.idioma-opciones').forEach((selector) => {
    selector.addEventListener('change', () => {
      idioma = normalizarIdioma(selector.value);
      let fallo = false;
      try { localStorage.setItem(claveIdioma, idioma); } catch { fallo = true; }
      actualizarIdioma();
      if (fallo) avisar('No se pudo guardar el idioma. Se mantendrá durante esta visita.', 7000);
    });
  });
  actualizarIdioma();
}

const panel = $("panel");
const insigniaPanel = $("insigniaPanel");
const panelRotulo = $("panelRotulo");
const panelCircuito = $("panelCircuito");
const panelCuenta = $("panelCuenta");
const panelNombre = $("panelNombre");
const panelDistanciaBloque = $("panelDistanciaBloque");
const panelDistancia = $("panelDistancia");
const panelDistanciaUnidad = $("panelDistanciaUnidad");
const panelDistanciaNota = $("panelDistanciaNota");
const panelEstado = $("panelEstado");
const progresoTicks = $("progresoTicks");
const panelProgresoTexto = $("panelProgresoTexto");
const panelAccionesNormal = $("panelAccionesNormal");
const panelAccionesCompletado = $("panelAccionesCompletado");
const btnMarcar = $("btnMarcar");
const btnVerParada = $("btnVerParada");
const btnLista = $("btnLista");
const btnResumen = $("btnResumen");
const btnReiniciarPanel = $("btnReiniciarPanel");
const sinConexion = $("sinConexion");
const aviso = $("aviso");

const dlgBienvenida = $("bienvenida");
const dlgParada = $("dialogoParada");
const dlgLista = $("dialogoLista");
const dlgResumen = $("dialogoResumen");

const paradaNumero = $("paradaNumero");
const paradaCircuito = $("paradaCircuito");
const paradaNombre = $("paradaNombre");
const paradaDescripcion = $("paradaDescripcion");
const paradaEstado = $("paradaEstado");
const paradaDistancia = $("paradaDistancia");
const paradaMarcar = $("paradaMarcar");
const listaTitulo = $("listaTitulo");
const listaParadas = $("listaParadas");
const resumenTitulo = $("resumenTitulo");
const resumenTexto = $("resumenTexto");
const resumenParadas = $("resumenParadas");
const resumenTiempo = $("resumenTiempo");
const resumenDistancia = $("resumenDistancia");
const resumenReiniciar = $("resumenReiniciar");

let estado = cargarEstado();
let circuito = null;
let nav = null;
let progreso = null;
let mapaAPI = null;
let gps = { iniciado: false, estado: "inactivo", posicion: null };
let gpsControl = null;
let evaluacion = null;
let lecturasCerca = 0;
let siguiendo = false;
let avisoTimer = null;
let paradaDialogo = null;
let gpsAvisoMostrado = false;

function formatearDistancia(metros) {
  if (!Number.isFinite(metros)) {
    return { valor: "—", unidad: "" };
  }
  const seguro = Math.max(0, metros);
  if (seguro < 950) {
    return {
      valor: String(Math.round(seguro / 10) * 10),
      unidad: "m",
    };
  }
  return {
    valor: (seguro / 1000).toFixed(1).replace(".", ","),
    unidad: "km",
  };
}

function formatearTiempo(milisegundos) {
  const minutos = Math.max(0, Math.round(milisegundos / 60000));
  if (minutos < 60) {
    return `${minutos} min`;
  }
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto ? `${horas} h ${resto} min` : `${horas} h`;
}

function avisar(texto, duracion = 4200) {
  window.clearTimeout(avisoTimer);
  aviso.textContent = texto;
  aviso.classList.add("visible");
  avisoTimer = window.setTimeout(() => {
    aviso.classList.remove("visible");
  }, duracion);
}

function cerrarDialogo(dialogo) {
  if (dialogo && dialogo.open) {
    dialogo.close();
  }
}

function actualizarSelector() {
  document.querySelectorAll(".circuito-boton").forEach((boton) => {
    const activo = Boolean(circuito) && boton.dataset.circuito === circuito.id;
    boton.classList.toggle("es-activo", activo);
    boton.setAttribute("aria-pressed", String(activo));
  });
}

function actualizarBotonSeguir() {
  const boton = $("centrar");
  boton.classList.toggle("es-siguiendo", siguiendo);
  boton.setAttribute("aria-pressed", String(siguiendo));
}

function textoEstadoGPS() {
  if (progreso?.completado) {
    return { texto: "Completado", clase: "chip-bueno" };
  }
  if (evaluacion?.fueraRuta && gps.posicion) {
    return { texto: "Fuera de ruta", clase: "chip-malo" };
  }
  const estados = {
    inactivo: { texto: "GPS apagado", clase: "" },
    buscando: { texto: "Buscando GPS", clase: "chip-medio" },
    activo: { texto: "GPS activo", clase: "chip-bueno" },
    debil: { texto: "Señal débil", clase: "chip-medio" },
    "sin-permiso": { texto: "GPS bloqueado", clase: "chip-malo" },
    error: { texto: "Sin GPS", clase: "chip-malo" },
    "sin-soporte": { texto: "Sin GPS", clase: "chip-malo" },
  };
  return estados[gps.estado] || estados.error;
}

function renderPanel() {
  if (!circuito || !nav || !progreso) {
    panel.hidden = true;
    return;
  }

  panel.hidden = false;
  panel.style.setProperty("--acento", circuito.acento);
  dlgParada.style.setProperty("--acento", circuito.acento);
  dlgLista.style.setProperty("--acento", circuito.acento);
  dlgResumen.style.setProperty("--acento", circuito.acento);

  const total = circuito.paradas.length;
  const visitadas = Math.min(progreso.visitadas.length, total);
  const completado = Boolean(progreso.completado);
  const parada = nav.paradas[progreso.objetivo];

  insigniaPanel.textContent = completado ? "✓" : String(parada?.id ?? "•");
  insigniaPanel.classList.toggle("insignia-completa", completado);
  panelRotulo.textContent = completado
    ? "Recorrido completado"
    : "Siguiente parada";
  panelCircuito.textContent = `${circuito.nombre} · ${circuito.distanciaKm} km`;
  panelCuenta.textContent = completado
    ? `${total} de ${total}`
    : `${Math.min(progreso.objetivo + 1, total)} de ${total}`;
  panelNombre.textContent = completado
    ? "¡Gracias por visitar Lomas de Lúcumo!"
    : (parada?.nombre ?? "");

  panelDistanciaBloque.hidden = completado;

  if (!completado) {
    if (gps.posicion && evaluacion) {
      const distancia = formatearDistancia(evaluacion.restanteM);
      panelDistancia.textContent = distancia.valor;
      panelDistanciaUnidad.textContent = distancia.unidad;
      panelDistanciaNota.textContent = evaluacion.fueraRuta
        ? "fuera de ruta"
        : "por el sendero";
      panelDistanciaBloque.setAttribute(
        "aria-label",
        `Distancia restante: ${distancia.valor} ${distancia.unidad}`,
      );
    } else {
      panelDistancia.textContent = "—";
      panelDistanciaUnidad.textContent = "";
      panelDistanciaNota.textContent = "Activa tu ubicación para calcularla";
      panelDistanciaBloque.setAttribute(
        "aria-label",
        "Distancia restante sin datos de GPS",
      );
    }
  }

  const chip = textoEstadoGPS();
  panelEstado.textContent = chip.texto;
  panelEstado.className = `chip-estado ${chip.clase}`.trim();

  progresoTicks.replaceChildren();
  for (let i = 0; i < total; i += 1) {
    const marca = document.createElement("span");
    if (i < visitadas) {
      marca.className = "hecho";
    } else if (i === visitadas && !completado) {
      marca.className = "actual";
    }
    progresoTicks.appendChild(marca);
  }
  progresoTicks.setAttribute("aria-valuemax", String(total));
  progresoTicks.setAttribute("aria-valuenow", String(visitadas));
  panelProgresoTexto.textContent = `${visitadas} de ${total} visitadas`;

  panelAccionesNormal.hidden = completado;
  panelAccionesCompletado.hidden = !completado;
  btnMarcar.textContent =
    !completado && progreso.objetivo === total - 1
      ? "Finalizar recorrido"
      : "Marcar visitada";

  actualizarDialogoParada();
}

function actualizarDialogoParada() {
  if (!dlgParada.open || !paradaDialogo || !progreso || !nav) {
    return;
  }

  const visitada = progreso.visitadas.includes(paradaDialogo.id);
  const esObjetivo =
    !progreso.completado && paradaDialogo.indice === progreso.objetivo;

  paradaEstado.textContent = visitada
    ? "Visitada"
    : esObjetivo
      ? "Siguiente parada"
      : "Pendiente";
  paradaEstado.className = `chip ${
    visitada ? "chip-bueno" : esObjetivo ? "chip-actual" : "chip-neutro"
  }`;

  if (esObjetivo && gps.posicion && evaluacion) {
    const distancia = formatearDistancia(evaluacion.restanteM);
    paradaDistancia.textContent = `A ${distancia.valor} ${distancia.unidad} por el sendero`;
  } else if (esObjetivo && !gps.posicion) {
    paradaDistancia.textContent = "Activa el GPS para ver la distancia";
  } else {
    paradaDistancia.textContent = "";
  }

  paradaMarcar.hidden = !esObjetivo;
  paradaMarcar.textContent =
    paradaDialogo.indice === circuito.paradas.length - 1
      ? "Finalizar recorrido"
      : "Marcar como visitada";
}

function abrirParada(id) {
  if (!nav || !progreso) {
    return;
  }
  const parada = nav.paradas.find((item) => item.id === id);
  if (!parada) {
    return;
  }

  paradaDialogo = parada;
  paradaNumero.textContent = String(parada.id);
  paradaCircuito.textContent = `Circuito ${circuito.nombre}`;
  paradaNombre.textContent = parada.nombre;
  paradaDescripcion.textContent = parada.descripcion;
  actualizarDialogoParada();

  if (!dlgParada.open) {
    dlgParada.showModal();
  }
}

function renderLista() {
  listaTitulo.textContent = `Circuito ${circuito.nombre}`;
  listaParadas.replaceChildren();

  nav.paradas.forEach((parada) => {
    const visitada = progreso.visitadas.includes(parada.id);
    const actual =
      !progreso.completado && parada.indice === progreso.objetivo;

    const item = document.createElement("li");
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "lista-item";
    boton.classList.toggle("es-visitada", visitada);
    boton.classList.toggle("es-actual", actual);

    const numero = document.createElement("span");
    numero.className = "lista-numero";
    numero.textContent = String(parada.id);

    const nombre = document.createElement("span");
    nombre.className = "lista-nombre";
    nombre.textContent = parada.nombre;

    const estadoTexto = document.createElement("span");
    estadoTexto.className = "lista-estado";
    estadoTexto.textContent = visitada
      ? "Visitada"
      : actual
        ? "Ahora"
        : "Pendiente";

    boton.append(numero, nombre, estadoTexto);
    boton.addEventListener("click", () => {
      dlgLista.close();
      abrirParada(parada.id);
    });

    item.appendChild(boton);
    listaParadas.appendChild(item);
  });
}

function abrirLista() {
  if (!nav || !progreso) {
    return;
  }
  renderLista();
  if (!dlgLista.open) {
    dlgLista.showModal();
  }
}

function abrirResumen() {
  if (!circuito || !progreso) {
    return;
  }
  const total = circuito.paradas.length;
  const milisegundos =
    progreso.inicio && progreso.fin ? progreso.fin - progreso.inicio : 0;

  resumenTitulo.textContent = "¡Gracias por visitar Lomas de Lúcumo!";
  resumenTexto.textContent = `Completaste el Circuito ${circuito.nombre}.`;
  resumenParadas.textContent = `${progreso.visitadas.length} de ${total}`;
  resumenTiempo.textContent = milisegundos
    ? formatearTiempo(milisegundos)
    : "—";
  resumenDistancia.textContent = `${circuito.distanciaKm} km`;

  if (!dlgResumen.open) {
    dlgResumen.showModal();
  }
}

function abrirBienvenida() {
  if (!dlgBienvenida.open) {
    dlgBienvenida.showModal();
  }
}

function marcarLlegada(parada, manual) {
  if (!progreso || progreso.completado || !parada) {
    return;
  }

  lecturasCerca = 0;
  const marcada = marcarVisitada(progreso, circuito, parada.id);
  if (!marcada) {
    return;
  }

  guardarEstado(estado);

  if (gps.posicion && !progreso.completado) {
    evaluacion = evaluar(gps.posicion, nav, progreso.objetivo);
  } else {
    evaluacion = null;
  }

  mapaAPI.actualizarEstado(
    progreso.objetivo,
    progreso.visitadas,
    progreso.completado,
  );
  renderPanel();

  if (progreso.completado) {
    abrirResumen();
  } else {
    avisar(
      manual
        ? `Marcaste ${parada.nombre} como visitada`
        : `Has llegado a ${parada.nombre}`,
    );
  }
}

function comprobarLlegada() {
  if (!progreso || progreso.completado || !evaluacion || !nav) {
    return;
  }

  const parada = nav.paradas[progreso.objetivo];
  if (!parada) {
    return;
  }

  const precision = Number(gps.posicion?.precision);
  if (!Number.isFinite(precision) || precision > 50) {
    lecturasCerca = 0;
    return;
  }

  const radio = Math.max(18, Math.min(30, precision + 3));
  const cerca =
    evaluacion.distanciaParadaM <= radio &&
    Math.abs(evaluacion.avanceM - parada.avanceM) <= 35;

  lecturasCerca = cerca ? lecturasCerca + 1 : 0;

  if (lecturasCerca >= 2) {
    marcarLlegada(parada, false);
  }
}

function manejarPosicion(posicion) {
  gps.posicion = posicion;
  mapaAPI.actualizarUbicacion(
    [posicion.lat, posicion.lng],
    posicion.precision,
  );

  if (nav && progreso && !progreso.completado) {
    evaluacion = evaluar(posicion, nav, progreso.objetivo);
    comprobarLlegada();
  } else {
    evaluacion = null;
  }

  renderPanel();
}

function manejarEstadoGPS(nuevoEstado) {
  gps.estado = nuevoEstado;
  if (nav) {
    renderPanel();
  }
}

function activarGPS() {
  if (gps.iniciado) {
    return;
  }
  gps.iniciado = true;
  gps.estado = "buscando";
  gpsAvisoMostrado = false;

  const control = iniciarGPS({
    onPosicion: manejarPosicion,
    onEstado: manejarEstadoGPS,
    onError: (error) => {
      gps.iniciado = false;
      if (gpsControl) {
        gpsControl.detener();
        gpsControl = null;
      }
      siguiendo = false;
      mapaAPI.seguir(false);
      actualizarBotonSeguir();
      if (gpsAvisoMostrado) {
        return;
      }
      gpsAvisoMostrado = true;
      if (error && error.code === 1) {
        avisar(
          "Activa el permiso de ubicación para seguir el recorrido con GPS.",
          7000,
        );
      } else {
        avisar(
          "No pudimos obtener tu ubicación. Puedes marcar las paradas manualmente.",
          7000,
        );
      }
    },
  });

  gpsControl = control;

  if (nav) {
    renderPanel();
  }
}

function centrarEnMi() {
  if (!gps.posicion) {
    siguiendo = true;
    mapaAPI.seguir(true);
    actualizarBotonSeguir();

    if (!gps.iniciado) {
      activarGPS();
      if (gps.iniciado) {
        avisar("Activando tu ubicación…");
      }
    } else {
      avisar("Buscando señal GPS…");
    }
    return;
  }

  siguiendo = true;
  mapaAPI.seguir(true);
  mapaAPI.centrarEn([gps.posicion.lat, gps.posicion.lng], 16.5);
  actualizarBotonSeguir();
}

function verRuta() {
  siguiendo = false;
  mapaAPI.seguir(false);
  mapaAPI.centrarRuta();
  actualizarBotonSeguir();
}

function reiniciar() {
  if (!circuito || !progreso) {
    return;
  }
  const confirmado = window.confirm(
    `¿Reiniciar el recorrido del Circuito ${circuito.nombre}? Se borrarán las paradas visitadas.`,
  );
  if (!confirmado) {
    return;
  }

  progreso = reiniciarProgreso(estado, circuito);
  lecturasCerca = 0;
  evaluacion = gps.posicion
    ? evaluar(gps.posicion, nav, progreso.objetivo)
    : null;
  guardarEstado(estado);
  mapaAPI.actualizarEstado(0, [], false);
  renderPanel();
  mapaAPI.centrarRuta();
  cerrarDialogo(dlgResumen);
  avisar("Recorrido reiniciado");
}

function seleccionarCircuito(id) {
  const nuevo = CIRCUITOS[id];
  if (!nuevo) {
    return;
  }

  if (circuito && circuito.id === id) {
    return;
  }

  estado.activo = id;
  circuito = nuevo;
  progreso = asegurarCircuito(estado, circuito);
  nav = prepararCircuito(circuito);
  lecturasCerca = 0;
  evaluacion =
    gps.posicion && !progreso.completado
      ? evaluar(gps.posicion, nav, progreso.objetivo)
      : null;

  actualizarSelector();
  cerrarDialogo(dlgBienvenida);
  renderPanel();
  mapaAPI.dibujar(nav, { alTocarParada: abrirParada });
  mapaAPI.actualizarEstado(
    progreso.objetivo,
    progreso.visitadas,
    progreso.completado,
  );
  actualizarBotonSeguir();
  guardarEstado(estado);

  if (!gps.iniciado) {
    activarGPS();
  }

  document.title = `Mapa Lúcumo · ${circuito.nombre}`;

  const siguiente = nav.paradas[progreso.objetivo];
  if (progreso.completado) {
    avisar(`${circuito.nombre} ya está completado`, 5000);
  } else if (progreso.visitadas.length > 0 && siguiente) {
    avisar(`Continúas en ${siguiente.nombre}`, 4500);
  } else {
    avisar(`Circuito ${circuito.nombre} · ${circuito.distanciaKm} km`, 4000);
  }
}

function actualizarConexion() {
  const offline = !navigator.onLine;
  sinConexion.hidden = !offline;
  $("estadoConexion").textContent = offline ? "Sin conexión" : "En línea";
}

function registrarSW() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") {
    return;
  }
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

function enlazarEventos() {
  document.querySelectorAll("[data-circuito]").forEach((boton) => {
    boton.addEventListener("click", () => {
      seleccionarCircuito(boton.dataset.circuito);
    });
  });

  $("acercar").addEventListener("click", () => mapaAPI.acercar());
  $("alejar").addEventListener("click", () => mapaAPI.alejar());
  $("centrar").addEventListener("click", centrarEnMi);
  $("verRuta").addEventListener("click", verRuta);

  btnVerParada.addEventListener("click", () => {
    const parada = nav?.paradas[progreso?.objetivo];
    if (parada) {
      abrirParada(parada.id);
    }
  });

  btnMarcar.addEventListener("click", () => {
    const parada = nav?.paradas[progreso?.objetivo];
    if (parada && !progreso.completado) {
      marcarLlegada(parada, true);
    }
  });

  btnLista.addEventListener("click", abrirLista);
  btnResumen.addEventListener("click", abrirResumen);
  btnReiniciarPanel.addEventListener("click", reiniciar);
  resumenReiniciar.addEventListener("click", reiniciar);

  paradaMarcar.addEventListener("click", () => {
    if (!paradaDialogo || !progreso || progreso.completado) {
      return;
    }
    if (paradaDialogo.indice !== progreso.objetivo) {
      dlgParada.close();
      return;
    }
    const parada = paradaDialogo;
    dlgParada.close();
    marcarLlegada(parada, true);
  });

  document.querySelectorAll("[data-cerrar]").forEach((boton) => {
    boton.addEventListener("click", () => {
      cerrarDialogo(boton.closest("dialog"));
    });
  });

  [dlgBienvenida, dlgParada, dlgLista, dlgResumen].forEach((dialogo) => {
    dialogo.addEventListener("click", (evento) => {
      if (evento.target === dialogo) {
        dialogo.close();
      }
    });
  });

  window.addEventListener("online", () => {
    actualizarConexion();
    avisar("Conexión restablecida.");
  });

  window.addEventListener("offline", () => {
    actualizarConexion();
    avisar("Sin conexión. El mapa y tu progreso siguen disponibles.", 5500);
  });
}

function iniciar() {
  iniciarIdiomas();
  mapaAPI = crearMapa($("mapa"), {
    alCambiarSeguimiento: (activo) => {
      siguiendo = activo;
      actualizarBotonSeguir();
    },
  });

  enlazarEventos();
  actualizarConexion();
  actualizarSelector();
  actualizarBotonSeguir();

  if (estado.activo && CIRCUITOS[estado.activo]) {
    seleccionarCircuito(estado.activo);
  } else {
    abrirBienvenida();
  }

  registrarSW();
}

iniciar();
