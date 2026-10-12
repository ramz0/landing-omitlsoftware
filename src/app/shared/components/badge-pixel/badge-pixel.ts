import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type Variante = 'crema' | 'jade' | 'amarillo' | 'noche';

interface Pixel {
  left: number;
  top: number;
  color: string;
  retardo: number;
  duracion: number;
}

/** Tres tonos del mismo color, siempre más claros: % de mezcla con blanco. */
const TONOS = [14, 26, 38];
const tono = (base: string, amount: number) => `color-mix(in srgb, ${base}, white ${amount}%)`;

/** Color base de cada variante (de la paleta de la marca). */
const BASE: Record<Variante, string> = {
  crema: '#f5e8bc',
  jade: '#045453',
  amarillo: '#f3c649',
  noche: '#0a2929',
};

const FILAS = 9; // alto del badge en píxeles
const ANCHO_IZQ = 4; // columnas de la banda izquierda
const ALTO_BASE = 3; // filas de la banda inferior
const COLUMNAS = 64; // las que sobran se recortan con overflow: hidden

/** PRNG determinista: el mismo badge se ve igual en cada carga. */
function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Badge redondeado y uniforme (la silueta nunca se rompe). Por dentro, del lado izquierdo y de
 * abajo, el color se va "desarmando" en píxeles del MISMO tono (tres tonos más claros): hay
 * más variación hacia esos bordes. El contenido se proyecta con <ng-content>.
 */
@Component({
  selector: 'app-badge-pixel',
  template: `
    <span class="cuerpo"><ng-content /></span>
    @for (p of pixeles(); track $index) {
      <i
        class="px"
        [style.left.px]="p.left"
        [style.top.px]="p.top"
        [style.background]="p.color"
        [style.animation-delay.s]="p.retardo"
        [style.animation-duration.s]="p.duracion"
      ></i>
    }
  `,
  styleUrl: './badge-pixel.css',
  host: {
    '[class]': 'variante()',
    '[style.--px]': 'px() + "px"',
    '[style.--base]': 'base()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgePixel {
  variante = input<Variante>('crema');
  /** Tamaño de cada píxel; el alto del badge es 9 píxeles. */
  px = input(3);
  semilla = input(7);

  protected base = computed(() => BASE[this.variante()]);

  pixeles = computed<Pixel[]>(() => {
    const azar = mulberry32(this.semilla());
    const t = this.px();
    const base = this.base();
    const lista: Pixel[] = [];

    /** `borde`: 0 pegado al cuerpo, 1 en el borde exterior. Hay más tonos disponibles hacia afuera. */
    const colocar = (col: number, fila: number, borde: number) => {
      const niveles = Math.max(1, Math.ceil(borde * TONOS.length)); // 1..3
      const i = Math.floor(azar() * (niveles + 1)) - 1; // -1 = se queda del color del badge
      if (i < 0) return;
      lista.push({
        left: col * t,
        top: fila * t,
        color: tono(base, TONOS[i]),
        retardo: azar() * 3,
        duracion: 2.5 + azar() * 2.5,
      });
    };

    const filaBase = FILAS - ALTO_BASE;
    for (let fila = 0; fila < FILAS; fila++) {
      for (let col = 0; col < ANCHO_IZQ; col++) {
        const bIzq = 1 - col / ANCHO_IZQ; // col 0 = borde exterior
        const bBase = fila >= filaBase ? (fila - filaBase + 1) / ALTO_BASE : 0;
        colocar(col, fila, Math.max(bIzq, bBase));
      }
    }
    for (let fila = filaBase; fila < FILAS; fila++) {
      for (let col = ANCHO_IZQ; col < COLUMNAS; col++) {
        colocar(col, fila, (fila - filaBase + 1) / ALTO_BASE); // última fila = borde exterior
      }
    }
    return lista;
  });
}
