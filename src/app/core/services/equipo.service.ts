import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

import { Persona, RedSocial } from '@models/equipo.model';
import { environment } from '../../../environments/environment';

/** Lo que devuelve GET /api/equipo (models.MiembroPublico en el backend). */
interface MiembroApi {
  nombre: string;
  rol: string;
  foto: string;
  bio: string;
  instagram: string;
  github: string;
  linkedin: string;
}

const ROLES: Record<string, string> = {
  product_owner: 'Fundador',
  sistemas: 'Sistemas',
  scrum_master: 'Scrum Master',
  direccion_marketing: 'Dirección de marketing',
  dev: 'Desarrollo',
  asistente_marketing: 'Marketing',
};

/** "LUIS RAMÍREZ DURÁN" (la API guarda los nombres en mayúsculas) → "Luis Ramírez Durán". */
const titulo = (s: string) => s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

/** Las tres redes de cada persona; sin url el botón queda deshabilitado. */
const redes = (m: MiembroApi): RedSocial[] => [
  { nombre: 'Instagram', icono: 'instagram', url: m.instagram || undefined },
  { nombre: 'GitHub', icono: 'github', url: m.github || undefined },
  { nombre: 'LinkedIn', icono: 'linkedin', url: m.linkedin || undefined },
];

@Injectable({ providedIn: 'root' })
export class EquipoService {
  readonly personas = signal<Persona[]>([]);

  constructor() {
    if (environment.equipoPrueba) {
      const foto = (c: string) =>
        `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="${c}"/></svg>`)}`;
      this.personas.set(
        ['#2f6f5e', '#8a5a2b', '#3b4a8a', '#7a2f5a', '#555'].map((c, i) => ({
          nombre: `Persona Prueba ${i + 1}`,
          rol: 'Desarrollo',
          descripcion: 'Texto de prueba para ver cómo cae la bio dentro de la tarjeta en desktop y móvil.',
          foto: foto(c),
          redes: redes({ instagram: '', github: '', linkedin: '' } as MiembroApi),
        })),
      );
      return;
    }
    inject(HttpClient)
      .get<MiembroApi[]>(`${environment.apiUrl}/api/equipo`)
      .subscribe({
        next: (miembros) =>
          this.personas.set(
            miembros.map((m) => ({
              nombre: titulo(m.nombre),
              rol: ROLES[m.rol] ?? m.rol,
              descripcion: m.bio,
              foto: m.foto ? `${environment.apiUrl}/api/agentes/foto/${m.foto}` : undefined,
              redes: redes(m),
            })),
          ),
        error: () => {}, // sin API la sección queda vacía; no rompe la landing
      });
  }
}
