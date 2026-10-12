import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@layout/public-layout/public-layout').then((m) => m.PublicLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('@modules/inicio/inicio').then((m) => m.Inicio),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
