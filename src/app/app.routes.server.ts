import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // --- Аутентификация ---
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'register', renderMode: RenderMode.Prerender },

  // --- Основные страницы ---
  { path: 'dashboard', renderMode: RenderMode.Prerender },
  { path: 'dashboard/home', renderMode: RenderMode.Prerender },
  { path: 'dashboard/admins', renderMode: RenderMode.Prerender },
  { path: 'dashboard/clients', renderMode: RenderMode.Prerender },
  { path: 'dashboard/trainers', renderMode: RenderMode.Prerender },
  { path: 'dashboard/services', renderMode: RenderMode.Prerender },
  { path: 'dashboard/visits', renderMode: RenderMode.Prerender },
  { path: 'dashboard/statistics', renderMode: RenderMode.Prerender},



  // --- Страницы ошибок ---
  { path: 'unauthorized', renderMode: RenderMode.Prerender },
  { path: 'not-found', renderMode: RenderMode.Prerender },

  // --- Главная и fallback ---
  { path: '', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Prerender },
];
