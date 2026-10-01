import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full',
            },
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./features/dashboard/dashboard').then(
                        (m) => m.Dashboard,
                    ),
            },
            {
                path: 'organizacion',
                children: [
                    {
                        path: 'departamentos',
                        loadComponent: () =>
                            import('./features/organizacion/pages/departamento-academico/departamento-academico.component').then(
                                (m) => m.DepartamentoAcademicoComponent,
                            ),
                    },
                    {
                        path: 'departamentos/:id/ver-escuelas', 
                        loadComponent: () =>
                            import('./features/organizacion/pages/departamento-academico/escuela-profesional-dep/escuela-profesional-dep.component').then(
                                (m) => m.EscuelaProfesionalDepComponent
                            )
                    },
                    {
                        path: 'escuelas',
                        loadComponent: () =>
                            import('./features/organizacion/pages/escuela-profesional/escuela-profesional.component').then(
                                (m) => m.EscuelaProfesionalComponent,
                            ),
                    },
                ]
            },
            {
                path: 'configuracion',
                loadComponent: () =>
                    import('./features/configuracion/configuracion.component').then(
                        (m) => m.ConfiguracionComponent,
                    ),
            },
            {
                path: 'configuracion/tabla-maestra',
                loadComponent: () =>
                    import('./features/configuracion/pages/tabla-maestra/tabla-maestra.component').then(
                        (m) => m.TablaMaestraComponent,
                    ),
            },
            //   {
            //     path: '',
            //     redirectTo: 'organizacion/departamentos',
            //     pathMatch: 'full'
            //   },
            //   {
            //     path: 'organizacion/departamentos',
            //     loadComponent: () => import('.)
            //       .then(m => m.DepartamentoPageComponent)
            //   }
            // Aquí iremos agregando el resto de módulos (docentes, tesis, dashboard)
        ]
    }
];
