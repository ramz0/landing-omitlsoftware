import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Boton } from '@shared/components/boton/boton';

/** Pantalla "estamos trabajando en esta vista" para páginas o secciones que aún no están listas. */
@Component({
  selector: 'app-en-construccion',
  imports: [Boton],
  template: `
    <section>
      <div class="wrap">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
        </svg>
        <h1>{{ titulo() }}</h1>
        <p>{{ mensaje() }}</p>
        <app-boton href="/" variante="jade">Volver al inicio</app-boton>
      </div>
    </section>
  `,
  styles: `
    section { padding: 5rem 0; min-height: 60vh; text-align: center; }
    svg { width: 3.5rem; height: 3.5rem; color: var(--yellow); margin-bottom: 1rem; }
    h1 { font-size: clamp(1.5rem, 3vw, 2.1rem); margin-bottom: 0.5rem; }
    p { max-width: 50ch; margin: 0 auto 1.5rem; opacity: 0.75; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnConstruccion {
  titulo = input('Estamos trabajando en esta vista');
  mensaje = input('Muy pronto estará lista. Gracias por tu paciencia.');
}
