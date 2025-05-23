import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Visit } from '../../../entities/visit/model/types/visit';
import { Trainer } from '../../../entities/trainer/model/types/trainer';
import { VisitService } from '../../../entities/visit/model/api/visits.service';
import { TrainerService } from '../../../entities/trainer/model/api/trainer.service';
import { ClientService } from '../../../entities/client/model/api/client.service';
import { ManagerService } from '../../../entities/manager/model/api/manager.service';
import { Client } from '../../../entities/client/model/types/client';
import { Manager } from '../../../entities/manager/model/types/manager';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';


@Component({
  selector: 'app-visits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visits.component.html',
  styleUrl: './visits.component.scss',
})
export class VisitsComponent {
  visits: Visit[] = [];
  trainers: Trainer[] = [];
  clients: Client[] = [];
  managers: Manager[] = [];
  searchQuery: string = '';
  editingVisit: Visit | null = null;
  form: Partial<Visit> = {};


  constructor(
    private visitService: VisitService,
    private trainerService: TrainerService,
    private clientService: ClientService,
    private managerService: ManagerService
  ) {
    this.loadVisits();
    this.loadTrainers();
    this.loadClients();
    this.loadManagers();
  }

  loadVisits() {
    this.visitService.getVisits().subscribe(visits => this.visits = visits);
  }

  loadTrainers() {
    this.trainerService.getTrainers().subscribe(data => this.trainers = data);
  }

  loadClients() {
    this.clientService.getClients().subscribe(data => this.clients = data);
  }

  loadManagers() {
    this.managerService.getManagers().subscribe(data => this.managers = data);
  }

  getTrainerName(id: number): string {
    return this.trainers.find(t => t.id === id)?.username || 'Неизвестно';
  }

  public getClientName(id: number): string {
    return this.clients.find(c => c.id === id)?.username || 'Неизвестно';
  }

  getManagerName(id: number): string {
    return this.managers.find(m => m.id === id)?.username || 'Неизвестно';
  }

  filteredVisits(): Visit[] {
    const query = this.searchQuery.toLowerCase().trim();

    if (!query) return this.visits;

    return this.visits.filter(visit => {
      const clientName = this.getClientName(visit.client_id).toLowerCase();
      const trainerName = this.getTrainerName(visit.trainer_id).toLowerCase();
      const managerName = this.getManagerName(visit.manager_id).toLowerCase();

      return clientName.includes(query) || trainerName.includes(query) || managerName.includes(query);
    });
  }

  saveVisit() {
    if (this.editingVisit) {
      this.visitService.updateVisit({ ...this.form, id: this.editingVisit.id } as Visit)
        .subscribe(() => this.loadVisits());
    } else {
      this.visitService.addVisit(this.form as Omit<Visit, 'id'>)
        .subscribe(() => this.loadVisits());
    }
    this.resetForm();
  }

  editVisit(visit: Visit) {
    this.editingVisit = visit;
    this.form = { ...visit };
  }

  deleteVisit(id: number) {
    if (confirm('Вы уверены, что хотите удалить посещение?')) {
      this.visitService.deleteVisit(id).subscribe(() => this.loadVisits());
    }
  }

  resetForm(form?: NgForm) {
    this.editingVisit = null;
    this.form = {};

    if (form) {
      form.resetForm();
    }
  }


  downloadPDF() {
  const data = document.getElementById('visitsTable');
  if (!data) return;


  data.classList.add('print-mode');

  html2canvas(data).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('session-report.pdf');

    data.classList.remove('print-mode');
  });
}
}
