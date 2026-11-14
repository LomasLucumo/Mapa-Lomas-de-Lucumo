import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { normalizarIdioma, obtenerTexto, formatearTexto, catalogo } from '../js/idiomas.mjs';
import { PARADAS, CIRCUITOS } from '../js/datos.js';

test('idiomas válidos y español predeterminado', () => {
  assert.equal(normalizarIdioma('en'), 'en');
  assert.equal(normalizarIdioma('zh-Hans'), 'zh-Hans');
  assert.equal(normalizarIdioma('otro'), 'es');
});

test('todas las paradas y circuitos tienen traducciones', () => {
  for (const parada of Object.values(PARADAS)) {
    for (const texto of [parada.nombre, parada.descripcion]) {
      assert.ok(catalogo[texto]?.en, texto);
      assert.ok(catalogo[texto]?.['zh-Hans'], texto);
    }
  }
  for (const circuito of Object.values(CIRCUITOS)) {
    assert.ok(catalogo[circuito.nombre]?.en, circuito.nombre);
    assert.ok(catalogo[circuito.nombre]?.['zh-Hans'], circuito.nombre);
  }
});

test('alternativa española y contenido no disponible', () => {
  assert.equal(obtenerTexto('Entrada', 'en'), 'Entrance');
  assert.equal(obtenerTexto('Texto no traducido', 'en'), 'Texto no traducido');
  assert.equal(obtenerTexto('', 'en'), 'Contenido no disponible');
});

test('catálogo completo y formato sin mutaciones', () => {
  for (const [es, traducciones] of Object.entries(catalogo)) {
    assert.ok(es.trim());
    assert.ok(traducciones.en.trim(), es);
    assert.ok(traducciones['zh-Hans'].trim(), es);
  }
  assert.equal(formatearTexto('{cantidad} stops', { cantidad: 3 }), '3 stops');
});
