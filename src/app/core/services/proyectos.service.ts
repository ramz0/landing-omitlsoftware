import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import { Integrante, Proyecto, Tecnologia } from '@models/proyecto.model';
import { environment } from '../../../environments/environment';

const LUIS: Integrante = { nombre: 'Luis Ramírez Durán', rol: 'Frontend y parte del backend' };
const JAQUELIN: Integrante = { nombre: 'Jaquelin Barragán Marín', rol: 'Backend Node.js' };

/** Lo que devuelve GET /api/proyectos (proyectoPublico en api-cc-omitl); icono es texto libre. */
interface ProyectoApi extends Omit<Proyecto, 'stack' | 'video'> {
  stack: { nombre: string; icono?: string }[];
  video?: { src: string; poster: string };
}

/** Respaldo: se muestra mientras carga la API y si ésta falla o aún no tiene proyectos publicados. */
const RESPALDO: Proyecto[] = [
  {
    id: 'mipaay',
    nombre: 'Oportunidades Paay Sistema',
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
    video: { src: 'proyectos/mipaay.mp4', poster: 'proyectos/mipaay.jpg' },
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
    video: { src: 'proyectos/themoneycenter.mp4', poster: 'proyectos/themoneycenter.jpg' },
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
    video: { src: 'proyectos/oportunidadespaay.mp4', poster: 'proyectos/oportunidadespaay.jpg' },
    dominio: 'www.paayoportunidades.com',
  },
  {
    id: 'vidrieriaramirez',
    nombre: 'Vidriería Ramírez',
    etiqueta: 'Catálogo web',
    descripcion:
      'Catálogo en línea para un negocio de cancelería y vidriería: más de 200 trabajos filtrables por tipo y acabado, ubicación, reseñas y cotización directa por WhatsApp.',
    stack: [
      { nombre: 'Angular 21', icono: 'angular' },
      { nombre: 'Diseño adaptado a cualquier dispositivo' },
    ],
    desde: '2026-10-11',
    equipo: [{ nombre: LUIS.nombre, rol: 'Desarrollo completo' }],
    video: { src: 'proyectos/vidrieriaramirez.mp4', poster: 'proyectos/vidrieriaramirez.jpg' },
    dominio: 'catalogo-vr.luis-syber.workers.dev',
  },
];

/**
 * Proyectos en producción que se muestran en la landing. Se administran desde el sistema
 * (cc.omitlsoftware.com.mx → Proyectos web); solo los sitios web públicos llevan `dominio`,
 * el software a la medida no (confidencialidad).
 */
@Injectable({ providedIn: 'root' })
export class ProyectosService {
  private http = inject(HttpClient);

  readonly proyectos = signal<Proyecto[]>(RESPALDO);

  constructor() {
    this.http.get<ProyectoApi[]>(`${environment.apiUrl}/api/proyectos`).subscribe({
      next: (lista) => {
        if (!lista.length) return; // sin publicados: se queda el respaldo
        // Los archivos vienen como ruta relativa a la API.
        const abs = (r: string) => (r ? environment.apiUrl + r : r);
        this.proyectos.set(
          lista.map((p) => ({
            ...p,
            stack: p.stack as Tecnologia[],
            video: p.video ? { src: abs(p.video.src), poster: abs(p.video.poster) } : undefined,
          })),
        );
      },
      error: () => {}, // el respaldo ya está en pantalla
    });
  }

  /** Tecnologías con las que trabajamos (sección "Stack de tecnologías"). */
  readonly tecnologias = signal<Tecnologia[]>([
    {
      nombre: 'Angular',
      icono: 'angular',
      atajo: 'A',
      uso: 'Interfaces de nuestros sistemas (Oportunidades Paay Sistema, The Money Center, Oportunidades Paay): componentes standalone, signals y rutas con carga diferida.',
    },
    {
      nombre: 'Node.js',
      icono: 'nodejs',
      atajo: 'N',
      uso: 'Backend de Oportunidades Paay Sistema: API REST, autenticación y la lógica de negocio del sistema.',
    },
    {
      nombre: 'Go',
      icono: 'go',
      atajo: 'G',
      uso: 'APIs del call center y de The Money Center: rápidas, un solo binario y poco consumo en producción.',
    },
    {
      nombre: 'PostgreSQL',
      icono: 'postgresql',
      atajo: 'P',
      uso: 'Base de datos relacional de nuestros sistemas: transacciones, integridad de datos y consultas rápidas bajo carga.',
    },
    {
      nombre: 'GSAP',
      icono: 'gsap',
      atajo: 'S',
      uso: 'Animaciones de interfaz con secuencias y easing precisos, donde CSS puro se queda corto (por ejemplo, el marcador de llamadas).',
    },
    {
      nombre: 'Three.js',
      icono: 'threejs',
      atajo: '3',
      uso: 'Escenas 3D en el navegador: es lo que dibuja este teclado, con luz, sombras y materiales en tiempo real.',
    },
    {
      nombre: 'Bun',
      icono: 'bun',
      atajo: 'B',
      uso: 'Runtime y gestor de paquetes en el desarrollo del front: instala y compila en segundos.',
    },
    {
      nombre: 'Tailwind',
      icono: 'tailwind',
      atajo: 'T',
      uso: 'Estilos utilitarios para prototipar interfaces rápido y mantenerlas consistentes.',
    },
    {
      nombre: 'CSS',
      icono: 'css',
      atajo: 'C',
      uso: 'Diseño responsivo y animaciones propias: grid, variables y transiciones, sin librerías.',
    },
    {
      nombre: 'HTML',
      icono: 'html',
      atajo: 'H',
      uso: 'Maquetado semántico y accesible, base del SEO y del prerender de esta landing.',
    },
    {
      nombre: 'JavaScript',
      icono: 'javascript',
      atajo: 'J',
      uso: 'Lógica en el navegador y scripts de automatización cuando un framework es demasiado.',
    },
    {
      nombre: 'Kotlin',
      icono: 'kotlin',
      atajo: 'K',
      uso: 'Apps móviles nativas para Android cuando se necesita acceso completo al dispositivo.',
    },
    {
      nombre: 'Flutter',
      icono: 'flutter',
      atajo: 'F',
      uso: 'Una sola base de código para apps móviles en Android e iOS.',
    },
  ]);

  readonly totalProyectos = computed(() => this.proyectos().length);
  readonly totalUsuarios = computed(() =>
    this.proyectos().reduce((suma, p) => suma + (p.usuarios ?? 0), 0),
  );
  readonly desdeAnio = computed(() =>
    Math.min(...this.proyectos().map((p) => new Date(p.desde).getUTCFullYear())),
  );
}
