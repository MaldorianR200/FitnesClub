import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Role } from '../../shared/models/Role';
import { phoneNumberValidator } from '../validator/validator';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})


export class RegistrationComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  loading = false;
  roles = Object.values(Role).filter((value) => typeof value === 'string');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      phone: ['', [Validators.required, phoneNumberValidator]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['', Validators.required],
      rememberMe: [false],
    });
  }

  get phone() {
    return this.registerForm.get('phone');
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Нормализация номера телефона перед отправкой
    const formData = {
      ...this.registerForm.value,
      phone: this.normalizePhoneNumber(this.registerForm.value.phone)
    };

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.successMessage = 'Регистрация успешна!'
        setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        setTimeout(() => {
          this.successMessage = ''; // Прячем сообщение через некоторое время
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = err.message || 'Registration failed';
        this.loading = false;
      },
    });
  }

    // Нормализация номера телефона (приводим к формату +7XXXXXXXXXX)
  private normalizePhoneNumber(phone: string): string {
    // Удаляем все нецифровые символы
    const cleaned = phone.replace(/\D/g, '');

    // Если номер начинается с 8, заменяем на +7
    if (cleaned.startsWith('8') && cleaned.length === 11) {
      return '+7' + cleaned.substring(1);
    }

    // Если номер начинается с 7 и длиной 11 цифр, добавляем +
    if (cleaned.startsWith('7') && cleaned.length === 11) {
      return '+' + cleaned;
    }

    // Для международных номеров просто добавляем + если его нет
    return phone.startsWith('+') ? phone : '+' + phone;
  }
}
