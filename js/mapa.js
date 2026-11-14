export function crearMapa(elemento, { alCambiarSeguimiento } = {}) {
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const mapa = L.map(elemento, {
    zoomControl: false,
    attributionControl: false,
    minZoom: 10,
    maxZoom: 18,
    zoomSnap: 0.25,
    zoomDelta: 0.5,
    preferCanvas: true,
    worldCopyJump: false,
  });

  mapa.setView([-12.2055, -76.884], 13);

  const capaRuta = L.layerGroup().addTo(mapa);
  const capaMarcadores = L.layerGroup().addTo(mapa);

  let nav = null;
  let bounds = null;
  let marcadores = new Map();
  let gpsMarcador = null;
  let gpsCirculo = null;
  let siguiendo = false;

  mapa.on("dragstart", () => {
    if (siguiendo) {
      siguiendo = false;
      alCambiarSeguimiento?.(false);
    }
  });

  window.addEventListener("resize", () => mapa.invalidateSize());

  function relleno() {
    return {
      paddingTopLeft: [38, 38],
      paddingBottomRight: [65, 38],
    };
  }

  function centrarRuta() {
    if (!bounds) {
      return;
    }
    siguiendo = false;
    alCambiarSeguimiento?.(false);
    mapa.fitBounds(bounds, { ...relleno(), animate: false });
    mapa.setMinZoom(Math.max(10, mapa.getZoom() - 1.25));
  }

  function dibujar(navNuevo, { alTocarParada } = {}) {
    nav = navNuevo;
    capaRuta.clearLayers();
    capaMarcadores.clearLayers();
    marcadores = new Map();
    siguiendo = false;
    alCambiarSeguimiento?.(false);

    nav.circuito.tramos.forEach((id) => {
      const tramo = nav.tramos[id];
      L.polyline(tramo.coords, {
        color: "#14251c",
        weight: 10,
        opacity: 0.1,
        lineCap: "round",
        lineJoin: "round",
        interactive: false,
      }).addTo(capaRuta);
      L.polyline(tramo.coords, {
        color: tramo.color,
        weight: 5.5,
        opacity: 0.96,
        lineCap: "round",
        lineJoin: "round",
        interactive: false,
      }).addTo(capaRuta);
    });

    nav.paradas.forEach((parada) => {
      const icono = L.divIcon({
        className: "marcador-parada",
        html: `<span class="pin"><span>${parada.id}</span></span>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      const marcador = L.marker([parada.lat, parada.lng], {
        icon: icono,
        title: parada.nombre,
        alt: `Parada ${parada.id}: ${parada.nombre}`,
        riseOnHover: true,
        keyboard: true,
      }).addTo(capaMarcadores);

      const nodo = marcador.getElement();
      if (nodo) {
        nodo.setAttribute("role", "button");
        nodo.setAttribute("aria-label", `Parada ${parada.id}: ${parada.nombre}`);
        nodo.addEventListener("keydown", (evento) => {
          if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            alTocarParada?.(parada.id);
          }
        });
      }

      marcador.on("click", () => alTocarParada?.(parada.id));
      marcadores.set(parada.id, {
        marcador,
        nodo,
        indice: parada.indice,
      });
    });

    const puntos = [];
    nav.circuito.tramos.forEach((id) => {
      nav.tramos[id].coords.forEach((coord) => puntos.push(coord));
    });
    bounds = L.latLngBounds(puntos);
    centrarRuta();
  }

  function actualizarEstado(objetivo, visitadas, completado) {
    marcadores.forEach(({ marcador, nodo, indice }, id) => {
      const visitada = visitadas.includes(id);
      const esObjetivo = !completado && indice === objetivo;
      if (nodo) {
        nodo.classList.toggle("es-visitada", visitada);
        nodo.classList.toggle("es-objetivo", esObjetivo);
        if (esObjetivo) {
          nodo.setAttribute("aria-current", "step");
        } else {
          nodo.removeAttribute("aria-current");
        }
      }
      marcador.setZIndexOffset(esObjetivo ? 800 : visitada ? -100 : 0);
    });
  }

  function actualizarUbicacion(latlng, precision) {
    const radio = Math.max(10, Math.min(Number(precision) || 20, 400));

    if (!gpsMarcador) {
      const icono = L.divIcon({
        className: "marcador-gps",
        html: '<span class="gps-punto"></span>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      gpsMarcador = L.marker(latlng, {
        icon: icono,
        interactive: false,
        keyboard: false,
        zIndexOffset: 2000,
      }).addTo(mapa);
      gpsCirculo = L.circle(latlng, {
        radius: radio,
        color: "#1d4ed8",
        weight: 1,
        opacity: 0.3,
        fillColor: "#1d4ed8",
        fillOpacity: 0.08,
        interactive: false,
      }).addTo(mapa);
    } else {
      gpsMarcador.setLatLng(latlng);
      gpsCirculo.setLatLng(latlng);
      gpsCirculo.setRadius(radio);
    }

    if (siguiendo) {
      mapa.panTo(latlng, {
        animate: !reducido,
        duration: 0.45,
        easeLinearity: 0.25,
      });
    }
  }

  function centrarEn(latlng, zoom = 16.5) {
    if (reducido) {
      mapa.setView(latlng, zoom, { animate: false });
      return;
    }
    mapa.flyTo(latlng, zoom, { duration: 0.8 });
  }

  function seguir(activo) {
    siguiendo = Boolean(activo);
  }

  function estaSiguiendo() {
    return siguiendo;
  }

  function acercar() {
    mapa.zoomIn(0.5);
  }

  function alejar() {
    mapa.zoomOut(0.5);
  }

  return {
    mapa,
    dibujar,
    actualizarEstado,
    actualizarUbicacion,
    centrarEn,
    centrarRuta,
    seguir,
    estaSiguiendo,
    acercar,
    alejar,
  };
}
