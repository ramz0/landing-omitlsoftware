import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  viewChild,
} from '@angular/core';

import { NombreIcono } from '@models/icono.model';
import { Icono } from '@shared/components/icono/icono';

const limitar = (v: number, max: number) => Math.max(-max, Math.min(max, v));

@Component({
  selector: 'app-boton',
  imports: [Icono],
  template: `
    <a [href]="href()" [class]="variante()">
      @if (icono(); as nombre) {
        <span #iconoEl class="icono" [class.flota]="flota()"><app-icono [nombre]="nombre" /></span>
      }
      <ng-content />
    </a>
  `,
  styleUrl: './boton.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Boton {
  href = input.required<string>();
  variante = input<'amarillo' | 'jade'>('amarillo');
  icono = input<NombreIcono>();
  /** El ícono llega volando y después reacciona (poco) al scroll; quieto cuando no hay scroll. */
  flota = input(false);

  private iconoEl = viewChild<ElementRef<HTMLElement>>('iconoEl');

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const el = this.iconoEl()?.nativeElement;
      if (!el || !this.flota() || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      let ultimo = scrollY;
      let x = 0, y = 0; // posición actual
      let tx = 0, ty = 0; // objetivo, que decae solo hacia el reposo
      let raf = 0;

      const cuadro = () => {
        tx *= 0.88;
        ty *= 0.88;
        x += (tx - x) * 0.2;
        y += (ty - y) * 0.2;
        el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${(x * 3).toFixed(1)}deg)`;
        const activo = Math.abs(x) + Math.abs(y) + Math.abs(tx) + Math.abs(ty) > 0.02;
        raf = activo ? requestAnimationFrame(cuadro) : 0;
        if (!activo) el.style.transform = '';
      };

      const alScroll = () => {
        const v = scrollY - ultimo;
        ultimo = scrollY;
        // Pequeño y acotado: nunca se sale del botón (±3 px / ±4 px, giro de ~9°).
        tx = limitar(v * 0.2, 3);
        ty = limitar(-v * 0.3, 4);
        if (!raf) raf = requestAnimationFrame(cuadro);
      };

      addEventListener('scroll', alScroll, { passive: true });
      destroyRef.onDestroy(() => {
        removeEventListener('scroll', alScroll);
        cancelAnimationFrame(raf);
      });
    });
  }
}
