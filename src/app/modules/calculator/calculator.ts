import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Boton } from '@shared/components/boton/boton';

/** /calculator: calculadora de presupuesto (por ahora solo la página; sin cálculo). */
@Component({
  selector: 'app-calculator',
  imports: [Boton],
  template: `
    <section>
      <div class="wrap">
        <h1>Calculadora de presupuesto</h1>
        <p class="lead">Muy pronto podrás estimar el costo de tu proyecto aquí. Mientras, cuéntanos qué necesitas.</p>
        <app-boton href="/#contacto" variante="jade">Pedir una propuesta</app-boton>
      </div>
    </section>
  `,
  styles: 'section { padding: 4rem 0; min-height: 60vh; } h1 { font-size: clamp(1.5rem, 3vw, 2.1rem); margin-bottom: 0.5rem; } .lead { max-width: 60ch; opacity: 0.75; margin-bottom: 1.5rem; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Calculator {}
