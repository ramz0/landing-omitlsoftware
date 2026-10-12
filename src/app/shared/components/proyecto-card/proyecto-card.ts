import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Proyecto } from '@models/proyecto.model';
import { BadgePixel } from '@shared/components/badge-pixel/badge-pixel';
import { TecnologiaChip } from '@shared/components/tecnologia/tecnologia';
import { MesAnioPipe } from '@shared/pipes/mes-anio.pipe';

@Component({
  selector: 'app-proyecto-card',
  imports: [BadgePixel, TecnologiaChip, MesAnioPipe],
  templateUrl: './proyecto-card.html',
  styleUrl: './proyecto-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProyectoCard {
  proyecto = input.required<Proyecto>();
}
