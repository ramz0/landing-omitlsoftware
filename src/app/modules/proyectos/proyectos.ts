import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { ProyectosService } from '@core/services/proyectos.service';
import { CATEGORIAS } from '@models/proyecto.model';
import { ProyectoCard } from '@shared/components/proyecto-card/proyecto-card';

/** Todos los proyectos, filtrables por tipo (?tipo=landing, software, tienda o catalogo). */
@Component({
  selector: 'app-proyectos',
  imports: [ProyectoCard, RouterLink],
  templateUrl: './proyectos.html',
  styleUrl: './proyectos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Proyectos {
  private svc = inject(ProyectosService);
  private ruta = inject(ActivatedRoute);

  proyectos = this.svc.proyectos;

  /** 'todos' o el id de una categoría; sale de la URL para que el filtro se pueda compartir. */
  filtro = toSignal(this.ruta.queryParamMap.pipe(map((q) => q.get('tipo') ?? 'todos')), {
    initialValue: 'todos',
  });

  /** Solo los tipos que tienen al menos un proyecto, con su conteo. */
  tipos = computed(() =>
    CATEGORIAS.map((c) => ({
      ...c,
      total: this.proyectos().filter((p) => p.categoria === c.id).length,
    })).filter((c) => c.total > 0),
  );

  visibles = computed(() =>
    this.filtro() === 'todos'
      ? this.proyectos()
      : this.proyectos().filter((p) => p.categoria === this.filtro()),
  );
}
