import { ChangeDetectionStrategy, Component } from '@angular/core';

import { EnConstruccion } from '@shared/components/en-construccion/en-construccion';
import { FormContacto } from '@shared/components/form-contacto/form-contacto';

/** /calculator: calculadora de presupuesto (aún en construcción); mientras, el formulario de contacto. */
@Component({
  selector: 'app-calculator',
  imports: [EnConstruccion, FormContacto],
  template: `
    <app-en-construccion titulo="Calculadora de presupuesto" mensaje="Estamos trabajando en esta vista: muy pronto podrás estimar el costo de tu proyecto aquí." />
    <section class="contacto">
      <h2>Mientras tanto, cuéntanos tu proyecto</h2>
      <app-form-contacto />
    </section>
  `,
  styles: '.contacto { width: min(1080px, 100% - 2.5rem); margin: 0 auto; padding: 2rem 0 4rem; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Calculator {}
