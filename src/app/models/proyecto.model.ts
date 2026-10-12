import { NombreIcono } from './icono.model';

export interface Tecnologia {
  nombre: string;
  icono?: NombreIcono;
}

export interface Integrante {
  nombre: string;
  rol: string;
}

export interface Proyecto {
  id: string;
  nombre: string;
  etiqueta: string;
  descripcion: string;
  stack: Tecnologia[];
  /** Usuarios registrados; ausente en proyectos sin usuarios (p. ej. un sitio informativo). */
  usuarios?: number;
  /** Fecha ISO (yyyy-MM-dd) en que entró en operación. */
  desde: string;
  equipo: Integrante[];
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
}
