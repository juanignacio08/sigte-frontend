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
                    {
                        path: 'docentes',
                        loadComponent: () =>
                            import('./features/organizacion/pages/docentes/docentes.component').then(
                                (m) => m.DocentesComponent,
                            ),
                    },
                ]
            },
            {
                path: 'personal',
                children: [
                    {
                        path: 'docentes',
                        loadComponent: () =>
                            import('./features/organizacion/pages/docentes/docentes.component').then(
                                (m) => m.DocentesComponent,
                            ),
                    },
                    {
                        path: 'estudiantes',
                        loadComponent: () =>
                            import('./features/organizacion/pages/estudiantes/estudiantes.component').then(
                                (m) => m.EstudiantesComponent
                            )
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
            {
                path: 'tesis',
                children: [
                    {
                        path: 'listar',
                        loadComponent: () =>
                            import('./features/tesis/pages/tesis/tesis.component').then(
                                (m) => m.TesisComponent,
                            ),
                    },
                    {
                        path: 'registrar',
                        loadComponent: () =>
                            import('./features/tesis/pages/tesis-create/tesis-create.component').then(
                                (m) => m.TesisCreateComponent,
                            ),
                    },
                    {
                        path: 'detalle/:id',
                        loadComponent: () =>
                            import('./features/tesis/pages/tesis-detalle/tesis-detalle.component').then(
                                (m) => m.TesisDetalleComponent,
                            ),
                    },
                    {
                        path: 'detalle/:tesisId/expediente/:expedienteId',
                        loadComponent: () =>
                            import('./features/tesis/pages/tesis-detalle/expediente-detalle/expediente-detalle.component').then(
                                (m) => m.ExpedienteDetalleComponent,
                            ),
                    },
                    {
                        path: 'detalle/:tesisId/expediente/:expedienteId/comision',
                        loadComponent: () =>
                            import('./features/tesis/pages/tesis-detalle/expediente-comision/expediente-comision.component').then(
                                (m) => m.ExpedienteComisionComponent,
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
