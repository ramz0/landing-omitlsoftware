import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

import { CONTACTO, WEBMAIL, linkCorreo, linkWhatsapp } from '@core/contacto';
import { Icono } from '@shared/components/icono/icono';

/** Formas de escribirnos: WhatsApp, correo y redes. `tarjetas` = grandes (secciones); `iconos` = fila compacta (footer). */
@Component({
  selector: 'app-canales',
  imports: [Icono],
  template: `
    <div class="canales" [class.iconos]="modo() === 'iconos'">
      @if (c.whatsapp) {
        <a class="canal wa" [href]="wa()" target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp">
          <app-icono nombre="whatsapp" /><span>Chatea por WhatsApp</span>
        </a>
      }
      <span class="ancla">
        <a class="canal" [href]="correo()" aria-label="Escríbenos por correo" aria-haspopup="menu" [attr.aria-expanded]="menu()" (click)="abrirMenu($event)">
          <app-icono nombre="correo" /><span>{{ c.email }}</span>
        </a>
        @if (menu()) {
          <div class="menu" role="menu">
            @for (w of webmail; track w.id) {
              <a role="menuitem" [href]="w.url(asunto(), mensaje())" target="_blank" rel="noopener noreferrer" (click)="menu.set(false)">{{ w.nombre }}</a>
            }
            <button type="button" role="menuitem" (click)="copiar()">{{ copiado() ? '¡Copiado!' : 'Copiar dirección' }}</button>
          </div>
        }
      </span>
      @for (r of redes; track r.nombre) {
        <a class="canal" [href]="r.url" target="_blank" rel="noopener noreferrer" [attr.aria-label]="r.nombre">
          <app-icono [nombre]="r.icono" /><span>{{ r.nombre }}</span>
        </a>
      }
    </div>
  `,
  styleUrl: './canales.css',
  host: { '(document:click)': 'menu.set(false)', '(document:keydown.escape)': 'menu.set(false)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Canales {
  readonly modo = input<'tarjetas' | 'iconos'>('tarjetas');
  /** Texto con el que ya llega el chat de WhatsApp; el visitante solo da enviar. */
  readonly mensaje = input('👋 Hola, quiero cotizar. Vengo de la página de omitl software 🌐 y estoy interesado en sus servicios 🚀');
  readonly asunto = input('Cotización desde la página de omitl software');
  readonly c = CONTACTO;
  readonly redes = CONTACTO.redes.filter((r) => r.url);
  readonly webmail = WEBMAIL;
  menu = signal(false);
  copiado = signal(false);
  wa = () => linkWhatsapp(this.mensaje());
  correo = () => linkCorreo(this.asunto(), this.mensaje());

  /** En compu abre un menú de correo web en pestaña nueva (mailto: saca de la página y depende del programa instalado); en celular se queda el mailto, que abre la app. */
  abrirMenu(ev: Event) {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    ev.preventDefault();
    ev.stopPropagation();
    this.menu.update((v) => !v);
  }

  copiar() {
    void navigator.clipboard?.writeText(CONTACTO.email);
    this.copiado.set(true);
    setTimeout(() => this.copiado.set(false), 1800);
  }
}
