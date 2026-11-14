export function iniciarGPS({ onPosicion, onEstado, onError } = {}) {
  if (!("geolocation" in navigator)) {
    onEstado?.("sin-soporte");
    onError?.(new Error("Geolocalización no disponible"));
    return { detener() {} };
  }

  let watchId = null;
  let ultimaLectura = 0;

  onEstado?.("buscando");

  const opciones = {
    enableHighAccuracy: true,
    maximumAge: 2000,
    timeout: 20000,
  };

  const alRecibir = (posicion) => {
    const ahora = Date.now();
    if (ahora - ultimaLectura < 900) {
      return;
    }
    ultimaLectura = ahora;

    const coords = posicion.coords;
    const precision = Number.isFinite(coords.accuracy) ? coords.accuracy : 999;
    onEstado?.(precision <= 25 ? "activo" : "debil");
    onPosicion?.({
      lat: coords.latitude,
      lng: coords.longitude,
      precision,
      rumbo: Number.isFinite(coords.heading) ? coords.heading : null,
      velocidad: Number.isFinite(coords.speed) ? coords.speed : null,
      momento: posicion.timestamp,
    });
  };

  const alFallar = (error) => {
    if (error && error.code === 1) {
      onEstado?.("sin-permiso");
    } else {
      onEstado?.("error");
    }
    onError?.(error);
  };

  try {
    watchId = navigator.geolocation.watchPosition(
      alRecibir,
      alFallar,
      opciones,
    );
  } catch {
    onEstado?.("error");
    onError?.(new Error("No se pudo iniciar el GPS"));
  }

  return {
    detener() {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
    },
  };
}
