import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

interface Linea {
  top: number;
  ancho: number;
  duracion: number;
  retardo: number;
  opacidad: number;
  amarilla: boolean;
}

/** PRNG determinista: mismas líneas en cada carga, sin saltos al hidratar ni al recargar. */
function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Líneas horizontales que cruzan el fondo como estrellas fugaces. Solo CSS (sin librerías). */
@Component({
  selector: 'app-lineas-velocidad',
  template: `
    @for (l of lineas(); track $index) {
      <span
        class="linea"
        [class.amarilla]="l.amarilla"
        [style.top.%]="l.top"
        [style.width.px]="l.ancho"
        [style.opacity]="l.opacidad"
        [style.animation-duration.s]="l.duracion"
        [style.animation-delay.s]="l.retardo"
      ></span>
    }
  `,
  styleUrl: './lineas-velocidad.css',
  host: { 'aria-hidden': 'true' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineasVelocidad {
  cantidad = input(16);

  lineas = computed<Linea[]>(() => {
    const azar = mulberry32(2026);
    return Array.from({ length: this.cantidad() }, () => {
      const duracion = 1.2 + azar() * 2.2;
      return {
        top: 3 + azar() * 94,
        ancho: 80 + azar() * 220,
        duracion,
        retardo: -azar() * duracion, // negativo: ya van en pleno vuelo al cargar
        opacidad: 0.15 + azar() * 0.45,
        amarilla: azar() > 0.55,
      };
    });
  });
}
