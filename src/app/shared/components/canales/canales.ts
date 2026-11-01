import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { CONTACTO, linkCorreo, linkWhatsapp } from '@core/contacto';
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
      <a class="canal" [href]="correo()" aria-label="Escríbenos por correo">
        <app-icono nombre="correo" /><span>{{ c.email }}</span>
      </a>
      @for (r of redes; track r.nombre) {
        <a class="canal" [href]="r.url" target="_blank" rel="noopener noreferrer" [attr.aria-label]="r.nombre">
          <app-icono [nombre]="r.icono" /><span>{{ r.nombre }}</span>
        </a>
      }
    </div>
  `,
  styleUrl: './canales.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Canales {
  readonly modo = input<'tarjetas' | 'iconos'>('tarjetas');
  /** Texto con el que ya llega el chat de WhatsApp; el visitante solo da enviar. */
  readonly mensaje = input('Hola, quiero cotizar un proyecto');
  readonly asunto = input('Proyecto de software');
  readonly c = CONTACTO;
  readonly redes = CONTACTO.redes.filter((r) => r.url);
  wa = () => linkWhatsapp(this.mensaje());
  correo = () => linkCorreo(this.asunto(), this.mensaje());
}
