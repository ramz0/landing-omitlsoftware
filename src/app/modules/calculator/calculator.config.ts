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
  id: 'objetivo' | 'hoy' | 'tamano' | 'urgencia' | 'marca';
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

/** Rango (±20 %) o `null` si el servicio se cotiza aparte. */
export function cotizar(respuestas: Record<string, string>): { min: number; max: number } | null {
  const base = BASE[respuestas['objetivo']];
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
