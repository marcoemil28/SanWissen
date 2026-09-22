/**
 * Kleiner Prüfer für die Schemas unter content/schema/.
 *
 * Deckt bewusst nur die Teilmenge von JSON Schema ab, die dort vorkommt:
 * type, enum, properties, required, additionalProperties (bool und Schema),
 * propertyNames, items, minItems/maxItems, minLength, minimum/maximum und
 * pattern. Alles andere wird ignoriert.
 *
 * Grund für die eigene Umsetzung statt einer Bibliothek: die Schemas
 * richten sich in erster Linie an den Editor, der sie selbst auswertet.
 * Hier geht es nur darum, dass ein Fehler auch im Build auffällt, und dafür
 * lohnt keine zusätzliche Abhängigkeit. Wer das Schema um weitere
 * Schlüsselwörter ergänzt, muss sie hier nachtragen.
 */

const TYPES = {
  string: (v) => typeof v === 'string',
  number: (v) => typeof v === 'number',
  integer: (v) => Number.isInteger(v),
  boolean: (v) => typeof v === 'boolean',
  object: (v) => v !== null && typeof v === 'object' && !Array.isArray(v),
  array: Array.isArray,
  null: (v) => v === null,
};

/** Prüft `value` gegen `schema`. Liefert eine Liste von Meldungen. */
export function validate(value, schema, path = '') {
  const out = [];
  const at = path || '(Wurzel)';
  if (!schema || typeof schema !== 'object') return out;

  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((t) => TYPES[t]?.(value))) {
      out.push(`${at}: erwartet ${types.join(' oder ')}, ist ${value === null ? 'null' : typeof value}`);
      return out;
    }
  }
  if (schema.enum && !schema.enum.includes(value)) {
    out.push(`${at}: "${value}" ist nicht erlaubt (erwartet: ${schema.enum.join(', ')})`);
  }
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      // Die Meldung nennt die Bedingung: `minLength` ist längst nicht mehr
      // überall 1, und „darf nicht leer sein" führte bei 20 in die Irre.
      out.push(
        schema.minLength === 1
          ? `${at}: darf nicht leer sein`
          : `${at}: braucht mindestens ${schema.minLength} Zeichen, hat ${value.length}`,
      );
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      out.push(`${at}: "${value}" passt nicht auf ${schema.pattern}`);
    }
  }
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) out.push(`${at}: ${value} < ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) out.push(`${at}: ${value} > ${schema.maximum}`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      out.push(`${at}: braucht mindestens ${schema.minItems} Einträge`);
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      out.push(`${at}: höchstens ${schema.maxItems} Einträge erlaubt`);
    }
    if (schema.items) {
      value.forEach((v, i) => out.push(...validate(v, schema.items, `${path}[${i}]`)));
    }
  }
  if (TYPES.object(value)) {
    for (const key of schema.required ?? []) {
      if (!(key in value)) out.push(`${at}: Pflichtfeld "${key}" fehlt`);
    }
    for (const [key, v] of Object.entries(value)) {
      const p = path ? `${path}.${key}` : key;
      if (schema.propertyNames) out.push(...validate(key, schema.propertyNames, `${at} (Schlüssel "${key}")`));
      const sub = schema.properties?.[key];
      if (sub) {
        out.push(...validate(v, sub, p));
      } else if (schema.additionalProperties === false) {
        out.push(`${at}: unbekanntes Feld "${key}"`);
      } else if (typeof schema.additionalProperties === 'object') {
        out.push(...validate(v, schema.additionalProperties, p));
      }
    }
  }
  return out;
}
