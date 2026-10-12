import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Boton } from '@shared/components/boton/boton';

@Component({
  selector: 'app-header',
  imports: [Boton],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {}
