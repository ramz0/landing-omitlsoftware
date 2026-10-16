import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { Boton } from '@shared/components/boton/boton';

@Component({
  selector: 'app-header',
  imports: [Boton],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:scroll)': 'compacto.set(scrollY > 40)' },
})
export class Header {
  /** Con scroll el header se adelgaza. */
  compacto = signal(false);
}
