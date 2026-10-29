import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import createGlobe from 'cobe';

const ARRASTRE = 1400;
/** Tres puntos juntos en el centro de México: CDMX (Zócalo), Naucalpan y Ecatepec (Estado de México). */
const MARCAS: { location: [number, number]; size: number }[] = [
  { location: [19.4326, -99.1332], size: 0.07 },
  { location: [19.4786, -99.2397], size: 0.05 },
  { location: [19.601, -99.06], size: 0.05 },
];

/** Globo terráqueo punteado (cobe, WebGL) que gira solo y se puede arrastrar. Sin movimiento si el usuario lo reduce. */
@Component({
  selector: 'app-globo',
  template: '<canvas #lienzo aria-hidden="true" [class.listo]="listo()"></canvas>',
  styleUrl: './globo.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Globo {
  private lienzo = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');
  listo = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const canvas = this.lienzo().nativeElement;
      const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Lienzo cuadrado: cobe pinta width*dpr píxeles y la escena debe medir lo mismo (mezclarlos hace el globo 2× más grande).
      const dpr = Math.min(devicePixelRatio, 2);
      const lado = canvas.offsetWidth;
      let phi = 4.7; // arranca mirando a América
      let extra = 0; // giro acumulado por arrastre
      let suave = 0; // lo que se aplica, alcanza a `extra` poco a poco
      let agarrado: number | null = null;

      const globo = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: lado,
        height: lado,
        phi,
        theta: 0.25,
        dark: 1,
        diffuse: 1.4,
        mapSamples: 16000,
        mapBrightness: 5,
        baseColor: [0.05, 0.22, 0.22], // jade oscuro
        markerColor: [0.95, 0.78, 0.29], // amarillo de marca
        glowColor: [0.04, 0.33, 0.33],
        markers: MARCAS,
        onRender: (s) => {
          if (agarrado === null && !quieto) phi += 0.003;
          suave += (extra - suave) * 0.08;
          s['phi'] = phi + suave;
        },
      });

      const soltar = () => {
        agarrado = null;
        canvas.style.cursor = 'grab';
      };
      canvas.addEventListener('pointerdown', (e) => {
        agarrado = e.clientX;
        canvas.style.cursor = 'grabbing';
      });
      canvas.addEventListener('pointermove', (e) => {
        if (agarrado === null) return;
        extra += (e.clientX - agarrado) / ARRASTRE * 4;
        agarrado = e.clientX;
      });
      canvas.addEventListener('pointerup', soltar);
      canvas.addEventListener('pointerout', soltar);

      requestAnimationFrame(() => this.listo.set(true));
      destroyRef.onDestroy(() => globo.destroy());
    });
  }
}
