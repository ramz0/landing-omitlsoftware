import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';

import { ServiciosService } from '@core/services/servicios.service';
import { Mascota, Pose } from '@shared/components/mascota/mascota';
import { PRODUCTO } from '@shared/components/form-contacto/form-contacto';
import { environment } from '../../../environments/environment';
import gsap from 'gsap';

import { entradaPregunta, revelar, salidaPregunta } from './calculator.animacion';
import { ICONOS } from './calculator.iconos';
import { ICONO_OPCION, TRAZOS } from './calculator.iconos-opcion';
import { DESCRIPCION, FORMAS_PAGO, EXTRAS, REACCION_PAGO, PREGUNTAS, PROPUESTA, PUNTO_DE_PARTIDA, RAZON, cotizarPago, recomendar } from './calculator.config';

/** /calculator: cuestionario corto con barra de progreso → rango de precio y propuesta → lead a POST /api/leads. */
@Component({
  selector: 'app-calculator',
  imports: [Mascota],
  template: `
    <section class="cotizador">
      <div #barra class="progreso" role="progressbar" aria-label="Avance del cotizador"
           [attr.aria-valuenow]="porcentaje()" aria-valuemin="0" aria-valuemax="100">
        @for (c of celdas(); track $index) {
          <i [class.on]="c" [style.--i]="$index" [style.--t.ms]="($index * 137) % 900"></i>
        }
      </div>
      <p class="paso">{{ etiquetaPaso() }}</p>

      @if (pregunta(); as p) {
        <h1 #titulo>{{ p.titulo }}</h1>
        @if (paso() === 0) {
          <p class="ayuda">Elige el que mejor encaje. Son {{ preguntas.length }} preguntas cortas y al final te damos una propuesta con precio estimado.</p>
        }
        <div #opcionesEl class="opciones">
          @for (o of p.opciones; track o.id) {
            <button type="button" class="opcion" [class.sel]="respuestas()[p.id] === o.id" (click)="elegir(p.id, o.id, $event)">
              <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                @for (d of trazos(p.id, o.id); track $index) { <path [attr.d]="d" /> }
              </svg>
              <span class="txt">
                <b>{{ o.texto }}</b>
                @if (o.detalle) { <small>{{ o.detalle }}</small> }
              </span>
            </button>
          }
        </div>
        @if (paso() > 0) { <button type="button" class="atras" (click)="atras()">← Atrás</button> }
      } @else {
       <div class="resultado">
        <div class="cabecera">
          <div #icono class="icono-px" [style.--cols]="columnas()" aria-hidden="true">
            @for (c of celdasIcono(); track $index) { <i [class]="c"></i> }
          </div>
          <div class="info" #info>
        <p class="kicker">{{ esPrincipal() ? 'El que más te conviene' : 'Esta opción' }} · {{ pctActivo() }}%</p>
        <h1>{{ servicio()?.nombre }}</h1>
        <p class="descripcion">{{ descripcion() }}</p>
        <p class="partida">Partimos de: <b>{{ partida() }}</b>.</p>
        <div class="incluye" [class.abierto]="abierto()" [style.--alto]="(modulos().length + extras().length * 1.3) * 2.1 + (extras().length ? 3 : 0) + 'rem'">
          <ul class="propuesta">
            @for (m of modulos(); track m) { <li>{{ m }}</li> }
          </ul>
          @if (extras().length) {
            <p class="extras-t">Extras para ti, incluidos en el precio</p>
            <ul class="extras">
              @for (e of extras(); track e) { <li>{{ e }}</li> }
            </ul>
          }
        </div>
        <button type="button" class="vermas" [attr.aria-expanded]="abierto()" (click)="abierto.set(!abierto())">
          {{ abierto() ? 'Ver menos' : 'Ver más' }} <span class="flecha" [class.arriba]="abierto()">▾</span>
        </button>
        @if (montosTexto(); as ms) {
         @for (k of [respuestas()['pago'] ?? 'unico']; track k) {
          <div class="cambio">
          @for (m of ms; track m.etiqueta) {
            <p class="rango" [class.chico]="ms.length > 1">{{ m.valor }} <small>{{ m.etiqueta }}</small></p>
          }
          <p class="nota">{{ notaPago() }}</p>
          </div>
         }
          <div class="formas">
            <app-mascota [pose]="poseMascota()" [texto]="dichoMascota()" />
            <div class="formas-b">
              @for (f of formas(); track f.id) {
                <button type="button" class="forma" (click)="cambiarPago(f.id)">{{ f.corto }}</button>
              }
            </div>
          </div>
        } @else {
          <p class="rango chico">Lo cotizamos contigo en una llamada</p>
          <p class="nota">Este tipo de proyecto depende de lo que necesites; no queremos darte un número al aire.</p>
        }
          </div>
        </div>
        <div class="detalle" #detalle>
        @if (otras().length) {
          <h2>Otras opciones para ti</h2>
          <div class="otras">
            @for (o of otras(); track o.id) {
              <button type="button" class="otra" (click)="seleccionada.set(o.id); abierto.set(false)">
                <span class="pct">{{ o.pct }}%</span>
                <span><b>{{ o.nombre }}</b><small>{{ o.razon }}</small></span>
              </button>
            }
          </div>
        }

        @if (estado() === 'enviado') {
          <p class="ok">¡Gracias! Te escribimos o llamamos pronto con la propuesta.</p>
        } @else {
          <h2>¿Te mandamos la propuesta?</h2>
          <form #f (submit)="$event.preventDefault(); enviar(f)">
            <input name="negocio" placeholder="Nombre del negocio" required maxlength="120" autocomplete="organization" />
            <input name="contacto" placeholder="Tu nombre" required maxlength="120" autocomplete="name" />
            <input name="telefono" type="tel" placeholder="Celular (10 dígitos)" required inputmode="tel" autocomplete="tel" />
            <input name="web" class="trampa" tabindex="-1" autocomplete="off" aria-hidden="true" />
            <button type="submit" class="enviar" [disabled]="estado() === 'enviando'">{{ estado() === 'enviando' ? 'Enviando…' : 'Quiero mi propuesta' }}</button>
            @if (estado() === 'error') {
              <p class="error">No se pudo enviar. Intenta de nuevo o escríbenos a contacto&#64;omitlsoftware.com.mx.</p>
            }
          </form>
          <button type="button" class="atras" (click)="atras()">← Cambiar respuestas</button>
        }
        </div>
       </div>
      }
    </section>
  `,
  styleUrl: './calculator.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Calculator {
  private http = inject(HttpClient);
  private servicios = inject(ServiciosService).servicios;

  readonly preguntas = PREGUNTAS;
  paso = signal(0);
  /** preguntas → resultado (los pixeles de la barra vuelan y arman el ícono del servicio). */
  fase = signal<'preguntas' | 'resultado'>('preguntas');
  private injector = inject(Injector);
  private barra = viewChild<ElementRef<HTMLElement>>('barra');
  private icono = viewChild<ElementRef<HTMLElement>>('icono');
  private info = viewChild<ElementRef<HTMLElement>>('info');
  private detalle = viewChild<ElementRef<HTMLElement>>('detalle');
  private titulo = viewChild<ElementRef<HTMLElement>>('titulo');
  private opcionesEl = viewChild<ElementRef<HTMLElement>>('opcionesEl');
  /** Mientras una respuesta se anima, los toques extra se ignoran. */
  private ocupado = false;
  respuestas = signal<Record<string, string>>({});
  estado = signal<'listo' | 'enviando' | 'enviado' | 'error'>('listo');

  pregunta = computed(() => PREGUNTAS[this.paso()] ?? null);
  /** Las preguntas llenan la barra hasta el 85 %; el resultado la completa. */
  porcentaje = computed(() => Math.round((this.paso() / PREGUNTAS.length) * 100));
  etiquetaPaso = computed(() => (this.pregunta() ? `Pregunta ${this.paso() + 1} de ${PREGUNTAS.length}` : 'Tu propuesta'));
  ranking = computed(() => recomendar(this.respuestas()));
  /** Opción que el visitante abrió en "Otras opciones"; si no, la de mayor afinidad. */
  seleccionada = signal<string | null>(null);
  activo = computed(() => this.seleccionada() ?? this.ranking()[0].id);
  esPrincipal = computed(() => this.activo() === this.ranking()[0].id);
  pctActivo = computed(() => this.ranking().find((r) => r.id === this.activo())?.pct ?? 0);
  servicio = computed(() => this.servicios().find((s) => s.id === this.activo()));
  montos = computed(() => cotizarPago(this.respuestas(), this.activo()));
  montosTexto = computed(() => {
    const m = this.montos();
    if (!m) return null;
    const f = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
    return m.map((x) => ({ etiqueta: x.etiqueta, valor: `${f.format(x.min)} – ${f.format(x.max)}` }));
  });
  notaPago = computed(() => {
    const pago = this.respuestas()['pago'];
    const base = 'Estimado sin IVA. ';
    if (pago === 'mensual') return base + 'Sin pago grande al inicio, con mejoras y actualizaciones cuando tu negocio las necesite. Las condiciones las confirmamos contigo en una llamada.';
    if (pago === 'mixto') return base + 'Un pago inicial menor y una mensualidad que incluye mantenimiento y mejoras. Las condiciones las confirmamos contigo en una llamada.';
    return base + 'El precio final lo confirmamos contigo en una llamada.';
  });
  /** Otras formas de pago a mostrar en el resultado (la elegida no aparece). */
  formas = computed(() => {
    const actual = this.respuestas()['pago'] ?? 'unico';
    return FORMAS_PAGO.filter((f) => f.id !== actual);
  });
  /** Lo que dice la mascota: invitación al principio y, al cambiar de pago, una reacción a lo elegido. */
  private reaccion = signal<string | null>(null);
  dichoMascota = computed(
    () => this.reaccion() ?? ('¡Ey! También nos ajustamos a tu forma de pagar. ' + ((this.respuestas()['pago'] ?? 'unico') === 'unico' ? '¿Lo quieres ver en mensualidades?' : '¿Probamos otra?')),
  );
  poseMascota = signal<Pose>('saluda');
  private tPose?: ReturnType<typeof setTimeout>;
  /** Cambia el pago desde el resultado; queda en las respuestas, así la propuesta enviada lo lleva. */
  cambiarPago(id: string) {
    this.respuestas.update((r) => ({ ...r, pago: id }));
    this.reaccion.set(REACCION_PAGO[id]);
    // Piensa mientras "recalcula" y luego reacciona: celebra si se alivia el pago inicial, señala los botones si no.
    clearTimeout(this.tPose);
    this.poseMascota.set('piensa');
    this.tPose = setTimeout(() => {
      this.poseMascota.set(id === 'unico' ? 'senala' : 'celebra');
      this.tPose = setTimeout(() => this.poseMascota.set('senala'), 2600);
    }, 900);
  }
  /** "Ver qué incluye" desplegado; se cierra al cambiar de opción o de respuestas. */
  abierto = signal(false);
  otras = computed(() =>
    this.ranking()
      .filter((r) => r.id !== this.activo())
      .slice(0, 3)
      .map((r) => ({ ...r, nombre: this.servicios().find((s) => s.id === r.id)?.nombre ?? r.id, razon: RAZON[r.id] })),
  );
  descripcion = computed(() => DESCRIPCION[this.activo()] ?? '');
  partida = computed(() => PUNTO_DE_PARTIDA[this.respuestas()['hoy']] ?? '');
  /** La barra son 24 celdas tipo pixel; las encendidas siguen al avance. */
  celdas = computed(() => Array.from({ length: 24 }, (_, i) => i < Math.round((this.porcentaje() / 100) * 24)));
  /** Ícono de pixeles del servicio activo: una clase por celda (`on` jade, `y` amarillo, vacía). */
  celdasIcono = computed(() => (ICONOS[this.activo()] ?? ICONOS['landing']).flatMap((fila) => [...fila].map((c) => (c === '#' ? 'on' : c === 'y' ? 'y' : ''))));
  columnas = computed(() => (ICONOS[this.activo()] ?? ICONOS['landing'])[0].length);
  extras = computed(() => Object.entries(this.respuestas()).flatMap(([p, o]) => EXTRAS[`${p}.${o}`] ?? []));
  modulos = computed(() => PROPUESTA[this.activo()] ?? []);

  trazos(pregunta: string, opcion: string): string[] {
    return TRAZOS[ICONO_OPCION[`${pregunta}.${opcion}`]] ?? [];
  }

  elegir(pregunta: string, opcion: string, ev?: Event) {
    if (this.ocupado) return;
    const avanzar = () => {
      this.seleccionada.set(null);
      this.abierto.set(false);
      this.respuestas.update((r) => ({ ...r, [pregunta]: opcion }));
      this.paso.update((p) => p + 1); // al elegir se avanza solo: una pregunta, un toque
      if (this.paso() === PREGUNTAS.length) this.revelar();
    };
    const [btn, barra, titulo, opciones] = [ev?.currentTarget as HTMLElement | null, this.barra(), this.titulo(), this.opcionesEl()];
    if (!btn || !barra || !titulo || !opciones || matchMedia('(prefers-reduced-motion: reduce)').matches) return avanzar();
    this.ocupado = true;
    const encendidas = Math.round((Math.round(((this.paso() + 1) / PREGUNTAS.length) * 100) / 100) * 24);
    salidaPregunta(btn, barra.nativeElement, titulo.nativeElement, opciones.nativeElement, encendidas - 1, () => {
      avanzar();
      afterNextRender(() => {
        const [t, o] = [this.titulo(), this.opcionesEl()];
        if (this.pregunta() && t && o) entradaPregunta(t.nativeElement, o.nativeElement, () => (this.ocupado = false));
        else this.ocupado = false; // era la última: lo toma la animación del resultado
      }, { injector: this.injector });
    });
  }

  private revelar() {
    this.fase.set('resultado');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    afterNextRender(() => {
      const [barra, icono, info, detalle] = [this.barra(), this.icono(), this.info(), this.detalle()];
      if (barra && icono && info && detalle) {
        this.animacion?.kill();
        gsap.set(icono.nativeElement, { visibility: 'hidden' });
        this.animacion = revelar(barra.nativeElement, icono.nativeElement, [info.nativeElement, detalle.nativeElement]);
      }
    }, { injector: this.injector });
  }

  private animacion?: gsap.core.Timeline;

  atras() {
    if (this.ocupado) return;
    this.animacion?.kill();
    this.animacion = undefined;
    this.fase.set('preguntas');
    clearTimeout(this.tPose);
    this.reaccion.set(null);
    this.poseMascota.set('saluda');
    this.seleccionada.set(null);
    this.abierto.set(false);
    this.paso.update((p) => Math.max(0, p - 1));
  }

  enviar(f: HTMLFormElement) {
    if (!f.reportValidity()) return;
    const d = new FormData(f);
    const r = this.respuestas();
    const montos = this.montos();
    const resumen =
      `Cotizador: ${PREGUNTAS.map((p) => `${p.id}=${r[p.id]}`).join(', ')}; afinidad ${this.ranking().map((x) => `${x.id} ${x.pct}%`).join(', ')}; ` +
      (montos ? montos.map((m) => `${m.etiqueta} ${m.min}-${m.max}`).join(', ') + ' MXN sin IVA' : 'se cotiza aparte');
    const utm = Object.fromEntries([...new URLSearchParams(location.search)].filter(([k]) => k.startsWith('utm_')));
    this.estado.set('enviando');
    this.http
      .post(`${environment.apiUrl}/api/leads`, {
        negocio: d.get('negocio'), contacto: d.get('contacto'), telefono: d.get('telefono'),
        otros: resumen, web: d.get('web'), utm,
        productos: this.ranking().filter((x) => x.pct >= 15).slice(0, 3).map((x) => PRODUCTO[x.id]).filter(Boolean),
      })
      .subscribe({ next: () => this.estado.set('enviado'), error: () => this.estado.set('error') });
  }
}
