import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';

import gsap from 'gsap';

import { Boton } from '@shared/components/boton/boton';

// Escena en coordenadas del viewBox (640×360): el SVG escala solo.
const SUELO = 320;
const BW = 30; // ancho del bloque
const BH = 32; // alto del bloque
const BRAZO_Y = 97; // parte baja del brazo de la grúa, de donde cuelga el cable
const ORIGEN_X = 275; // donde esperan los bloques (alcance del brazo: ~136–290)
// Pirámide 3-2-1 bajo el brazo: [x izquierda, y arriba] de cada bloque, de abajo hacia arriba.
const HUECOS: [number, number][] = [
  [170, SUELO - BH], [200, SUELO - BH], [230, SUELO - BH],
  [185, SUELO - 2 * BH], [215, SUELO - 2 * BH],
  [200, SUELO - 3 * BH],
];

/** Pantalla "estamos trabajando en esta vista": una grúa arma una pirámide de bloques mientras la excavadora trabaja. */
@Component({
  selector: 'app-en-construccion',
  imports: [Boton],
  template: `
    <section [class.pagina]="pagina()">
      <div class="wrap">
        <svg #escena viewBox="0 0 640 360" role="img" aria-label="Una grúa armando una pirámide de bloques">
          <line x1="0" x2="640" [attr.y1]="suelo" [attr.y2]="suelo" stroke="currentColor" stroke-width="2" />
          <image href="/escena/grua.webp" x="20" y="20" width="272" height="300" />
          <image #exc href="/escena/excavadora.webp" x="370" y="174" width="150" height="146" />
          @for (i of ids; track i) {
            <image class="bloque" href="/escena/bloque.webp" [attr.width]="bw" [attr.height]="bh" opacity="0" />
          }
          <g #gancho>
            <line class="cable" stroke="currentColor" stroke-width="1.5" />
            <rect class="carro" width="16" height="6" rx="1" fill="currentColor" />
            <rect class="garfio" width="10" height="8" rx="2" fill="#f3c649" stroke="currentColor" stroke-width="1.5" />
          </g>
        </svg>
        <div class="titulo" role="heading" [attr.aria-level]="pagina() ? 1 : 3">{{ titulo() }}</div>
        <p>{{ mensaje() }}</p>
        @if (pagina()) {
          <app-boton href="/" variante="jade">Volver al inicio</app-boton>
        }
      </div>
    </section>
  `,
  styles: `
    section { padding: 1rem 0; text-align: center; }
    .pagina { padding: 3rem 0 5rem; min-height: 60vh; }
    svg { width: min(640px, 100%); height: auto; display: block; margin: 0 auto 1.5rem; color: var(--night); }
    .titulo { font-size: clamp(1.25rem, 3vw, 2.1rem); font-weight: 700; line-height: 1.2; margin-bottom: 0.5rem; }
    p { max-width: 50ch; margin: 0 auto 1.5rem; opacity: 0.75; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnConstruccion {
  titulo = input('Estamos trabajando en esta vista');
  mensaje = input('Muy pronto estará lista. Gracias por tu paciencia.');
  /** true: vista completa (alto mínimo y botón de volver); false: bloque dentro de otra página. */
  pagina = input(true);

  readonly suelo = SUELO;
  readonly bw = BW;
  readonly bh = BH;
  readonly ids = HUECOS.map((_, i) => i);

  private svg = viewChild.required<ElementRef<SVGSVGElement>>('escena');
  private exc = viewChild.required<ElementRef<SVGImageElement>>('exc');
  private gancho = viewChild.required<ElementRef<SVGGElement>>('gancho');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const svg = this.svg().nativeElement;
      const bloques = Array.from(svg.querySelectorAll<SVGImageElement>('.bloque'));
      const g = this.gancho().nativeElement;
      const cable = g.querySelector('.cable')!;
      const carro = g.querySelector('.carro')!;
      const garfio = g.querySelector('.garfio')!;

      const poner = (b: SVGImageElement, x: number, y: number) => {
        b.setAttribute('x', String(x));
        b.setAttribute('y', String(y));
      };
      // Estado del gancho: x del carro, y de la punta, y qué bloque lleva (-1 ninguno).
      const s = { x: 200, y: 115, lleva: -1 };
      const dibujar = () => {
        cable.setAttribute('x1', String(s.x));
        cable.setAttribute('x2', String(s.x));
        cable.setAttribute('y1', String(BRAZO_Y));
        cable.setAttribute('y2', String(s.y));
        carro.setAttribute('x', String(s.x - 8));
        carro.setAttribute('y', String(BRAZO_Y - 3));
        garfio.setAttribute('x', String(s.x - 5));
        garfio.setAttribute('y', String(s.y));
        if (s.lleva >= 0) poner(bloques[s.lleva], s.x - BW / 2, s.y + 6);
      };

      // Sin movimiento: la pirámide ya armada.
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        bloques.forEach((b, i) => {
          poner(b, ...HUECOS[i]);
          b.setAttribute('opacity', '1');
        });
        dibujar();
        return;
      }

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ repeat: -1, onUpdate: dibujar });
        tl.set(s, { x: 200, y: 115, lleva: -1 }).set(bloques, { opacity: 0 });
        HUECOS.forEach(([hx, hy], i) => {
          const b = bloques[i];
          tl.call(() => poner(b, ORIGEN_X - BW / 2, SUELO - BH))
            .set(b, { opacity: 1 })
            .to(s, { x: ORIGEN_X, duration: 0.9, ease: 'power2.inOut' })
            .to(s, { y: SUELO - BH - 6, duration: 0.7, ease: 'power2.in' })
            .set(s, { lleva: i })
            .to(s, { y: 118, duration: 0.7, ease: 'power2.out' })
            .to(s, { x: hx + BW / 2, duration: 1, ease: 'power2.inOut' })
            .to(s, { y: hy - 6, duration: 0.8, ease: 'bounce.out' })
            .set(s, { lleva: -1 })
            .call(() => poner(b, hx, hy))
            .to(s, { y: 118, duration: 0.5, ease: 'power2.out' });
        });
        tl.to({}, { duration: 1.5 }).to(bloques, { opacity: 0, duration: 0.5 });
        // La excavadora "trabaja": un vaivén suave.
        gsap.to(this.exc().nativeElement, { y: -2, duration: 0.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      }, svg);
      destroyRef.onDestroy(() => ctx.revert());
    });
  }
}
