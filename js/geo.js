const T = globalThis.turf;

function aTurf([lat, lng]) {
  return [lng, lat];
}

function interpolar(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

export function suavizar(coords, muestras = 10) {
  if (coords.length < 3) {
    return coords.map(([lat, lng]) => [lat, lng]);
  }

  const puntos = coords.map(aTurf);
  const ultimo = puntos.length - 1;
  const salida = [];

  for (let i = 0; i < ultimo; i += 1) {
    const p0 = puntos[Math.max(0, i - 1)];
    const p1 = puntos[i];
    const p2 = puntos[i + 1];
    const p3 = puntos[Math.min(ultimo, i + 2)];
    const alpha = 0.5;
    const t0 = 0;
    const t1 = t0 + Math.max(1e-6, Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) ** alpha);
    const t2 = t1 + Math.max(1e-6, Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) ** alpha);
    const t3 = t2 + Math.max(1e-6, Math.hypot(p3[0] - p2[0], p3[1] - p2[1]) ** alpha);

    for (let j = 0; j < muestras; j += 1) {
      const t = t1 + ((t2 - t1) * j) / muestras;
      const a1 = p0 === p1 ? p1 : interpolar(p0, p1, (t - t0) / (t1 - t0));
      const a2 = interpolar(p1, p2, (t - t1) / (t2 - t1));
      const a3 = p3 === p2 ? p2 : interpolar(p2, p3, (t - t2) / (t3 - t2));
      const b1 = interpolar(a1, a2, (t - t0) / (t2 - t0));
      const b2 = interpolar(a2, a3, (t - t1) / (t3 - t1));
      const c = interpolar(b1, b2, (t - t1) / (t2 - t1));
      salida.push([c[1], c[0]]);
    }
  }

  const fin = coords[coords.length - 1];
  salida.push([fin[0], fin[1]]);
  return salida;
}

export function crearLinea(coords) {
  return T.lineString(coords.map(aTurf));
}

export function longitudKm(coords) {
  return T.length(crearLinea(coords), { units: "kilometers" });
}

export function puntoMasCercano(linea, punto) {
  return T.nearestPointOnLine(linea, aTurf([punto.lat, punto.lng]), {
    units: "kilometers",
  });
}

export function distanciaMetros(a, b) {
  return (
    T.distance(aTurf([a.lat, a.lng]), aTurf([b.lat, b.lng]), {
      units: "meters",
    }) || 0
  );
}
