import { ChangeDetectionStrategy, Component } from '@angular/core';

import { EnConstruccion } from '@shared/components/en-construccion/en-construccion';

/** /calculator: calculadora de presupuesto (aún en construcción). */
@Component({
  selector: 'app-calculator',
  imports: [EnConstruccion],
  template: '<app-en-construccion titulo="Calculadora de presupuesto" mensaje="Estamos trabajando en esta vista: muy pronto podrás estimar el costo de tu proyecto aquí." />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Calculator {}
