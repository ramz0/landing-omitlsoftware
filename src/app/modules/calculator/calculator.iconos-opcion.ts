/** Íconos de trazo (viewBox 24) de las respuestas del cotizador: cada uno ilustra su contenido. */
const o = (x: number, y: number, r: number) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

export const TRAZOS: Record<string, string[]> = {
  pin: ['M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z', o(12, 11, 2)],
  carrito: ['M3 4h2l2.2 10.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L19 8H6', o(9, 19, 1), o(17, 19, 1)],
  engrane: [o(12, 12, 3.5), 'M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8'],
  celular: ['M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z', 'M11 18h2'],
  telefono: ['M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z'],
  caja: ['M6 3h12v18l-3-2-3 2-3-2-3 2z', 'M9 8h6M9 12h6'],
  hoja: ['M7 3h7l5 5v13H7z', 'M14 3v5h5'],
  tabla: ['M5 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z', 'M4 10h16M10 5v14'],
  burbuja: ['M4 5h16v11H9l-4 4v-4H4z'],
  refrescar: ['M20 11a8 8 0 0 0-14-4M4 5v4h4M4 13a8 8 0 0 0 14 4M20 19v-4h-4'],
  persona: [o(12, 8, 3.5), 'M5 21c0-4 3-6 7-6s7 2 7 6'],
  personas: [o(9, 9, 3), 'M3 20c0-3.5 2.7-5 6-5s6 1.5 6 5', o(17, 8, 2.5), 'M16 14c3 0 5 1.5 5 4.5'],
  edificio: ['M6 3h12a1 1 0 0 1 1 1v17H5V4a1 1 0 0 1 1-1z', 'M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M11 21v-3h2v3'],
  paquete: ['M3 8l9-5 9 5v9l-9 5-9-5z', 'M3 8l9 5 9-5M12 13v9'],
  moneda: [o(12, 12, 9), 'M14.5 9.5a3 3 0 0 0-5 1c0 3 5 1.5 5 4.5a3 3 0 0 1-5 1M12 6.5V8M12 16v1.5'],
  checklista: ['M9 6h11M9 12h11M9 18h11M4 6l1.2 1.2L7 5M4 12l1.2 1.2L7 11M4 18l1.2 1.2L7 17'],
  lupa: [o(11, 11, 6), 'M16 16l5 5'],
  check: [o(12, 12, 9), 'M8 12.5l2.7 2.7L16 9.5'],
  monitor: ['M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M9 20h6M12 17v3'],
  billete: ['M5 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z', o(12, 12, 2.5), 'M6 10v4M18 10v4'],
  pastel: ['M12 3v9h9a9 9 0 1 1-9-9z', 'M15 3.5A9 9 0 0 1 20.5 9H15z'],
  calendario: ['M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z', 'M4 10h16M8 3v4M16 3v4'],
  rayo: ['M13 2L5 13h6l-1 9 8-11h-6z'],
  reloj: [o(12, 12, 9), 'M12 7v5l3 2'],
  brujula: [o(12, 12, 9), 'M15.5 8.5l-2 5-5 2 2-5z'],
  paleta: ['M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2-.6-1.2.2-2.5 1.6-2.5H17a4 4 0 0 0 4-4 9 9 0 0 0-9-9z', o(7.5, 11, 0.7), o(10, 7, 0.7), o(15, 7, 0.7)],
  pincel: ['M4 20l4-1 10-10-3-3L5 16z', 'M14 7l3 3'],
};

/** Qué ícono lleva cada respuesta, por `pregunta.respuesta`. */
export const ICONO_OPCION: Record<string, string> = {
  'objetivo.landing': 'pin', 'objetivo.tienda': 'carrito', 'objetivo.software': 'engrane',
  'objetivo.movil': 'celular', 'objetivo.llamadas': 'telefono', 'objetivo.pos': 'caja',
  'hoy.nada': 'hoja', 'hoy.papel': 'tabla', 'hoy.whatsapp': 'burbuja', 'hoy.sistema': 'refrescar',
  'tamano.chico': 'persona', 'tamano.mediano': 'personas', 'tamano.grande': 'edificio',
  'gestion.pedidos': 'paquete', 'gestion.cobros': 'moneda', 'gestion.seguimiento': 'checklista',
  'gestion.equipo': 'personas', 'gestion.visibilidad': 'lupa', 'gestion.nada': 'check',
  'movilidad.equipo': 'pin', 'movilidad.clientes': 'celular', 'movilidad.no': 'monitor',
  'pago.unico': 'billete', 'pago.mixto': 'pastel', 'pago.mensual': 'calendario',
  'urgencia.urgente': 'rayo', 'urgencia.mes': 'reloj', 'urgencia.trimestre': 'calendario', 'urgencia.explorando': 'brujula',
  'marca.si': 'paleta', 'marca.no': 'pincel',
};
