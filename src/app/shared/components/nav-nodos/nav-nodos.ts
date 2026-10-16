import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';

const NODOS = [
  { id: 'inicio', nombre: 'Inicio' },
  { id: 'servicios', nombre: 'Servicios' },
  { id: 'proyectos', nombre: 'Proyectos' },
  { id: 'tecnologias', nombre: 'Tecnologías' },
  { id: 'equipo', nombre: 'Equipo' },
  { id: 'proceso', nombre: 'Cómo trabajamos' },
  { id: 'contacto', nombre: 'Contacto' },
];

/** Línea de tiempo vertical fija a la derecha: un nodo por sección, resalta la visible y navega al clic. */
@Component({
  selector: 'app-nav-nodos',
  template: `
    <nav aria-label="Secciones">
      @for (n of nodos; track n.id) {
        <a [href]="'#' + n.id" [class.activo]="n.id === activo()" [attr.aria-label]="n.nombre" [attr.aria-current]="n.id === activo() ? 'true' : null">
          <span class="etq">{{ n.nombre }}</span>
        </a>
      }
    </nav>
  `,
  styleUrl: './nav-nodos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavNodos {
  nodos = NODOS;
  activo = signal('inicio');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      // Franja fina en el centro de la pantalla: la sección que la cruza es la activa.
      const io = new IntersectionObserver(
        (es) => es.forEach((e) => e.isIntersecting && this.activo.set(e.target.id)),
        { rootMargin: '-50% 0px -50% 0px' },
      );
      NODOS.forEach((n) => {
        const el = document.getElementById(n.id);
        if (el) io.observe(el);
      });
      destroyRef.onDestroy(() => io.disconnect());
    });
  }
}
