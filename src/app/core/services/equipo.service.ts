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
