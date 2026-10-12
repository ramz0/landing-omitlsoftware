import { Pipe, PipeTransform } from '@angular/core';

const formato = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric', timeZone: 'UTC' });

/** '2025-10-13' → 'octubre de 2025'. */
@Pipe({ name: 'mesAnio' })
export class MesAnioPipe implements PipeTransform {
  transform(iso: string): string {
    return formato.format(new Date(iso));
  }
}
