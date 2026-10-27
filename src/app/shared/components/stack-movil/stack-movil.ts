import { ChangeDetectionStrategy, Component, ElementRef, effect, input, viewChild } from '@angular/core';

import { Tecnologia } from '@models/proyecto.model';
import { Icono } from '@shared/components/icono/icono';

/**
 * Stack de tecnologías para móvil, sin three.js: mosaico "bento" con animaciones GSAP
 * (entrada escalonada, iconos flotando, inclinación al tocar, spotlight y despliegue animado).
 */
@Component({
  selector: 'app-stack-movil',
  imports: [Icono],
  templateUrl: './stack-movil.html',
  styleUrl: './stack-movil.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackMovil {
  tecnologias = input.required<Tecnologia[]>();
  private rejilla = viewChild<ElementRef<HTMLElement>>('rejilla');

  constructor() {
    effect((onCleanup) => {
      const el = this.rejilla()?.nativeElement;
      if (!el) return;
      let limpiar: (() => void) | undefined;
      let fin = false;
      this.animar(el).then((l) => (fin ? l() : (limpiar = l)));
      onCleanup(() => ((fin = true), limpiar?.()));
    });
  }

  private async animar(el: HTMLElement): Promise<() => void> {
    const { gsap } = await import('gsap');
    const tarjetas = [...el.querySelectorAll<HTMLElement>('.tarjeta')];
    const iconos = tarjetas.map((t) => t.querySelector<HTMLElement>('.icono')!);
    const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dentro = (e: Event) => (e.target as Element).closest<HTMLElement>('.tarjeta');

    // Abrir/cerrar: la tarjeta crece (o encoge) animada, el icono da una vuelta y se cierra la que estaba abierta.
    const alternar = (t: HTMLElement) => {
      const abrir = !t.classList.contains('abierta');
      for (const o of tarjetas) if (o !== t && o.classList.contains('abierta')) cambiar(o, false);
      cambiar(t, abrir);
      if (abrir && !quieto) gsap.fromTo(t.querySelector('.icono'), { rotation: 0, scale: 1.3 }, { rotation: 360, scale: 1, duration: 0.7, ease: 'back.out(1.7)' });
    };
    const cambiar = (t: HTMLElement, abrir: boolean) => {
      const h0 = t.offsetHeight;
      t.classList.toggle('abierta', abrir);
      t.setAttribute('aria-expanded', String(abrir));
      if (!quieto) gsap.fromTo(t, { height: h0 }, { height: t.offsetHeight, duration: 0.5, ease: 'power3.out', clearProps: 'height' });
    };

    // Spotlight que sigue al dedo + inclinación de la tarjeta tocada.
    const luz = (e: PointerEvent) => {
      for (const t of tarjetas) {
        const r = t.getBoundingClientRect();
        t.style.setProperty('--x', `${e.clientX - r.left}px`);
        t.style.setProperty('--y', `${e.clientY - r.top}px`);
      }
      const t = dentro(e);
      if (!t || quieto) return;
      const r = t.getBoundingClientRect();
      gsap.to(t, {
        rotationY: ((e.clientX - r.left) / r.width - 0.5) * 12,
        rotationX: -((e.clientY - r.top) / r.height - 0.5) * 12,
        duration: 0.3,
      });
    };
    const bajar = (e: PointerEvent) => {
      luz(e);
      const t = dentro(e);
      if (t && !quieto) gsap.to(t, { scale: 0.96, duration: 0.15 });
    };
    const soltar = () => {
      if (!quieto) gsap.to(tarjetas, { rotationX: 0, rotationY: 0, scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
    };
    const clic = (e: MouseEvent) => {
      const t = dentro(e);
      if (t) alternar(t);
    };
    el.addEventListener('pointerdown', bajar);
    el.addEventListener('pointermove', luz);
    el.addEventListener('pointerup', soltar);
    el.addEventListener('pointercancel', soltar);
    el.addEventListener('pointerleave', soltar);
    el.addEventListener('click', clic);

    // Entrada: cada columna llega desde su lado, el icono "salta" después y luego flota.
    const flotar: gsap.core.Tween[] = [];
    let io: IntersectionObserver | undefined;
    if (quieto) {
      gsap.set(tarjetas, { opacity: 1 });
    } else {
      gsap.set(tarjetas, { opacity: 0, y: 40, x: (i) => (i % 2 ? 30 : -30), scale: 0.92 });
      gsap.set(iconos, { scale: 0 });
      io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io!.disconnect();
        gsap.to(tarjetas, { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.8, ease: 'power4.out', stagger: 0.07 });
        gsap.to(iconos, {
          scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)', stagger: 0.07, delay: 0.25,
          onComplete: () =>
            iconos.forEach((ic) =>
              flotar.push(gsap.to(ic, { y: -4, duration: 1.8 + Math.random(), ease: 'sine.inOut', yoyo: true, repeat: -1, delay: Math.random() })),
            ),
        });
      }, { threshold: 0.1 });
      io.observe(el);
    }

    return () => {
      io?.disconnect();
      flotar.forEach((f) => f.kill());
      gsap.killTweensOf([tarjetas, iconos]);
      el.removeEventListener('pointerdown', bajar);
      el.removeEventListener('pointermove', luz);
      el.removeEventListener('pointerup', soltar);
      el.removeEventListener('pointercancel', soltar);
      el.removeEventListener('pointerleave', soltar);
      el.removeEventListener('click', clic);
    };
  }
}
