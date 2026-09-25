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
                ]
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
