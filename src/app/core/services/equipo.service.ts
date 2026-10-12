import { Injectable, signal } from '@angular/core';

import { Persona, RedSocial } from '@models/equipo.model';

/** Las tres redes de cada persona; sin url el botón queda deshabilitado. */
const redes = (urls: { instagram?: string; github?: string; linkedin?: string }): RedSocial[] => [
  { nombre: 'Instagram', icono: 'instagram', url: urls.instagram },
  { nombre: 'GitHub', icono: 'github', url: urls.github },
  { nombre: 'LinkedIn', icono: 'linkedin', url: urls.linkedin },
];

@Injectable({ providedIn: 'root' })
export class EquipoService {
  readonly personas = signal<Persona[]>([
    {
      nombre: 'Luis Ramírez Durán',
      rol: 'Fundador',
      descripcion:
        'Funda la idea de omitl software. Frontend y parte del backend en Mi Paay y Oportunidades Paay; desarrollo completo de The Money Center.',
      redes: redes({ github: 'https://github.com/ramz0' }),
    },
    {
      nombre: 'Jaquelin Barragán Marín',
      rol: 'Colaboradora',
      descripcion: 'Backend en Node.js en Mi Paay y Oportunidades Paay.',
      redes: redes({}),
    },
  ]);
}
