import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { Icono } from '@shared/components/icono/icono';
import { Boton } from '@shared/components/boton/boton';

@Component({
  selector: 'app-header',
  imports: [Boton, Icono],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:scroll)': 'alScroll()' },
})
export class Header {
  /** Con scroll el header se adelgaza. */
  compacto = signal(false);

  alScroll() {
    this.compacto.set(window.scrollY > 40);
  }
}
