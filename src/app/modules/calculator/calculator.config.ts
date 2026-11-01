/** Preguntas y fórmula del cotizador. Todo lo que cambia un precio vive aquí; el componente no tiene números.
 * ponytail: precios base y multiplicadores son estimaciones (hoja inversion_omitl.xlsx + commits propios);
 * ajustar con proyectos reales. Si crece, mover a la pantalla Precios del back y pedirlos por API. */

export interface Opcion {
  id: string;
  texto: string;
  detalle?: string;
  /** Multiplicador sobre el precio (1 = sin efecto). */
  factor?: number;
  /** Monto fijo que se suma (MXN, sin IVA). */
  suma?: number;
}

export interface Pregunta {
  id: 'objetivo' | 'hoy' | 'tamano' | 'gestion' | 'movilidad' | 'pago' | 'urgencia' | 'marca';
  titulo: string;
  opciones: Opcion[];
}

/** `objetivo` decide el servicio; su `id` es el id de ServiciosService. */
export const PREGUNTAS: Pregunta[] = [
  {
    id: 'objetivo',
    titulo: '¿Qué quieres lograr?',
    opciones: [
      { id: 'landing', texto: 'Que más clientes me encuentren', detalle: 'Una página profesional para tu negocio' },
      { id: 'tienda', texto: 'Vender por internet', detalle: 'Catálogo, carrito y pagos' },
      { id: 'software', texto: 'Ordenar la operación de mi negocio', detalle: 'Un sistema hecho a tu medida' },
      { id: 'movil', texto: 'Tener una app para mis clientes o mi equipo' },
      { id: 'llamadas', texto: 'Atender o vender por teléfono', detalle: 'Agente de llamadas' },
      { id: 'pos', texto: 'Cobrar y controlar mi inventario', detalle: 'Punto de venta en la nube' },
    ],
  },
  {
    id: 'hoy',
    titulo: '¿Cómo lo haces hoy?',
    opciones: [
      { id: 'nada', texto: 'Todavía no lo hago' },
      { id: 'papel', texto: 'En papel o en Excel' },
      { id: 'whatsapp', texto: 'Con WhatsApp y redes sociales' },
      { id: 'sistema', texto: 'Con otro sistema o página', detalle: 'Hay que migrar o rehacer', factor: 1.15 },
    ],
  },
  {
    id: 'tamano',
    titulo: '¿Qué tan grande es tu negocio?',
    opciones: [
      { id: 'chico', texto: 'De 1 a 5 personas' },
      { id: 'mediano', texto: 'De 6 a 20 personas', factor: 1.25 },
      { id: 'grande', texto: 'Más de 20 personas', factor: 1.6 },
    ],
  },
  {
    id: 'gestion',
    titulo: '¿Qué es lo más difícil de gestionar hoy?',
    opciones: [
      { id: 'pedidos', texto: 'Pedidos, citas o inventario' },
      { id: 'cobros', texto: 'Cobros y corte de caja' },
      { id: 'seguimiento', texto: 'Dar seguimiento a clientes o prospectos' },
      { id: 'equipo', texto: 'Coordinar a mi equipo' },
      { id: 'visibilidad', texto: 'Que me encuentren y me contacten' },
      { id: 'nada', texto: 'Nada difícil por ahora' },
    ],
  },
  {
    id: 'movilidad',
    titulo: '¿Alguien necesita usarlo desde el celular o fuera de la oficina?',
    opciones: [
      { id: 'equipo', texto: 'Mi equipo, en ruta, en campo o de visita' },
      { id: 'clientes', texto: 'Mis clientes: pedir, reservar o seguir su pedido' },
      { id: 'no', texto: 'No, desde la computadora está bien' },
    ],
  },
  {
    id: 'pago',
    titulo: '¿Cómo te gustaría pagar?',
    opciones: [
      { id: 'unico', texto: 'Un solo pago por el proyecto' },
      { id: 'mixto', texto: 'Un pago inicial más una mensualidad menor', detalle: 'Incluye mantenimiento y mejoras' },
      { id: 'mensual', texto: 'Solo una mensualidad', detalle: 'Mejoras y actualizaciones siempre que mi negocio las necesite' },
    ],
  },
  {
    id: 'urgencia',
    titulo: '¿Para cuándo lo necesitas?',
    opciones: [
      { id: 'sinprisa', texto: 'Sin prisa' },
      { id: 'pronto', texto: 'En 1 o 2 meses', factor: 1.1 },
      { id: 'urgente', texto: 'Lo antes posible', factor: 1.3 },
    ],
  },
  {
    id: 'marca',
    titulo: '¿Ya tienes logo y colores?',
    opciones: [
      { id: 'si', texto: 'Sí, ya tengo mi imagen' },
      { id: 'no', texto: 'No, necesito ayuda con eso', suma: 2500 },
    ],
  },
];

/** Precio base (MXN sin IVA) para un negocio chico, sin prisa. `null` = se cotiza en una llamada. */
export const BASE: Record<string, number | null> = {
  landing: 8000,
  tienda: 24000,
  software: 90000,
  movil: null,
  llamadas: null,
  pos: null,
};

/** Mensualidad base (MXN sin IVA, negocio chico) cuando se paga por suscripción con mejoras y soporte continuos.
 * ponytail: estimado a partir de mis contratos en nómina (Nexus, MiPaay), no de una tarifa publicada; ajustar con datos reales. */
export const MENSUAL: Record<string, number | null> = { landing: 1500, tienda: 3500, software: 9000, movil: null, llamadas: null, pos: null };

/** Con pago mixto: parte del precio único que se paga al inicio y parte de la mensualidad completa. */
const MIXTO = { inicial: 0.5, mensual: 0.5 };

/** Lo que nosotros proponemos incluir: el cliente no tiene que saber cuántas secciones necesita. */
export const PROPUESTA: Record<string, string[]> = {
  landing: ['Inicio con un mensaje claro', 'Quiénes somos', 'Tus servicios', 'Preguntas frecuentes', 'Botón de WhatsApp', 'Diseño para celular y computadora'],
  tienda: ['Catálogo con fotos', 'Carrito y pagos', 'Panel para ver tus pedidos', 'Botón de WhatsApp', 'Preguntas frecuentes'],
  software: ['Acceso por usuarios y permisos', 'Panel con lo importante del día', 'Reportes', 'Respaldo de tu información', 'Capacitación a tu equipo'],
  movil: ['Diseño pensado para el celular', 'Acceso de clientes o equipo', 'Notificaciones', 'Publicación en las tiendas de apps'],
  llamadas: ['Agente que llama y atiende', 'Seguimiento de cada contacto', 'Resumen de cada llamada', 'Panel para ver resultados'],
  pos: ['Cobro en mostrador', 'Control de inventario', 'Corte de caja', 'Reporte de ventas'],
};

/** Qué le resuelve cada servicio, dicho en su idioma (se muestra en el resultado). */
export const DESCRIPCION: Record<string, string> = {
  landing: 'Un entorno de venta visible que puedes compartir por código QR, WhatsApp, Google Maps y donde te encuentren tus clientes.',
  tienda: 'Tus productos en línea, con el inventario actualizado en automático, cobros y envíos.',
  software: 'Es nuestra especialidad: creamos un sistema para ti y tu equipo, y trabajamos los procesos que nos contaste.',
  movil: 'Tu servicio en el teléfono de tus clientes y de tu equipo, con avisos y acceso directo.',
  llamadas: 'Un agente que llama y atiende por ti, con seguimiento y resumen de cada llamada.',
  pos: 'Cobra, controla tu inventario y revisa las ventas del día desde la nube.',
};

/** Cómo suena el punto de partida del cliente en el resultado ("Partimos de…"). */
export const PUNTO_DE_PARTIDA: Record<string, string> = {
  nada: 'empezar desde cero, sin cargar con nada anterior',
  papel: 'pasar tu papel y tu Excel a un sistema que se actualice solo',
  whatsapp: 'ordenar lo que hoy manejas por WhatsApp y redes sociales',
  sistema: 'mejorar o reemplazar lo que ya usas',
};

/** Redondea a $500 (hasta $20 mil) o $1,000 para no aparentar una precisión que no hay. */
const redondear = (n: number) => { const paso = n < 20000 ? 500 : 1000; return Math.round(n / paso) * paso; };

/** Rango (±20 %) del servicio indicado, o `null` si se cotiza aparte. */
export function cotizar(respuestas: Record<string, string>, servicio: string): { min: number; max: number } | null {
  const base = BASE[servicio];
  if (base == null) return null;
  let precio = base;
  let suma = 0;
  for (const p of PREGUNTAS) {
    const o = p.opciones.find((x) => x.id === respuestas[p.id]);
    precio *= o?.factor ?? 1;
    suma += o?.suma ?? 0;
  }
  precio += suma;
  return { min: redondear(precio * 0.8), max: redondear(precio * 1.2) };
}

export interface Monto { etiqueta: string; min: number; max: number }

/** Montos según cómo quiere pagar (pago único, mensualidad o inicial + mensualidad); `null` si se cotiza aparte. */
export function cotizarPago(respuestas: Record<string, string>, servicio: string): Monto[] | null {
  const unico = cotizar(respuestas, servicio);
  const base = MENSUAL[servicio];
  if (!unico || base == null) return null;
  const factor = PREGUNTAS.reduce((f, p) => f * (p.opciones.find((o) => o.id === respuestas[p.id])?.factor ?? 1), 1);
  const mensual = (k: number) => ({ etiqueta: 'al mes', min: redondear(base * factor * k * 0.8), max: redondear(base * factor * k * 1.2) });
  switch (respuestas['pago']) {
    case 'mensual': return [mensual(1)];
    case 'mixto': return [{ etiqueta: 'de inicio', min: redondear(unico.min * MIXTO.inicial), max: redondear(unico.max * MIXTO.inicial) }, mensual(MIXTO.mensual)];
    default: return [{ etiqueta: 'pago único', ...unico }];
  }
}

/** Puntos que cada respuesta le da a cada servicio. Lo que se eligió en `objetivo` pesa mucho; el resto matiza. */
const AFINIDAD: Record<string, Record<string, Record<string, number>>> = {
  objetivo: {
    landing: { landing: 10 }, tienda: { tienda: 10 }, software: { software: 10 },
    movil: { movil: 10 }, llamadas: { llamadas: 10 }, pos: { pos: 10 },
  },
  hoy: {
    nada: { landing: 2 },
    papel: { software: 3, pos: 2 },
    whatsapp: { tienda: 2, landing: 1, llamadas: 1 },
    sistema: { software: 3 },
  },
  tamano: {
    chico: { landing: 1 },
    mediano: { software: 1, pos: 1 },
    grande: { software: 3, llamadas: 1 },
  },
  gestion: {
    pedidos: { software: 3, pos: 2, tienda: 1 },
    cobros: { pos: 4, software: 1 },
    seguimiento: { llamadas: 3, software: 2 },
    equipo: { software: 3, movil: 2 },
    visibilidad: { landing: 3, tienda: 1 },
  },
  movilidad: {
    equipo: { movil: 4, software: 1 },
    clientes: { movil: 3, tienda: 2 },
  },
  pago: {
    unico: { landing: 1, tienda: 1 },
    mixto: { software: 1, pos: 1, movil: 1 },
    mensual: { software: 2, pos: 2, llamadas: 1, movil: 1 },
  },
  urgencia: { urgente: { landing: 1 } },
  marca: { no: { landing: 1 } },
};

/** Por qué una opción puede convenir aunque no sea la principal. */
export const RAZON: Record<string, string> = {
  landing: 'Si buscas solo posicionamiento en Google Maps o algo más sencillo, sin carrito, precios ni cobros, una landing es tu opción ideal.',
  tienda: 'Si quieres vender por internet con inventario, cobros y envíos, una tienda en línea es lo que necesitas.',
  software: 'En base a los procesos que nos cuentas, un sistema hecho a tu medida puede ser muy relevante.',
  movil: 'Si quieres que tus clientes o tu equipo te tengan siempre en su celular, una app es el siguiente paso.',
  llamadas: 'Si cuentas con una base de datos de clientes o prospectos, un agente de llamadas podría ser relevante para tu negocio.',
  pos: 'Si cobras en mostrador y llevas inventario, un punto de venta te ahorra el corte de caja y los conteos.',
};

/** Porcentaje de afinidad por servicio (suma 100), de mayor a menor. Cada servicio parte de medio punto para que nunca desaparezca. */
export function recomendar(respuestas: Record<string, string>): { id: string; pct: number }[] {
  const puntos: Record<string, number> = Object.fromEntries(Object.keys(BASE).map((id) => [id, 0.5]));
  for (const [preg, opcion] of Object.entries(respuestas))
    for (const [id, n] of Object.entries(AFINIDAD[preg]?.[opcion] ?? {})) puntos[id] += n;
  const total = Object.values(puntos).reduce((a, b) => a + b, 0);
  const filas = Object.entries(puntos).map(([id, p]) => ({ id, exacto: (p / total) * 100, pct: Math.floor((p / total) * 100) }));
  // Método del mayor resto: los enteros suman 100 exactos.
  let falta = 100 - filas.reduce((a, f) => a + f.pct, 0);
  for (const f of [...filas].sort((a, b) => (b.exacto % 1) - (a.exacto % 1))) if (falta-- > 0) f.pct++;
  return filas.map(({ id, pct }) => ({ id, pct })).sort((a, b) => b.pct - a.pct);
}
