import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Tecnologia } from '@models/proyecto.model';
import { Icono } from '@shared/components/icono/icono';

@Component({
  selector: 'app-tecnologia',
  imports: [Icono],
  template: `
    @if (tecnologia().icono; as icono) {
      <app-icono [nombre]="icono" />
    }
    {{ tecnologia().nombre }}
  `,
  styleUrl: './tecnologia.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TecnologiaChip {
  tecnologia = input.required<Tecnologia>();
}
