/**
 * Archivo principal de entrada de la aplicación Angular.
 * Bootstraps (inicia) el módulo raíz de la aplicación.
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app/app.routes';

/**
 * Inicialización de la aplicación Angular.
 * Utiliza el enfoque de standalone components (Angular 17+).
 * 
 * @param AppComponent - Componente raíz de la aplicación
 * @param config - Configuración global de providers
 */
bootstrapApplication(AppComponent, {
  providers: [
    // Proveedor para el cliente HTTP
    provideHttpClient(),
    // Proveedor de rutas para navegación entre páginas
    provideRouter(appRoutes)
  ]
}).catch(err => console.error(err));
