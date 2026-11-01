import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, computed, effect, input, signal, viewChild } from '@angular/core';
import gsap from 'gsap';

/** Tamaño de cada cuadro en `public/avatar/<cuadro>.webp` (px nativos) y escala de pantalla (0.5 = pixeles de 4 px). */
const CUADROS = {
  saluda: [190, 215], saluda_p: [190, 215],
  senala: [236, 215], senala_p: [236, 215],
  piensa: [189, 206], piensa_2: [189, 206],
  celebra: [257, 227],
} as const;
const ESCALA = 0.5;
/** Colores del confeti (los de la marca) y cuántas piezas caen en cada celebración. */
const CONFETI = ['#045453', '#f3c649', '#90c6c5', '#f5e8bc'];
const PIEZAS = 80;
export type Pose = 'saluda' | 'senala' | 'piensa' | 'celebra';

/**
 * Mascota con globo de texto: entra con un salto cuando se ve en pantalla, cambia de pose con un brinco
 * y "escribe" lo que dice. Parpadea al saludar y señalar, mueve los ojos al pensar y celebra con confeti
 * cayendo. Sin movimiento si el usuario lo reduce (el texto aparece completo).
 */
@Component({
  selector: 'app-mascota',
  template: `
    <div class="mascota" #caja>
      <div class="confeti" #confeti aria-hidden="true"></div>
      <div class="pj" #pj>
        @for (p of cuadros; track p.id) {
          <img [src]="'avatar/' + p.id + '.webp'" alt="" [style.width.px]="p.w" [style.height.px]="p.h" [class.visible]="p.id === cuadro()" />
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

  readonly cuadros = Object.entries(CUADROS).map(([id, [w, h]]) => ({ id, w: w * ESCALA, h: h * ESCALA }));
  /** Variante del cuadro: '' normal, '_p' ojos cerrados (parpadeo), '_2' ojos mirando a otro lado (pensando). */
  private variante = signal('');
  cuadro = computed(() => this.pose() + this.variante());
  private confeti = viewChild.required<ElementRef<HTMLElement>>('confeti');
  private ciclo?: gsap.core.Tween;
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
      if (this.visto()) { this.parpadear(p); if (p === 'celebra') this.lluvia(); }
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

  /** Saluda/señala: parpadeo ocasional. Piensa: los ojos van y vienen. Celebra: sin variante. */
  private parpadear(p: Pose) {
    this.ciclo?.kill();
    this.variante.set('');
    if (this.reducido || p === 'celebra') return;
    const [marca, abierto, cerrado] = p === 'piensa' ? (['_2', 0.4, 0.5] as const) : (['_p', 2.5, 0.13] as const);
    const alterna = () => {
      this.variante.set(marca);
      this.ciclo = gsap.delayedCall(cerrado + Math.random() * (p === 'piensa' ? 0.4 : 0), () => {
        this.variante.set('');
        this.ciclo = gsap.delayedCall(abierto + Math.random() * (p === 'piensa' ? 0.4 : 2.5), alterna);
      });
    };
    this.ciclo = gsap.delayedCall(p === 'piensa' ? 0.35 : 1.5 + Math.random() * 2, alterna);
  }

  /** Cuadritos y rectangulitos de pixel (3–5 px) caen detrás de ella, se mecen y se desvanecen; cada uno se quita al terminar. */
  private lluvia() {
    if (this.reducido) return;
    const caja = this.confeti().nativeElement;
    const azar = (a: number, b: number) => a + Math.random() * (b - a);
    for (let i = 0; i < PIEZAS; i++) {
      const el = document.createElement('i');
      const largo = Math.random() < 0.35;
      const [w, h] = largo ? [3, 6 + Math.round(Math.random() * 2)] : [3 + Math.round(Math.random() * 2), 0];
      Object.assign(el.style, { position: 'absolute', left: 0, top: 0, width: `${w}px`, height: `${h || w}px`, background: CONFETI[i % CONFETI.length] });
      caja.appendChild(el);
      const x = azar(-10, 140);
      gsap.timeline({ delay: azar(0, 0.9), onComplete: () => el.remove() })
        .fromTo(el, { x, y: azar(-50, -20), rotation: azar(0, 90), opacity: 1 },
          { y: azar(95, 125), rotation: `+=${azar(-200, 200)}`, duration: azar(1.3, 2.2), ease: 'power1.in' }, 0)
        .to(el, { x: `+=${azar(-14, 14)}`, duration: azar(0.5, 0.8), ease: 'sine.inOut', yoyo: true, repeat: 2 }, 0)
        .to(el, { opacity: 0, duration: 0.5 }, '>-0.5');
    }
  }

  private escribir(t: string) {
    this.tipeo?.kill();
    const el = this.dicho().nativeElement;
    if (this.reducido) { el.textContent = t; return; }
    const o = { n: 0 };
    this.tipeo = gsap.to(o, { n: t.length, duration: Math.min(2.2, t.length * 0.025), ease: 'none', onUpdate: () => (el.textContent = t.slice(0, Math.round(o.n))) });
  }
}
