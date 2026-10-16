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

// ponytail: equipo ficticio para ver la escena con 5 personas; poner USAR_DEMO = false (y borrar
// public/equipo/demo-*.jpg) para volver a /api/equipo.
const USAR_DEMO = true;
const DEMO: Persona[] = [
  ['Sofía Ramírez', 'Fundadora', 'Creo soluciones con aplicaciones modernas y cuido la experiencia de cada usuario. Desarrollo en Go, Angular y Node.js.'],
  ['Mateo Herrera', 'Desarrollo', 'Construyo APIs rápidas y confiables. Me gusta que lo que escribo se use todos los días sin que nadie lo note.'],
  ['Valeria Núñez', 'Diseño UX/UI', 'Convierto procesos enredados en pantallas claras. Prototipo, pruebo con usuarios reales y vuelvo a ajustar.'],
  ['Diego Salazar', 'Sistemas', 'Cuido la infraestructura, los despliegues y que todo siga arriba a las 3 a. m. Automatizo lo repetitivo.'],
  ['Camila Ortega', 'Dirección de marketing', 'Ayudo a que cada proyecto se cuente bien y llegue a quien lo necesita, de la landing a las campañas.'],
].map(([nombre, rol, descripcion], i) => ({
  nombre,
  rol,
  descripcion,
  foto: `/equipo/demo-${i + 1}.jpg`,
  redes: [
    { nombre: 'Instagram', icono: 'instagram', url: 'https://instagram.com' },
    { nombre: 'GitHub', icono: 'github', url: 'https://github.com' },
    { nombre: 'LinkedIn', icono: 'linkedin', url: 'https://linkedin.com' },
  ] as RedSocial[],
}));

@Injectable({ providedIn: 'root' })
export class EquipoService {
  readonly personas = signal<Persona[]>([]);

  constructor() {
    if (USAR_DEMO) {
      this.personas.set(DEMO);
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
