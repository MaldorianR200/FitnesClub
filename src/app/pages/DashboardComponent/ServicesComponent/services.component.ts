import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ServiceService } from '../../../entities/service/model/api/service.service';
import { Service } from '../../../entities/service/model/types/service';
import { TrainerService } from '../../../entities/trainer/model/api/trainer.service';
import { Trainer } from '../../../entities/trainer/model/types/trainer';

@Component({
  selector: 'app-trainers',
  imports: [CommonModule, FormsModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
  standalone: true,
})
export class ServicesComponent {
    services: Service[] = [];
    trainers: Trainer[] = [];
    editingService: Service | null = null;
    form: Partial<Service> = {};
    searchQuery: string = '';

    constructor(private serviceService: ServiceService, private trainerService: TrainerService) {
      this.loadServices();
      this.loadTrainers();
    }

    loadServices() {
      this.serviceService.getServices().subscribe(services => {
        this.services = services;
      });
    }

    loadTrainers() {
      this.trainerService.getTrainers().subscribe(data => this.trainers = data);
    }
    getTrainerName(id: number): string {
      return this.trainers.find(t => t.id === id)?.username || 'Неизвестно';
    }

    saveService() {
      if (this.editingService) {
        this.serviceService.updateService({ ...this.form, id: this.editingService.id } as Service)
          .subscribe(() => this.loadServices());
      } else {
        this.serviceService.addService(this.form as Omit<Service, 'id'>)
    .subscribe({
      next: () => this.loadServices(),
      error: err => console.error('Ошибка добавления услуги', err)
    });
      }
      this.resetForm();
    }

    editService(trainer: Service) {
      this.editingService = trainer;
      this.form = { ...trainer };
    }

    filteredService() {
      const query = this.searchQuery.toLowerCase().trim();

      if (!query) return this.services;

      return this.services.filter(service => {
        const serviceTitle = service.title.toLowerCase();
        const trainerName = this.getTrainerName(service.trainer_id).toLowerCase();


        return serviceTitle.includes(query) || trainerName.includes(query)
      });
    }



    deleteService(id: number) {
      if (confirm('Вы уверены, что хотите удалить услугу?')) {
        this.serviceService.deleteService(id).subscribe(() => this.loadServices());
      }
    }

    resetForm(form?: NgForm) {
      this.editingService = null;
      this.form = {};

      if (form) {
        form.resetForm();
      }
    }
}
