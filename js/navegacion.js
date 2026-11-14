import { CIRCUITOS, PARADAS, TRAMOS } from "./datos.js";
import {
  crearLinea,
  distanciaMetros,
  longitudKm,
  puntoMasCercano,
  suavizar,
} from "./geo.js";

const cacheTramos = new Map();
let cacheFactores = null;

function obtenerTramo(id) {
  if (!cacheTramos.has(id)) {
    const def = TRAMOS[id];
    const coords = suavizar(def.coords);
    const linea = crearLinea(coords);
    const km = longitudKm(coords);
    cacheTramos.set(id, {
      id,
      coords,
      linea,
      color: def.color,
      km,
    });
  }
  return cacheTramos.get(id);
}

function calcularFactores() {
  if (cacheFactores) {
    return cacheFactores;
  }

  const corto = CIRCUITOS.guardianes;
  const geoCorto = corto.tramos.reduce(
    (total, id) => total + obtenerTramo(id).km,
    0,
  );
  const factorBase = corto.distanciaKm / geoCorto;

  const largo = CIRCUITOS.lucumos;
  const geoBaseLargo = largo.tramos
    .filter((id) => id !== "extension")
    .reduce((total, id) => total + obtenerTramo(id).km, 0);
  const geoExtension = obtenerTramo("extension").km;
  let factorExtension =
    (largo.distanciaKm - geoBaseLargo * factorBase) / geoExtension;

  if (
    !Number.isFinite(factorExtension) ||
    factorExtension < 0.5 ||
    factorExtension > 3
  ) {
    const geoLargo = largo.tramos.reduce(
      (total, id) => total + obtenerTramo(id).km,
      0,
    );
    factorExtension = largo.distanciaKm / geoLargo;
  }

  cacheFactores = {
    guardianes: Object.fromEntries(
      corto.tramos.map((id) => [id, factorBase]),
    ),
    lucumos: Object.fromEntries(
      largo.tramos.map((id) => [
        id,
        id === "extension" ? factorExtension : factorBase,
      ]),
    ),
  };

  return cacheFactores;
}

function concatenar(lista) {
  const salida = [];
  lista.forEach((coords) => {
    coords.forEach(([lat, lng]) => {
      const ultimo = salida[salida.length - 1];
      if (!ultimo || ultimo[0] !== lat || ultimo[1] !== lng) {
        salida.push([lat, lng]);
      }
    });
  });
  return salida;
}

export function prepararCircuito(circuito) {
  const factores = calcularFactores()[circuito.id];
  const tramos = {};
  let geografico = 0;
  let calibrado = 0;

  circuito.tramos.forEach((id) => {
    const base = obtenerTramo(id);
    const factor = factores[id] ?? 1;
    const kmCalibrado = base.km * factor;
    tramos[id] = {
      ...base,
      factor,
      inicioKm: calibrado,
      finKm: calibrado + kmCalibrado,
      kmCalibrado,
      geomInicioKm: geografico,
      geomFinKm: geografico + base.km,
    };
    geografico += base.km;
    calibrado += kmCalibrado;
  });

  const lineaCoords = concatenar(circuito.tramos.map((id) => tramos[id].coords));
  const linea = crearLinea(lineaCoords);

  const paradas = circuito.paradas.map((id, indice) => {
    const parada = PARADAS[id];
    const tramoId = circuito.tramoDeParada[id];
    const tramo = tramos[tramoId];
    const punto = puntoMasCercano(tramo.linea, parada);
    return {
      ...parada,
      indice,
      tramo: tramoId,
      avanceM:
        (tramo.inicioKm + punto.properties.location * tramo.factor) * 1000,
    };
  });

  return {
    circuito,
    tramos,
    linea,
    lineaCoords,
    paradas,
    totalKm: calibrado,
    totalM: calibrado * 1000,
  };
}

function avanceCalibrado(nav, geometriaKm) {
  const ids = nav.circuito.tramos;
  for (let i = 0; i < ids.length; i += 1) {
    const tramo = nav.tramos[ids[i]];
    if (geometriaKm <= tramo.geomFinKm + 1e-9) {
      const dentro = Math.max(0, geometriaKm - tramo.geomInicioKm);
      return Math.min(nav.totalKm, tramo.inicioKm + dentro * tramo.factor);
    }
  }
  return nav.totalKm;
}

export function evaluar(posicion, nav, indice) {
  const punto = puntoMasCercano(nav.linea, posicion);
  const avanceKm = avanceCalibrado(nav, punto.properties.location);
  const avanceM = avanceKm * 1000;
  const distanciaLineaM = punto.properties.dist * 1000;
  const parada = nav.paradas[indice];
  return {
    avanceM,
    distanciaLineaM,
    restanteM: parada ? Math.max(0, parada.avanceM - avanceM) : 0,
    distanciaParadaM: parada ? distanciaMetros(posicion, parada) : Infinity,
    fueraRuta: distanciaLineaM > 60,
  };
}

export function distanciaParada(posicion, parada) {
  return distanciaMetros(posicion, parada);
}
