import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';

import { ServiciosService } from '@core/services/servicios.service';
import { PRODUCTO } from '@shared/components/form-contacto/form-contacto';
import { environment } from '../../../environments/environment';
import gsap from 'gsap';

import { revelar } from './calculator.animacion';
import { ICONOS } from './calculator.iconos';
import { DESCRIPCION, PREGUNTAS, PROPUESTA, PUNTO_DE_PARTIDA, RAZON, cotizar, recomendar } from './calculator.config';

/** /calculator: cuestionario corto con barra de progreso → rango de precio y propuesta → lead a POST /api/leads. */
@Component({
  selector: 'app-calculator',
  imports: [],
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
        <h1>{{ p.titulo }}</h1>
        <div class="opciones">
          @for (o of p.opciones; track o.id) {
            <button type="button" class="opcion" [class.sel]="respuestas()[p.id] === o.id" (click)="elegir(p.id, o.id)">
              <b>{{ o.texto }}</b>
              @if (o.detalle) { <span>{{ o.detalle }}</span> }
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
        @if (rangoTexto(); as r) {
          <p class="rango">{{ r }}</p>
          <p class="nota">Estimado sin IVA. El precio final lo confirmamos contigo en una llamada.</p>
        } @else {
          <p class="rango chico">Lo cotizamos contigo en una llamada</p>
          <p class="nota">Este tipo de proyecto depende de lo que necesites; no queremos darte un número al aire.</p>
        }
          </div>
        </div>
        <div class="detalle" #detalle>
        <h2>Lo que te proponemos incluir</h2>
        <ul class="propuesta">
          @for (m of modulos(); track m) { <li>{{ m }}</li> }
        </ul>

        @if (otras().length) {
          <h2>Otras opciones para ti</h2>
          <div class="otras">
            @for (o of otras(); track o.id) {
              <button type="button" class="otra" (click)="seleccionada.set(o.id)">
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
  rango = computed(() => cotizar(this.respuestas(), this.activo()));
  rangoTexto = computed(() => {
    const r = this.rango();
    if (!r) return '';
    const f = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
    return `${f.format(r.min)} – ${f.format(r.max)}`;
  });
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
  modulos = computed(() => PROPUESTA[this.activo()] ?? []);

  elegir(pregunta: string, opcion: string) {
    this.seleccionada.set(null);
    this.respuestas.update((r) => ({ ...r, [pregunta]: opcion }));
    this.paso.update((p) => p + 1); // al elegir se avanza solo: una pregunta, un toque
    if (this.paso() === PREGUNTAS.length) this.revelar();
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
    this.animacion?.kill();
    this.animacion = undefined;
    this.fase.set('preguntas');
    this.seleccionada.set(null);
    this.paso.update((p) => Math.max(0, p - 1));
  }

  enviar(f: HTMLFormElement) {
    if (!f.reportValidity()) return;
    const d = new FormData(f);
    const r = this.respuestas();
    const rango = this.rango();
    const resumen =
      `Cotizador: ${PREGUNTAS.map((p) => `${p.id}=${r[p.id]}`).join(', ')}; afinidad ${this.ranking().map((x) => `${x.id} ${x.pct}%`).join(', ')}; ` +
      (rango ? `rango ${rango.min}-${rango.max} MXN sin IVA` : 'se cotiza aparte');
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
