import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegistrationComponent } from './auth/registration/registration.component';
import { AuthGuard } from './guards/auth.guard';
import { DashboardComponent } from './pages/DashboardComponent/dashboard.component';
import { ClientsComponent } from './pages/DashboardComponent/ClientsComponent/clients.component';
import { TrainersComponent } from './pages/DashboardComponent/TrainersComponent/trainers.component';
import { ServicesComponent } from './pages/DashboardComponent/ServicesComponent/services.component';
import { VisitsComponent } from './pages/DashboardComponent/VisitsComponent/visits.component';
import { RoleGuard } from './guards/role.guard';
import { Role } from './shared/models/Role';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/registration/registration.component').then(
        (m) => m.RegistrationComponent
      ),
  },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        children: [
          {
            path: 'home',
            loadComponent: () =>
              import('./pages/DashboardComponent/HomeComponent/home.component').then(m => m.HomeComponent),
            canActivate: [RoleGuard],
            data: { roles: [Role.ADMIN, Role.MANAGER, Role.TRAINER] },
          },
          {
            path: 'admins',
            loadComponent: () =>
              import('./pages/DashboardComponent/AdminsComponent/admins.component').then(m => m.AdminsComponent),
            canActivate: [RoleGuard],
            data: { roles: [Role.ADMIN] },
          },
          {
            path: 'clients',
            loadComponent: () =>
              import('./pages/DashboardComponent/ClientsComponent/clients.component').then(m => m.ClientsComponent),
            canActivate: [RoleGuard],
            data: { roles: [Role.ADMIN, Role.MANAGER] },
          },
          {
            path: 'managers',
            loadComponent: () =>
              import('./pages/DashboardComponent/ManagersComponent/managers.component').then(m => m.ManagersComponent),
            canActivate: [RoleGuard],
            data: { roles: [Role.ADMIN] },
          },
          {
            path: 'trainers',
            loadComponent: () =>
              import('./pages/DashboardComponent/TrainersComponent/trainers.component').then(m => m.TrainersComponent),
            canActivate: [RoleGuard],
            data: { roles: [Role.ADMIN, Role.MANAGER] },
          },
          {
            path: 'services',
            loadComponent: () =>
              import('./pages/DashboardComponent/ServicesComponent/services.component').then(m => m.ServicesComponent),
            canActivate: [RoleGuard],
            data: { roles: [Role.ADMIN, Role.MANAGER, Role.TRAINER] },
          },
          {
            path: 'visits',
            loadComponent: () =>
              import('./pages//DashboardComponent/VisitsComponent/visits.component').then(m => m.VisitsComponent),
            canActivate: [RoleGuard],
            data: { roles: [Role.ADMIN, Role.TRAINER, Role.MANAGER] },
          },
          {
            path: 'payments',
            loadComponent: () =>
              import('./pages//DashboardComponent/PaymentsComponent/payments.component').then(m => m.PaymentsComponent),
            canActivate: [RoleGuard],
            data: { roles: [Role.ADMIN, Role.MANAGER] },
          },

          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'home',
          }
        ]
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard/home'
      }
    ]
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./shared/ui/UnauthorizedComponent/unauthorized.component').then(
        (m) => m.UnauthorizedComponent
      ),
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./shared/ui/NotFoundComponent/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
  { path: '**', redirectTo: 'not-found' },
];
