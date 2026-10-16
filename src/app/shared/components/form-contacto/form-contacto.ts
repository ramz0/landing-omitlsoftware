import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ServiciosService } from '@core/services/servicios.service';
import { environment } from '../../../../environments/environment';

/** Claves de empresas.datos_extra.productos en la API, por id de servicio de la landing. */
const PRODUCTO: Record<string, string> = {
  landing: 'landing_page', software: 'software_a_medida', movil: 'app_movil',
  llamadas: 'agente_llamadas', tienda: 'tienda_online', pos: 'punto_de_venta',
};

/** Formulario de contacto: lo usan el inicio y la calculadora; manda el lead a POST /api/leads. */
@Component({
  selector: 'app-form-contacto',
  template: `
    @if (estado() === 'enviado') {
      <p class="ok">¡Gracias! Te escribimos o llamamos pronto.</p>
    } @else {
      <form #f (submit)="$event.preventDefault(); enviar(f)">
        <input name="negocio" placeholder="Nombre del negocio" required maxlength="120" autocomplete="organization"
               (input)="negocio.set($any($event.target).value)" />
        @if (negocio().trim()) {
          <input name="contacto" placeholder="Tu nombre o el de quien solicita" required maxlength="120" autocomplete="name" />
        }
        <input name="telefono" type="tel" placeholder="Celular (10 dígitos)" required inputmode="tel" autocomplete="tel"
               (input)="celular.set($any($event.target).value)" />
        @if (celular().trim()) {
          <input name="correo" type="email" placeholder="Correo (opcional)" maxlength="120" autocomplete="email" />
          <fieldset>
            <legend>¿Qué te interesa que revisemos?</legend>
            @for (s of servicios(); track s.id) {
              <label><input type="checkbox" name="productos" [value]="s.id" /> {{ s.nombre }}</label>
            }
            <label><input type="checkbox" name="otros_chk" (change)="otros.set($any($event.target).checked)" /> Otros</label>
          </fieldset>
          @if (otros()) {
            <textarea name="otros" rows="3" maxlength="1000" placeholder="Cuéntanos qué necesitas"></textarea>
          }
        }
        <input name="web" class="trampa" tabindex="-1" autocomplete="off" aria-hidden="true" />
        <button type="submit" [disabled]="estado() === 'enviando'">{{ estado() === 'enviando' ? 'Enviando…' : 'Quiero una propuesta' }}</button>
        @if (estado() === 'error') {
          <p class="error">No se pudo enviar. Intenta de nuevo o escríbenos a contacto&#64;omitlsoftware.com.mx.</p>
        }
      </form>
    }
  `,
  styleUrl: './form-contacto.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormContacto {
  private http = inject(HttpClient);
  servicios = inject(ServiciosService).servicios;
  estado = signal<'listo' | 'enviando' | 'enviado' | 'error'>('listo');
  otros = signal(false);
  // Los campos aparecen conforme se escribe: negocio → nombre; celular → correo y checklist.
  negocio = signal('');
  celular = signal('');

  enviar(f: HTMLFormElement) {
    if (!f.reportValidity()) return;
    const d = new FormData(f);
    const utm = Object.fromEntries([...new URLSearchParams(location.search)].filter(([k]) => k.startsWith('utm_')));
    this.estado.set('enviando');
    this.http
      .post(`${environment.apiUrl}/api/leads`, {
        negocio: d.get('negocio'), contacto: d.get('contacto'), telefono: d.get('telefono'),
        correo: d.get('correo'), otros: d.get('otros') ?? '', web: d.get('web'), utm,
        productos: d.getAll('productos').map((id) => PRODUCTO[id as string]).filter(Boolean),
      })
      .subscribe({ next: () => this.estado.set('enviado'), error: () => this.estado.set('error') });
  }
}
