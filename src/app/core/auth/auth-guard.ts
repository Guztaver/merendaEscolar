import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica se tem token e se está autenticado
  const token = authService.getToken();
  const isAuthenticated = authService.isAuthenticated();

  if (token && isAuthenticated) {
    return true;
  }

  // Se não tiver token ou não estiver autenticado, redireciona para login
  // Salva a URL atual para redirecionar de volta após o login
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
