import { Injectable, signal } from '@angular/core';

import { Servicio } from '@models/proyecto.model';

@Injectable({ providedIn: 'root' })
export class ServiciosService {
  readonly servicios = signal<Servicio[]>([
    {
      id: 'landing',
      tipo: 'landing',
      nombre: 'Landing page',
      descripcion: 'Tu presencia profesional en la web: rápida, clara y adaptada a cualquier dispositivo.',
    },
    {
      id: 'software',
      tipo: 'software',
      nombre: 'Software a la medida',
      descripcion: 'Sistemas internos y portales hechos para tu operación, no al revés.',
    },
    {
      id: 'movil',
      tipo: 'software',
      nombre: 'App móvil',
      descripcion: 'Tu servicio en el teléfono de tus clientes y de tu equipo.',
    },
    {
      id: 'llamadas',
      tipo: 'software',
      nombre: 'Agente de llamadas',
      descripcion:
        'Atención y ventas por teléfono con herramientas propias: softphone, seguimiento y análisis de cada llamada.',
    },
    {
      id: 'tienda',
      tipo: 'tienda',
      nombre: 'Tienda online',
      descripcion: 'Vende por internet con catálogo, carrito y pagos.',
    },
    {
      id: 'pos',
      tipo: 'software',
      nombre: 'Punto de venta (SaaS)',
      descripcion: 'Un punto de venta en la nube para cobrar, controlar inventario y ver tus ventas.',
    },
  ]);
}
