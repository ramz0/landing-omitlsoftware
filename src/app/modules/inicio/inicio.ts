import {
  afterNextRender,
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import gsap from 'gsap';


import { EquipoService } from '@core/services/equipo.service';
import { ServiciosService } from '@core/services/servicios.service';
import { ProyectosService } from '@core/services/proyectos.service';
import { FormContacto } from '@shared/components/form-contacto/form-contacto';
import { Boton } from '@shared/components/boton/boton';
import { LineasVelocidad } from '@shared/components/lineas-velocidad/lineas-velocidad';
import { ScrollWorld } from '@shared/components/scroll-world/scroll-world';
import { PersonaCard } from '@shared/components/persona-card/persona-card';
import { NavNodos } from '@shared/components/nav-nodos/nav-nodos';
import { Escritorio } from '@shared/components/escritorio/escritorio';
import { ProyectoCard } from '@shared/components/proyecto-card/proyecto-card';

@Component({
  selector: 'app-inicio',
  imports: [LineasVelocidad, ScrollWorld, ProyectoCard, PersonaCard, Escritorio, Boton, NavNodos, FormContacto],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Inicio {
  private proyectosSvc = inject(ProyectosService);
  private equipoEl = viewChild<ElementRef<HTMLElement>>('equipo');

  /** Pasa a true la primera vez que el equipo entra en pantalla y ya no vuelve a false. */
  equipoVisto = signal(false);

  /** Escalonado invertido: las tarjetas que eran altas pasan a ser bajas. */
  invertido = signal(false);

  /** Offset vertical de la tarjeta i: las bajas bajan 1.5rem en desktop; en móvil (columna) no hay escalonado. */
  private destino(i: number) {
    if (innerWidth <= 700) return 0;
    return (i % 2 === 1) !== this.invertido() ? 24 : 0;
  }

  private tarjetas() {
    return Array.from(this.equipoEl()?.nativeElement.children ?? []);
  }

  /** Pasar el mouse por una tarjeta baja la levanta e invierte el escalonado (se mantiene tras el hover). */
  alternar(i: number) {
    if (!this.equipoVisto() || (i % 2 === 1) === this.invertido()) return;
    this.invertido.update((v) => !v);
    gsap.to(this.tarjetas(), { y: (j) => this.destino(j), duration: 0.7, ease: 'power3.out', overwrite: 'auto' });
  }

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const el = this.equipoEl()?.nativeElement;
      if (!el) return;
      const io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          this.equipoVisto.set(true);
          io.disconnect();
        },
        { threshold: 0.2 },
      );
      io.observe(el);
      destroyRef.onDestroy(() => io.disconnect());
    });

    // Con #seccion en la URL, el contenido que carga de la API (proyectos, equipo) empuja la página:
    // al tener ambos, se vuelve a la sección pedida.
    let ancló = false;
    afterRenderEffect(() => {
      const id = location.hash.slice(1);
      if (ancló || !id || !this.proyectos().length || !this.personas().length) return;
      ancló = true;
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
    });

    // Entrada (una vez, cuando ya hay tarjetas): las altas suben, las bajas bajan.
    let entro = false;
    afterRenderEffect(() => {
      if (entro || !this.equipoVisto() || !this.personas().length) return;
      entro = true;
      const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
      gsap.fromTo(
        this.tarjetas(),
        { opacity: 0, y: (i) => this.destino(i) + (i % 2 === 0 ? 48 : -48) },
        { opacity: 1, y: (i) => this.destino(i), duration: reducido ? 0 : 0.9, ease: 'power3.out', stagger: 0.1 },
      );
    });
  }

  personas = inject(EquipoService).personas;
  servicios = inject(ServiciosService).servicios;
  proyectos = this.proyectosSvc.proyectos;
  tecnologias = this.proyectosSvc.tecnologias;
  totalProyectos = this.proyectosSvc.totalProyectos;
  totalUsuarios = this.proyectosSvc.totalUsuarios;
  desdeAnio = this.proyectosSvc.desdeAnio;

  readonly email = 'contacto@omitlsoftware.com.mx';
  /** Número de WhatsApp con lada (52…); vacío = no se muestra el botón. */
  readonly whatsapp = '';

  readonly pasos = [
    { titulo: '1. Entendemos tu operación', texto: 'Qué haces hoy, dónde se atora y quién lo usa.' },
    { titulo: '2. Primera versión usable', texto: 'Lo mínimo que resuelve el problema, en producción.' },
    { titulo: '3. Crecemos contigo', texto: 'Ajustes con tu equipo trabajando sobre el sistema real.' },
    { titulo: '4. Soporte continuo', texto: 'Seguimos cuidando que funcione cada día.' },
  ];
}
