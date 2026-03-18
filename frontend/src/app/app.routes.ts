/**
 * Definición de rutas principales de la aplicación.
 * Separa la vista del dashboard COVID y la vista ESAVI.
 */

import { Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard/dashboard-page.component';
import { EsaviPageComponent } from './pages/esavi/esavi-page.component';

/**
 * Arreglo de rutas usadas por Angular Router.
 */
export const appRoutes: Routes = [
  // Ruta por defecto redirige al dashboard principal
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  // Página principal del mapa COVID
  { path: 'dashboard', component: DashboardPageComponent },
  // Página de análisis ESAVI
  { path: 'esavi', component: EsaviPageComponent },
  // Cualquier ruta inválida redirige al dashboard
  { path: '**', redirectTo: 'dashboard' }
];
