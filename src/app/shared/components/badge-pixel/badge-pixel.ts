import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type Variante = 'crema' | 'jade' | 'amarillo' | 'noche';

/** Color base de cada variante (de la paleta de la marca). */
const BASE: Record<Variante, string> = {
  crema: '#f5e8bc',
  jade: '#045453',
  amarillo: '#f3c649',
  noche: '#0a2929',
};

const RADIO = 6; // esquina de 6 píxeles de radio

/** Píxeles que se recortan por fila en una esquina (fila 0 = la de arriba), aproximando un cuarto de círculo. */
const INSET = Array.from({ length: RADIO }, (_, i) => {
  const dy = RADIO - i - 0.5;
  return RADIO - Math.round(Math.sqrt(RADIO * RADIO - dy * dy));
});

/** Badge pixel art: color liso, esquinas redondeadas en escalones de un píxel. Todo en múltiplos de `px`. */
@Component({
  selector: 'app-badge-pixel',
  template: `<ng-content />`,
  styleUrl: './badge-pixel.css',
  host: {
    '[class]': 'variante()',
    '[style.--px]': 'px() + "px"',
    '[style.--base]': 'base()',
    '[style.clip-path]': 'recorte()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgePixel {
  variante = input<Variante>('crema');
  /** Tamaño de cada "píxel"; el alto del badge es 15 píxeles. */
  px = input(2);

  protected base = computed(() => BASE[this.variante()]);

  /** Polígono con las 4 esquinas hechas de escalones cuadrados. */
  protected recorte = computed(() => {
    const p = this.px();
    // esquina superior izquierda, de la orilla izquierda hacia arriba: [x, y] en píxeles
    const tl: [number, number][] = [];
    for (let r = RADIO - 1; r >= 0; r--) tl.push([INSET[r], r + 1], [INSET[r], r]);
    const X = (x: number, der: boolean) => (der ? `calc(100% - ${x * p}px)` : `${x * p}px`);
    const Y = (y: number, abajo: boolean) => (abajo ? `calc(100% - ${y * p}px)` : `${y * p}px`);
    const esq = (der: boolean, abajo: boolean, invertir: boolean) =>
      (invertir ? [...tl].reverse() : tl).map(([x, y]) => `${X(x, der)} ${Y(y, abajo)}`);
    return `polygon(${[...esq(false, false, false), ...esq(true, false, true), ...esq(true, true, false), ...esq(false, true, true)].join(',')})`;
  });
}
