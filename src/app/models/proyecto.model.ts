import { NombreIcono } from './icono.model';

export interface Tecnologia {
  nombre: string;
  icono?: NombreIcono;
  /** Cómo la usamos; se muestra al presionar su tecla en el teclado del stack. */
  uso?: string;
  /** Letra del teclado real que presiona esta tecla (se rotula al frente del keycap). */
  atajo?: string;
}

export interface Integrante {
  nombre: string;
  rol: string;
}

/** Tipo de proyecto (el mismo que guarda el backend); filtra la página /proyectos. */
export type Categoria = 'software' | 'landing' | 'tienda' | 'catalogo';

export const CATEGORIAS: { id: Categoria; plural: string }[] = [
  { id: 'software', plural: 'Software a la medida' },
  { id: 'landing', plural: 'Landing pages' },
  { id: 'tienda', plural: 'Tiendas en línea' },
  { id: 'catalogo', plural: 'Catálogos web' },
];

export interface Proyecto {
  id: string;
  nombre: string;
  etiqueta: string;
  categoria: Categoria;
  descripcion: string;
  stack: Tecnologia[];
  /** Usuarios registrados; ausente en proyectos sin usuarios (p. ej. un sitio informativo). */
  usuarios?: number;
  /** Fecha ISO (yyyy-MM-dd) en que entró en operación. */
  desde: string;
  equipo: Integrante[];
  /** Recorrido en video del sistema (con datos ficticios), ruta bajo `public/`. Sin él, la tarjeta no lleva video. */
  video?: { src: string; poster: string };
  /** Solo sitios web públicos (landings, tiendas): se muestra con enlace en la barra del marco. El software a la medida no lleva dominio. */
  dominio?: string;
}

export interface Servicio {
  id: string;
  /** Filtro de /proyectos al que lleva el servicio. */
  tipo: Categoria;
  nombre: string;
  descripcion: string;
}
