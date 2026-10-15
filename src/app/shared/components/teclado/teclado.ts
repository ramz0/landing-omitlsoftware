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
import { crearEscena } from './teclado-escena';

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
// Fila 0 incluye ` y =; las filas 1-3 saltan la tecla ancha inicial (Tab, Caps, Shift).

/** Teclado de computadora: cada tecnología va en la tecla de su letra y el resto son teclas lisas. */
@Component({
  selector: 'app-teclado',
  templateUrl: './teclado.html',
  styleUrl: './teclado.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Teclado {
  tecnologias = input.required<Tecnologia[]>();
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
  protected activa = signal<Tecnologia | null>(null);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(async () => {
      const contenedor = host.querySelector<HTMLElement>('.escena')!;
      // ponytail: la escena se construye una vez; si cambian las tecnologías en caliente no se redibuja.
      try {
        const limpiar = await crearEscena({
          contenedor,
          filas: this.filas(),
          alSeleccionar: (t) => this.activa.set(t),
          activa: () => this.activa(),
        });
        destroyRef.onDestroy(limpiar);
      } catch {
        // Sin WebGL: quedan los botones accesibles y la pantalla.
        host.classList.add('sin-webgl');
      }
    });
  }

  protected seleccionar(t: Tecnologia): void {
    this.activa.set(t);
  }
}
