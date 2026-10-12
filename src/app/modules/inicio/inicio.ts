import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { EquipoService } from '@core/services/equipo.service';
import { ServiciosService } from '@core/services/servicios.service';
import { ProyectosService } from '@core/services/proyectos.service';
import { Boton } from '@shared/components/boton/boton';
import { TecnologiaChip } from '@shared/components/tecnologia/tecnologia';
import { LineasVelocidad } from '@shared/components/lineas-velocidad/lineas-velocidad';
import { PersonaCard } from '@shared/components/persona-card/persona-card';
import { ProyectoCard } from '@shared/components/proyecto-card/proyecto-card';

@Component({
  selector: 'app-inicio',
  imports: [LineasVelocidad, ProyectoCard, TecnologiaChip, PersonaCard, Boton],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Inicio {
  private proyectosSvc = inject(ProyectosService);

  personas = inject(EquipoService).personas;
  servicios = inject(ServiciosService).servicios;
  proyectos = this.proyectosSvc.proyectos;
  tecnologias = this.proyectosSvc.tecnologias;
  totalProyectos = this.proyectosSvc.totalProyectos;
  totalUsuarios = this.proyectosSvc.totalUsuarios;
  desdeAnio = this.proyectosSvc.desdeAnio;

  readonly email = 'contacto@omitlsoftware.com.mx';
  readonly pasos = [
    { titulo: '1. Entendemos tu operación', texto: 'Qué haces hoy, dónde se atora y quién lo usa.' },
    { titulo: '2. Primera versión usable', texto: 'Lo mínimo que resuelve el problema, en producción.' },
    { titulo: '3. Crecemos contigo', texto: 'Ajustes con tu equipo trabajando sobre el sistema real.' },
    { titulo: '4. Soporte continuo', texto: 'Seguimos cuidando que funcione cada día.' },
  ];
}
