import {
  afterNextRender,
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import gsap from 'gsap';

import { EquipoService } from '@core/services/equipo.service';
import { PersonaCard } from '@shared/components/persona-card/persona-card';

/** /aboutus: quiénes somos (el equipo). */
@Component({
  selector: 'app-aboutus',
  imports: [PersonaCard],
  templateUrl: './aboutus.html',
  styleUrl: './aboutus.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutUs {
  private equipoEl = viewChild<ElementRef<HTMLElement>>('equipo');

  /** Pasa a true la primera vez que el equipo entra en pantalla y ya no vuelve a false. */
  equipoVisto = signal(false);

  /** Escalonado invertido: las tarjetas que eran altas pasan a ser bajas. */
  invertido = signal(false);

  /** Offset vertical de la tarjeta i: las bajas bajan 1.5rem en desktop; en móvil (columna) no hay escalonado. */
  private destino(i: number) {
    if (innerWidth <= 700) return 0;
    return (i % 2 === 1) !== this.invertido() ? 24 : 0;
  }

  private tarjetas() {
    return Array.from(this.equipoEl()?.nativeElement.children ?? []);
  }

  /** Pasar el mouse por una tarjeta baja la levanta e invierte el escalonado (se mantiene tras el hover). */
  alternar(i: number) {
    if (!this.equipoVisto() || (i % 2 === 1) === this.invertido()) return;
    this.invertido.update((v) => !v);
    gsap.to(this.tarjetas(), { y: (j) => this.destino(j), duration: 0.7, ease: 'power3.out', overwrite: 'auto' });
  }

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const el = this.equipoEl()?.nativeElement;
      if (!el) return;
      const io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          this.equipoVisto.set(true);
          io.disconnect();
        },
        { threshold: 0.2 },
      );
      io.observe(el);
      destroyRef.onDestroy(() => io.disconnect());
    });

    // Entrada (una vez, cuando ya hay tarjetas): las altas suben, las bajas bajan.
    let entro = false;
    afterRenderEffect(() => {
      if (entro || !this.equipoVisto() || !this.personas().length) return;
      entro = true;
      const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
      gsap.fromTo(
        this.tarjetas(),
        { opacity: 0, y: (i) => this.destino(i) + (i % 2 === 0 ? 48 : -48) },
        { opacity: 1, y: (i) => this.destino(i), duration: reducido ? 0 : 0.9, ease: 'power3.out', stagger: 0.1 },
      );
    });
  }

  personas = inject(EquipoService).personas;
}
