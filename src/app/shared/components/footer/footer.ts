import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ServiciosService } from '@core/services/servicios.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly anio = new Date().getFullYear();
  readonly servicios = inject(ServiciosService).servicios;
  // ponytail: duplicado de inicio.ts; moverlo a un servicio si hay un tercer uso.
  readonly email = 'contacto@omitlsoftware.com.mx';
}
