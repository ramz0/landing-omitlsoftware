import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, effect, input, signal, viewChild } from '@angular/core';
import gsap from 'gsap';

/** Tamaño de cada pose en `public/avatar/<pose>.webp` (px nativos) y escala de pantalla (0.5 = pixeles de 4 px). */
const POSES = { saluda: [190, 215], senala: [236, 215], piensa: [189, 206], celebra: [262, 232] } as const;
const ESCALA = 0.5;
export type Pose = keyof typeof POSES;

/**
 * Mascota con globo de texto: entra con un salto cuando se ve en pantalla, cambia de pose con un brinco
 * y "escribe" lo que dice. Sin movimiento si el usuario lo reduce (el texto aparece completo).
 */
@Component({
  selector: 'app-mascota',
  template: `
    <div class="mascota">
      <div class="pj" #pj>
        @for (p of poses; track p.id) {
          <img [src]="'avatar/' + p.id + '.webp'" alt="" [style.width.px]="p.w" [style.height.px]="p.h" [class.visible]="p.id === pose()" />
        }
      </div>
      <i class="sombra" #sombra></i>
    </div>
    <p class="globo"><span class="sr">{{ texto() }}</span><span aria-hidden="true" #dicho></span></p>
  `,
  styleUrl: './mascota.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Mascota {
  pose = input.required<Pose>();
  texto = input('');

  readonly poses = (Object.entries(POSES) as [Pose, readonly [number, number]][]).map(([id, [w, h]]) => ({ id, w: w * ESCALA, h: h * ESCALA }));
  private pj = viewChild.required<ElementRef<HTMLElement>>('pj');
  private sombra = viewChild.required<ElementRef<HTMLElement>>('sombra');
  private dicho = viewChild.required<ElementRef<HTMLElement>>('dicho');
  private host: HTMLElement;
  private visto = signal(false);
  private previa?: Pose;
  private tipeo?: gsap.core.Tween;
  private reducido = false;

  constructor(el: ElementRef<HTMLElement>) {
    this.host = el.nativeElement;
    // La entrada y el texto esperan a que la mascota se vea: si está bajo el pliegue no se gastan antes.
    afterNextRender(() => {
      this.reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        this.entrada();
        this.visto.set(true);
      }, { threshold: 0.6 });
      io.observe(this.host);
    });
    effect(() => {
      const t = this.texto();
      if (this.visto()) this.escribir(t);
    });
    effect(() => {
      const p = this.pose();
      if (this.visto() && this.previa && p !== this.previa) this.brinco();
      this.previa = p;
    });
  }

  private entrada() {
    if (this.reducido) return;
    gsap.from(this.pj().nativeElement, { y: -90, opacity: 0, duration: 0.7, ease: 'bounce.out' });
    gsap.from(this.sombra().nativeElement, { scale: 0, opacity: 0, duration: 0.7, ease: 'power2.in' });
  }

  /** Brinco con squash & stretch al cambiar de pose; la sombra se achica mientras sube. */
  private brinco() {
    if (this.reducido) return;
    const pj = this.pj().nativeElement;
    gsap.timeline()
      .to(pj, { y: -16, scaleY: 1.08, duration: 0.14, ease: 'power2.out' })
      .to(pj, { y: 0, scaleY: 0.9, duration: 0.12, ease: 'power2.in' })
      .to(pj, { scaleY: 1, duration: 0.12, ease: 'back.out(3)' });
    gsap.fromTo(this.sombra().nativeElement, { scaleX: 1 }, { scaleX: 0.6, duration: 0.14, yoyo: true, repeat: 1, ease: 'power1.out' });
  }

  private escribir(t: string) {
    this.tipeo?.kill();
    const el = this.dicho().nativeElement;
    if (this.reducido) { el.textContent = t; return; }
    const o = { n: 0 };
    this.tipeo = gsap.to(o, { n: t.length, duration: Math.min(2.2, t.length * 0.025), ease: 'none', onUpdate: () => (el.textContent = t.slice(0, Math.round(o.n))) });
  }
}
