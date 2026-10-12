import { NombreIcono } from './icono.model';

export interface RedSocial {
  nombre: string;
  icono: NombreIcono;
  /** Sin url el botón se muestra deshabilitado. */
  url?: string;
}

export interface Persona {
  nombre: string;
  rol: string;
  descripcion: string;
  /** Ruta de la foto (p. ej. /equipo/luis.webp); es el fondo de la card. Sin foto, fondo blanco. */
  foto?: string;
  redes: RedSocial[];
}
