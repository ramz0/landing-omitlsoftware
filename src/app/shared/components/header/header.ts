import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';

import { Icono } from '@shared/components/icono/icono';
import { Boton } from '@shared/components/boton/boton';

@Component({
  selector: 'app-header',
  imports: [Boton, Icono, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:scroll)': 'alScroll()' },
})
export class Header {
  private router = inject(Router);
  private url = toSignal(
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd), map(() => this.router.url)),
    { initialValue: this.router.url },
  );

  /** En el inicio el header flota transparente sobre el hero; en el resto de páginas ocupa su lugar y es sólido. */
  flotante = () => this.url().split(/[?#]/)[0] === '/';

  /** Con scroll el header se adelgaza. */
  compacto = signal(false);

  /** Menú desplegable en móvil. */
  abierto = signal(false);

  alScroll() {
    this.compacto.set(window.scrollY > 40);
  }
}
