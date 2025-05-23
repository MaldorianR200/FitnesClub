import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Role } from '../shared/models/Role';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as Role[];
    const userRole = this.authService.getUserRole();

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; 
    }

    if (!userRole || !requiredRoles.includes(userRole)) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}
