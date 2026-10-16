import { afterRenderEffect, ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ServiciosService } from '@core/services/servicios.service';
import { ProyectosService } from '@core/services/proyectos.service';
import { Boton } from '@shared/components/boton/boton';
import { LineasVelocidad } from '@shared/components/lineas-velocidad/lineas-velocidad';
import { ScrollWorld } from '@shared/components/scroll-world/scroll-world';
import { NavNodos } from '@shared/components/nav-nodos/nav-nodos';
import { Escritorio } from '@shared/components/escritorio/escritorio';
import { ProyectoCard } from '@shared/components/proyecto-card/proyecto-card';

@Component({
  selector: 'app-inicio',
  imports: [LineasVelocidad, ScrollWorld, ProyectoCard, Escritorio, Boton, NavNodos],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Inicio {
  private proyectosSvc = inject(ProyectosService);
  constructor() {
    // Con #seccion en la URL, el contenido que carga de la API (proyectos) empuja la página:
    // al tenerlo, se vuelve a la sección pedida.
    let ancló = false;
    afterRenderEffect(() => {
      const id = location.hash.slice(1);
      if (ancló || !id || !this.proyectos().length) return;
      ancló = true;
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
    });
  }

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
