import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CONTACTO } from '@core/contacto';
import { Canales } from '@shared/components/canales/canales';
import { ServiciosService } from '@core/services/servicios.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Canales],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly anio = new Date().getFullYear();
  readonly servicios = inject(ServiciosService).servicios;
  readonly email = CONTACTO.email;
}
