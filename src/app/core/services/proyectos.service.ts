import { Injectable, computed, signal } from '@angular/core';

import { Integrante, Proyecto, Tecnologia } from '@models/proyecto.model';

const LUIS: Integrante = { nombre: 'Luis Ramírez Durán', rol: 'Frontend y parte del backend' };
const JAQUELIN: Integrante = { nombre: 'Jaquelin Barragán Marín', rol: 'Backend Node.js' };

/** Proyectos en producción que se muestran en la landing. Sin URLs a propósito (confidencialidad). */
@Injectable({ providedIn: 'root' })
export class ProyectosService {
  readonly proyectos = signal<Proyecto[]>([
    {
      id: 'mipaay',
      nombre: 'Mi Paay',
      etiqueta: 'Operación financiera',
      descripcion:
        'Software a la medida para gestionar los préstamos internos entre tesorería y mesa de operaciones, de modo que la operación continúa en sitio o a distancia.',
      stack: [
        { nombre: 'Angular 21', icono: 'angular' },
        { nombre: 'Node.js', icono: 'nodejs' },
      ],
      usuarios: 9,
      desde: '2025-10-13',
      equipo: [LUIS, JAQUELIN],
    },
    {
      id: 'themoneycenter',
      nombre: 'The Money Center',
      etiqueta: 'Productividad y agenda',
      descripcion:
        'Software a la medida para reportar la productividad entre usuarios, registrar los trámites que cada uno carga y agendar citas con clientes.',
      stack: [
        { nombre: 'Angular 21', icono: 'angular' },
        { nombre: 'Go', icono: 'go' },
      ],
      usuarios: 115,
      desde: '2026-06-01',
      equipo: [{ nombre: LUIS.nombre, rol: 'Desarrollo completo' }],
    },
    {
      id: 'oportunidadespaay',
      nombre: 'Oportunidades Paay',
      etiqueta: 'Presencia web',
      descripcion:
        'Landing page informativa que le da a la empresa una presencia profesional: quiénes son, sus productos, requisitos y formas de contacto.',
      stack: [
        { nombre: 'Angular 21', icono: 'angular' },
        { nombre: 'Diseño adaptado a cualquier dispositivo' },
      ],
      desde: '2026-04-08',
      equipo: [LUIS, JAQUELIN],
    },
  ]);

  /** Tecnologías con las que trabajamos (sección "Stack de tecnologías"). */
  readonly tecnologias = signal<Tecnologia[]>([
    { nombre: 'Angular', icono: 'angular' },
    { nombre: 'Node.js', icono: 'nodejs' },
    { nombre: 'Go', icono: 'go' },
    { nombre: 'Bun', icono: 'bun' },
    { nombre: 'Tailwind', icono: 'tailwind' },
    { nombre: 'CSS', icono: 'css' },
    { nombre: 'HTML', icono: 'html' },
    { nombre: 'JavaScript', icono: 'javascript' },
    { nombre: 'Kotlin', icono: 'kotlin' },
    { nombre: 'Flutter', icono: 'flutter' },
  ]);

  readonly totalProyectos = computed(() => this.proyectos().length);
  readonly totalUsuarios = computed(() =>
    this.proyectos().reduce((suma, p) => suma + (p.usuarios ?? 0), 0),
  );
  readonly desdeAnio = computed(() =>
    Math.min(...this.proyectos().map((p) => new Date(p.desde).getUTCFullYear())),
  );
}
