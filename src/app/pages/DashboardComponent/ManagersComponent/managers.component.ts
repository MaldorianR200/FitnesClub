import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Manager } from '../../../entities/manager/model/types/manager';
import { ManagerService } from '../../../entities/manager/model/api/manager.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-managers',
  imports: [CommonModule, FormsModule],
  templateUrl: './managers.component.html',
  styleUrl: './managers.component.scss',
  standalone: true,
})
export class ManagersComponent {
    managers: Manager[] = [];
    editingManagers: Manager | null = null;
    form: Partial<Manager> = {};

    constructor(private managerService: ManagerService) {
      this.loadManagers();
    }

    loadManagers() {
      this.managerService.getManagers().subscribe(managers => {
        this.managers = managers;
      });
    }

    saveManager() {
      if (this.editingManagers) {
        this.managerService.updateManager({ ...this.form, id: this.editingManagers.id } as Manager)
          .subscribe(() => this.loadManagers());
      } else {
        this.managerService.addManager(this.form as Omit<Manager, 'id'>)
    .subscribe({
      next: () => this.loadManagers(),
      error: err => console.error('Ошибка добавления менеджера', err)
    });
      }
      this.resetForm();
    }

    editManager(managers: Manager) {
      this.editingManagers = managers;
      this.form = { ...managers };
    }

    deleteManager(id: number) {
      if (confirm('Вы уверены, что хотите удалить менеджера?')) {
        this.managerService.deleteManager(id).subscribe(() => this.loadManagers());
      }
    }

    resetForm() {
      this.editingManagers = null;
      this.form = {};
    }
}
