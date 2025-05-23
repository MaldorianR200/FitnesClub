import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Trainer } from '../../../entities/trainer/model/types/trainer';
import { TrainerService } from '../../../entities/trainer/model/api/trainer.service';

@Component({
  selector: 'app-trainers',
  imports: [CommonModule, FormsModule],
  templateUrl: './trainers.component.html',
  styleUrl: './trainers.component.scss',
  standalone: true,
})
export class TrainersComponent {
    trainers: Trainer[] = [];
    editingTrainer: Trainer | null = null;
    form: Partial<Trainer> = {};

    constructor(private trainerService: TrainerService) {
      this.loadTrainers();
    }

    loadTrainers() {
      this.trainerService.getTrainers().subscribe(trainers => {
        this.trainers = trainers;
      });
    }

    saveTrainer() {
      if (this.editingTrainer) {
        this.trainerService.updateTrainer({ ...this.form, id: this.editingTrainer.id } as Trainer)
          .subscribe(() => this.loadTrainers());
      } else {
        this.trainerService.addTrainer(this.form as Omit<Trainer, 'id'>)
    .subscribe({
      next: () => this.loadTrainers(),
      error: err => console.error('Ошибка добавления тренера', err)
    });
      }
      this.resetForm();
    }

    editTrainer(trainer: Trainer) {
      this.editingTrainer = trainer;
      this.form = { ...trainer };
    }

    deleteTrainer(id: number) {
      if (confirm('Вы уверены, что хотите удалить клиента?')) {
        this.trainerService.deleteTrainer(id).subscribe(() => this.loadTrainers());
      }
    }

    resetForm() {
      this.editingTrainer = null;
      this.form = {};
    }
}
