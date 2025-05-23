import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { Role } from '../../shared/models/Role';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
})
export class DashboardComponent {
  Role = Role; // делаем доступным для HTML
  constructor(public authService: AuthService) {}
    logout(): void {
      this.authService.logout();
    }
}
