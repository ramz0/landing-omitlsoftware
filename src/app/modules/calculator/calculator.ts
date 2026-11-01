import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { ServiciosService } from '@core/services/servicios.service';
import { PRODUCTO } from '@shared/components/form-contacto/form-contacto';
import { environment } from '../../../environments/environment';
import { DESCRIPCION, PREGUNTAS, PROPUESTA, PUNTO_DE_PARTIDA, cotizar } from './calculator.config';

/** /calculator: cuestionario corto con barra de progreso → rango de precio y propuesta → lead a POST /api/leads. */
@Component({
  selector: 'app-calculator',
  imports: [CurrencyPipe],
  template: `
    <section class="cotizador">
      <div class="progreso" role="progressbar" aria-label="Avance del cotizador"
           [attr.aria-valuenow]="porcentaje()" aria-valuemin="0" aria-valuemax="100">
        @for (c of celdas(); track $index) {
          <i [class.on]="c" [style.animation-delay.ms]="($index * 137) % 900"></i>
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
        <p class="kicker">Podemos ayudarte con</p>
        <h1>{{ servicio()?.nombre }}</h1>
        <p class="descripcion">{{ descripcion() }}</p>
        <p class="partida">Partimos de: <b>{{ partida() }}</b>.</p>
        @if (rango(); as r) {
          <p class="rango">{{ r.min | currency: 'MXN' : 'symbol-narrow' : '1.0-0' }} – {{ r.max | currency: 'MXN' : 'symbol-narrow' : '1.0-0' }}</p>
          <p class="nota">Estimado sin IVA. El precio final lo confirmamos contigo en una llamada.</p>
        } @else {
          <p class="rango chico">Lo cotizamos contigo en una llamada</p>
          <p class="nota">Este tipo de proyecto depende de lo que necesites; no queremos darte un número al aire.</p>
        }
        <h2>Lo que te proponemos incluir</h2>
        <ul class="propuesta">
          @for (m of modulos(); track m) { <li>{{ m }}</li> }
        </ul>

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
  respuestas = signal<Record<string, string>>({});
  estado = signal<'listo' | 'enviando' | 'enviado' | 'error'>('listo');

  pregunta = computed(() => PREGUNTAS[this.paso()] ?? null);
  /** Las preguntas llenan la barra hasta el 85 %; el resultado la completa. */
  porcentaje = computed(() => (this.estado() === 'enviado' ? 100 : Math.round((this.paso() / (PREGUNTAS.length + 1)) * 100)));
  etiquetaPaso = computed(() => (this.pregunta() ? `Pregunta ${this.paso() + 1} de ${PREGUNTAS.length}` : 'Tu propuesta'));
  servicio = computed(() => this.servicios().find((s) => s.id === this.respuestas()['objetivo']));
  rango = computed(() => cotizar(this.respuestas()));
  descripcion = computed(() => DESCRIPCION[this.respuestas()['objetivo']] ?? '');
  partida = computed(() => PUNTO_DE_PARTIDA[this.respuestas()['hoy']] ?? '');
  /** La barra son 24 celdas tipo pixel; las encendidas siguen al avance. */
  celdas = computed(() => Array.from({ length: 24 }, (_, i) => i < Math.round((this.porcentaje() / 100) * 24)));
  modulos = computed(() => PROPUESTA[this.respuestas()['objetivo']] ?? []);

  elegir(pregunta: string, opcion: string) {
    this.respuestas.update((r) => ({ ...r, [pregunta]: opcion }));
    this.paso.update((p) => p + 1); // al elegir se avanza solo: una pregunta, un toque
  }

  atras() {
    this.paso.update((p) => Math.max(0, p - 1));
  }

  enviar(f: HTMLFormElement) {
    if (!f.reportValidity()) return;
    const d = new FormData(f);
    const r = this.respuestas();
    const rango = this.rango();
    const resumen =
      `Cotizador: ${PREGUNTAS.map((p) => `${p.id}=${r[p.id]}`).join(', ')}; ` +
      (rango ? `rango ${rango.min}-${rango.max} MXN sin IVA` : 'se cotiza aparte');
    const utm = Object.fromEntries([...new URLSearchParams(location.search)].filter(([k]) => k.startsWith('utm_')));
    this.estado.set('enviando');
    this.http
      .post(`${environment.apiUrl}/api/leads`, {
        negocio: d.get('negocio'), contacto: d.get('contacto'), telefono: d.get('telefono'),
        otros: resumen, web: d.get('web'), utm,
        productos: [PRODUCTO[r['objetivo']]].filter(Boolean),
      })
      .subscribe({ next: () => this.estado.set('enviado'), error: () => this.estado.set('error') });
  }
}
