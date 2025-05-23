import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  successMessage = '';
  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    const rememberMe = false;
    this.authService
      .login(this.email, this.password, rememberMe)
      .subscribe((success) => {
        if (success) {
          this.successMessage = 'Авторизация успешна!'
          // Отображаем сообщение и перенаправляем через 1.5 секунды
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
          setTimeout(() => {
          this.successMessage = ''; // Прячем сообщение через некоторое время
        }, 3000);
        } else {

          this.errorMessage = 'Неверные учетные данные';
        }
      });
  }
}
