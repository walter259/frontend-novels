export function formatText(raw: string): string {
  // Elimina espacios dobles y normaliza los saltos de línea
  let text = raw
    .replace(/\r/g, '') // eliminar retornos de carro si hay
    .replace(/\n{2,}/g, '\n') // evita saltos dobles innecesarios
    .replace(/[ \t]+/g, ' ') // elimina múltiples espacios
    .trim();

  // Separa párrafos por doble salto de línea si detecta final de punto
  text = text.replace(/([.!?])\s*(?=[A-ZÁÉÍÓÚÑ])/g, '$1\n\n');

  // Formatea líneas de diálogos (opcional, si usas guiones)
  text = text.replace(/(^|\n)[—\-]\s*/g, '$1— ');

  // Detecta canciones o poemas (líneas con muchas repeticiones o mayúsculas)
  text = text.replace(/(\n)?(["«"]?[A-Z][^.:!?]{1,80}[.:!?]?["»"]?)(\n)?/g, (match, p1, p2) => {
    if (/ah|oh|Yantala|cacao|vuela/i.test(p2)) {
      return `\n\n${p2.trim()}\n`;
    }
    return `${p1 || ''}${p2}${p1 ? '' : '\n\n'}`;
  });

  // Arregla posibles espacios antes de signos de puntuación
  text = text.replace(/ ([.,!?:;])/g, '$1');

  return text.trim();
} 