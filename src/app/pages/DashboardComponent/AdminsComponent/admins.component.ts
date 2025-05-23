import { Component } from '@angular/core';
import { AdminService } from '../../../entities/admins/model/api/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Admin } from '../../../entities/admins/model/types/admin';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admins.component.html',
  styleUrl: './admins.component.scss',
})
export class AdminsComponent {
  admins: Admin[] = [];
  editingAdmin: Admin | null = null;
  form: Partial<Admin> = {};

  constructor(private adminService: AdminService) {
    this.loadAdmins();
  }

  loadAdmins() {
    this.adminService.getAdmins().subscribe(clients => {
      this.admins = clients;
    });
  }

  saveAdmin() {
    if (this.editingAdmin) {
      this.adminService.updateAdmin({ ...this.form, id: this.editingAdmin.id } as Admin)
        .subscribe(() => this.loadAdmins());
    } else {
      this.adminService.addAdmin(this.form as Omit<Admin, 'id'>)
  .subscribe({
    next: () => this.loadAdmins(),
    error: err => console.error('Ошибка добавления клиента', err)
  });
    }
    this.resetForm();
  }

  editAdmin(client: Admin) {
    this.editingAdmin = client;
    this.form = { ...client };
  }

  deleteAdmin(id: number) {
    if (confirm('Вы уверены, что хотите удалить клиента?')) {
      this.adminService.deleteAdmin(id).subscribe(() => this.loadAdmins());
    }
  }

  resetForm(form?: NgForm) {
    this.editingAdmin = null;
    this.form = {};

    if (form) {
      form.resetForm();
    }
  }
}
