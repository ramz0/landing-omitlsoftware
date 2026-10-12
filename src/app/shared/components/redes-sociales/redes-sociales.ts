import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { RedSocial } from '@models/equipo.model';
import { Icono } from '@shared/components/icono/icono';

@Component({
  selector: 'app-redes-sociales',
  imports: [Icono],
  template: `
    @for (r of redes(); track r.nombre) {
      @if (r.url) {
        <a [href]="r.url" target="_blank" rel="noopener noreferrer" [attr.aria-label]="r.nombre">
          <app-icono [nombre]="r.icono" />
        </a>
      } @else {
        <span class="off" role="img" [attr.aria-label]="r.nombre + ' (próximamente)'">
          <app-icono [nombre]="r.icono" />
        </span>
      }
    }
  `,
  styleUrl: './redes-sociales.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RedesSociales {
  redes = input.required<RedSocial[]>();
}
