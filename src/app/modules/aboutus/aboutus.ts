import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { EquipoService } from '@core/services/equipo.service';
import { ProyectosService } from '@core/services/proyectos.service';
import { ServiciosService } from '@core/services/servicios.service';
import { Boton } from '@shared/components/boton/boton';
import { PersonaCard } from '@shared/components/persona-card/persona-card';

/** /aboutus: quiénes somos. Habla sobre todo de omitl; el equipo va al final, más breve que en la home. */
@Component({
  selector: 'app-aboutus',
  imports: [PersonaCard, Boton],
  templateUrl: './aboutus.html',
  styleUrl: './aboutus.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutUs {
  private proyectosSvc = inject(ProyectosService);

  personas = inject(EquipoService).personas;
  servicios = inject(ServiciosService).servicios;
  totalProyectos = this.proyectosSvc.totalProyectos;
  totalUsuarios = this.proyectosSvc.totalUsuarios;
  desdeAnio = this.proyectosSvc.desdeAnio;

  readonly principios = [
    { titulo: 'Que se use', texto: 'Medimos el software por el uso diario de la gente, no por lo que promete en una presentación.' },
    { titulo: 'A tu medida', texto: 'Partimos de cómo opera tu negocio y construimos encima, sin obligarte a cambiar tu forma de trabajar.' },
    { titulo: 'Entregas cortas', texto: 'Una primera versión usable en semanas y mejoras continuas sobre el sistema real.' },
    { titulo: 'Nos quedamos', texto: 'Mantenemos y damos soporte a lo que construimos; no lo entregamos y desaparecemos.' },
  ];
}
