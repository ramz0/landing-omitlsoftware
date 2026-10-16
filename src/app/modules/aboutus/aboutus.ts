import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ProyectosService } from '@core/services/proyectos.service';
import { ServiciosService } from '@core/services/servicios.service';
import { Boton } from '@shared/components/boton/boton';
import { EnConstruccion } from '@shared/components/en-construccion/en-construccion';

/** /aboutus: quiénes somos. Habla sobre todo de omitl; el equipo (aún en construcción) va al final. */
@Component({
  selector: 'app-aboutus',
  imports: [EnConstruccion, Boton],
  templateUrl: './aboutus.html',
  styleUrl: './aboutus.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutUs {
  private proyectosSvc = inject(ProyectosService);

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
