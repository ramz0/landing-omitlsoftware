import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';

import { Tecnologia } from '@models/proyecto.model';
import { crearEscena } from '@shared/components/teclado/teclado-escena';

interface Tecla {
  /** Ancho en cuartos de unidad (4 = tecla normal); cada fila suma 60. */
  ancho: number;
  tec: Tecnologia | null;
}

// Distribución ANSI de 60 %. Las teclas de 1 unidad llevan su carácter real (en el mismo orden que
// los 4 de ancho de cada fila), así cada tecnología queda en la posición de su `atajo`.
const FILAS = [
  [...Array(13).fill(4), 8],
  [6, ...Array(12).fill(4), 6],
  [7, ...Array(11).fill(4), 9],
  [9, ...Array(10).fill(4), 11],
  [5, 5, 5, 25, 5, 5, 5, 5],
];
const CARACTERES = ['`1234567890-=', 'qwertyuiop[]', "asdfghjkl;'", 'zxcvbnm,./'];

/**
 * Teclado 3D con las tecnologías (Stack), en un cuarto oscuro iluminado por una luz azulada.
 */
@Component({
  selector: 'app-escritorio',
  templateUrl: './escritorio.html',
  styleUrl: './escritorio.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Escritorio {
  tecnologias = input.required<Tecnologia[]>();

  protected activa = signal<Tecnologia | null>(null);
  /** false mientras la escena 3D se carga: se muestra el esqueleto. */
  protected listo = signal(false);
  protected filas = computed<Tecla[][]>(() => {
    const porLetra = new Map(
      this.tecnologias()
        .filter((t) => t.atajo)
        .map((t) => [t.atajo!.toLowerCase(), t]),
    );
    // ponytail: una tecnología sin `atajo` (o con letra fuera del bloque principal) no se dibuja.
    return FILAS.map((fila, f) => {
      let c = 0;
      return fila.map((ancho) => {
        if (ancho !== 4) return { ancho, tec: null };
        return { ancho, tec: porLetra.get(CARACTERES[f][c++]) ?? null };
      });
    });
  });

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    // La escena 3D se construye solo al acercarse a la sección (ver también scroll-world).
    afterNextRender(() => {
      let limpiar: (() => void) | undefined;
      let destruido = false;
      const io = new IntersectionObserver(async ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const contenedor = host.querySelector<HTMLElement>('.escena')!;
        try {
          // ponytail: la escena se construye una vez; si cambian los datos en caliente no se redibuja.
          limpiar = await crearEscena({
            contenedor,
            filas: this.filas(),
            alSeleccionar: (t) => this.activa.set(t),
            activa: () => this.activa(),
            progreso: () => 1,
          });
          if (destruido) limpiar();
          else this.listo.set(true);
        } catch {
          // Sin WebGL: quedan los botones accesibles.
          host.classList.add('sin-webgl');
        }
      }, { rootMargin: '800px' });
      io.observe(host);
      destroyRef.onDestroy(() => {
        destruido = true;
        io.disconnect();
        limpiar?.();
      });
    });
  }

  protected seleccionar(t: Tecnologia): void {
    this.activa.set(t);
  }
}
