import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Footer } from '@shared/components/footer/footer';
import { Header } from '@shared/components/header/header';

/** Layout de páginas públicas: solo ordena header + contenido + footer, sin estilos propios. */
@Component({
  selector: 'app-public-layout',
  imports: [Header, RouterOutlet, Footer],
  template: `
    <app-header />
    <main><router-outlet /></main>
    <app-footer />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicLayout {}
