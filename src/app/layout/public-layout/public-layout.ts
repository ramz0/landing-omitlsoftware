import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { CONTACTO, linkWhatsapp } from '@core/contacto';
import { Icono } from '@shared/components/icono/icono';
import { Footer } from '@shared/components/footer/footer';
import { Header } from '@shared/components/header/header';

/** Layout de páginas públicas: solo ordena header + contenido + footer, sin estilos propios. */
@Component({
  selector: 'app-public-layout',
  imports: [Header, RouterOutlet, Footer, Icono],
  template: `
    <app-header />
    <main><router-outlet /></main>
    <app-footer />
    @if (wa) {
      <a class="wa-flotante" [href]="wa" target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp">
        <app-icono nombre="whatsapp" /><span>¿Dudas? Escríbenos</span>
      </a>
    }
  `,
  styles: `
    .wa-flotante { position: fixed; right: 1rem; bottom: 1rem; z-index: 20; display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; border: 2px solid var(--night); border-radius: 999px; background: var(--yellow); color: var(--night); font-weight: 700; font-size: 0.9rem; text-decoration: none; box-shadow: 3px 3px 0 var(--night); transition: transform 0.15s, box-shadow 0.15s; }
    .wa-flotante app-icono { font-size: 1.6rem; }
    .wa-flotante span { max-width: 0; overflow: hidden; white-space: nowrap; transition: max-width 0.3s, margin 0.3s; }
    .wa-flotante:hover, .wa-flotante:focus-visible { transform: translate(-2px, -2px); box-shadow: 5px 5px 0 var(--night); }
    .wa-flotante:hover span, .wa-flotante:focus-visible span { max-width: 12rem; margin: 0 0.4rem 0 0.1rem; }
    @media (prefers-reduced-motion: reduce) { .wa-flotante, .wa-flotante span { transition: none; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicLayout {
  readonly wa = CONTACTO.whatsapp ? linkWhatsapp('Hola, tengo una duda sobre sus servicios') : '';
}
