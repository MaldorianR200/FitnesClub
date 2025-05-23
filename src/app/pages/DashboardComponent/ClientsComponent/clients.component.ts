import { Component } from '@angular/core';
import { ClientService } from '../../../entities/client/model/api/client.service';
import { Client } from '../../../entities/client/model/types/client';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss',
})
export class ClientsComponent {
  clients: Client[] = [];
  editingClient: Client | null = null;
  form: Partial<Client> = {};

  constructor(private clientService: ClientService) {
    this.loadClients();
  }

  loadClients() {
    this.clientService.getClients().subscribe(clients => {
      this.clients = clients;
    });
  }

  saveClient() {
    if (this.editingClient) {
      this.clientService.updateClient({ ...this.form, id: this.editingClient.id } as Client)
        .subscribe(() => this.loadClients());
    } else {
      this.clientService.addClient(this.form as Omit<Client, 'id'>)
  .subscribe({
    next: () => this.loadClients(),
    error: err => console.error('Ошибка добавления клиента', err)
  });
    }
    this.resetForm();
  }

  editClient(client: Client) {
    this.editingClient = client;
    this.form = { ...client };
  }

  deleteClient(id: number) {
    if (confirm('Вы уверены, что хотите удалить клиента?')) {
      this.clientService.deleteClient(id).subscribe(() => this.loadClients());
    }
  }

  resetForm() {
    this.editingClient = null;
    this.form = {};
  }
}
