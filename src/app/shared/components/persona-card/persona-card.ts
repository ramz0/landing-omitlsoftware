import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Persona } from '@models/equipo.model';
import { Icono } from '@shared/components/icono/icono';
import { RedesSociales } from '@shared/components/redes-sociales/redes-sociales';

@Component({
  selector: 'app-persona-card',
  imports: [Icono, RedesSociales],
  templateUrl: './persona-card.html',
  styleUrl: './persona-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonaCard {
  persona = input.required<Persona>();
  fondo = computed(() => {
    const foto = this.persona().foto;
    return foto ? `linear-gradient(to top, rgb(10 41 41 / 0.92) 35%, transparent 75%), url(${foto})` : null;
  });
}
