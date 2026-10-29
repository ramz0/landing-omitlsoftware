import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';

const NODOS = [
  { id: 'inicio', nombre: 'Inicio' },
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
    <nav aria-label="Secciones" [class.oscuro]="oscuro()">
      @for (n of nodos; track n.id) {
        <a [href]="'#' + n.id" [class.activo]="n.id === activo()" [attr.aria-label]="n.nombre" [attr.aria-current]="n.id === activo() ? 'true' : null">
          <span class="etq">{{ n.nombre }}</span>
        </a>
      }
    </nav>
  `,
  styleUrl: './nav-nodos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:scroll)': 'medir()' },
})
export class NavNodos {
  nodos = NODOS;
  activo = signal('inicio');
  /** true si el fondo bajo la línea es oscuro: los puntos pasan a la paleta clara. */
  oscuro = signal(false);
  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private pendiente = false;

  /** Mira el color de fondo detrás de la línea (sube por los padres hasta uno opaco). */
  medir() {
    if (this.pendiente) return;
    this.pendiente = true;
    requestAnimationFrame(() => {
      this.pendiente = false;
      const nav = this.el.nativeElement;
      let e = document
        .elementsFromPoint(document.documentElement.clientWidth - 14, innerHeight / 2)
        .find((x) => !nav.contains(x)) as HTMLElement | undefined;
      for (; e; e = e.parentElement ?? undefined) {
        const [r, g, b, a = 1] = (getComputedStyle(e).backgroundColor.match(/[\d.]+/g) ?? []).map(Number);
        if (a > 0.5) return this.oscuro.set(0.299 * r + 0.587 * g + 0.114 * b < 140);
      }
      this.oscuro.set(false);
    });
  }

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
      this.medir();
      destroyRef.onDestroy(() => io.disconnect());
    });
  }
}
