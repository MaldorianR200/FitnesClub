import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Role } from '../../../shared/models/Role';
import { VisitService } from '../../../entities/visit/model/api/visits.service';
import { ServiceService } from '../../../entities/service/model/api/service.service';
import { PaymentService } from '../../../entities/payments/model/api/payment.service';
import { Visit } from '../../../entities/visit/model/types/visit';
import { Payment } from '../../../entities/payments/model/types/payment';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../entities/client/model/api/client.service';
import { Service } from '../../../entities/service/model/types/service';
import { HttpClient } from '@angular/common/http';
import { Client } from '../../../entities/client/model/types/client';
@Component({
  selector: 'app-services',
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss',
  standalone: true,
})
export class PaymentsComponent implements OnInit {
  payments:  Payment[] = [];
  visits: Visit[] = [];
  services: Service[] = [];
  clients: Client[] = []
  newPayment: any = {};
  isAdmin = false;
  isManager = false;

  constructor(
    private paymentService: PaymentService,
    private visitService: VisitService,
    private serviceService: ServiceService,
    private clientService: ClientService
  ) {
    console.log('paymentService', this.paymentService);
    console.log('visitService', this.visitService);
    console.log('serviceService', this.serviceService);
    console.log('clientService', this.clientService);
    this.loadVisits();
    this.loadPayments();
    this.loadServices();
    this.loadClients();
  }

  payment: Payment = {
    visit_id: 0,
    service_id: 0,
    quantity: 1,
    final_price: 0,
    discount: 0.0
  };
  editingPayment: boolean = false;



  ngOnInit(): void {
    this.loadVisits();
    this.loadPayments();
    this.loadServices();
    this.loadClients();
  }

  loadVisits(): void {
    this.visitService.getVisits().subscribe(visits => this.visits = visits);
  }
  loadPayments(): void {
    this.paymentService.getPayments().subscribe(payments => this.payments = payments);
  }

  loadServices(): void {
    this.serviceService.getServices().subscribe(services => {
      this.services = services
    });
  }

  loadClients(): void {
    this.clientService.getClients().subscribe(clients => this.clients = clients);
  }

  getVisitDate(id: number): string {
    return this.visits.find(t => t.id === id)?.visit_date || 'Неизвестно';
  }

  getServiceTitle(id: number): string {
    return this.services.find(t => t.id === id)?.title || 'Неизвестно';
  }

  getClientName(id: number): string {
    return this.clients.find(t => t.id === id)?.username || 'Неизвестно';
  }

  updateFinalPrice(): void {
  if (this.services.length === 0) {
    console.log("Услуг нет");
    return
  }

  const service = this.services.find(s => s.id == this.payment.service_id);

  if (!service) return;

  const basePrice = service.price || 0;
  const quantity = this.payment.quantity || 1;
  const discount = this.payment.discount || 0;

  const total = basePrice * quantity;
  const discountedPrice = total - (total * discount / 100);

  this.payment.final_price = parseFloat(discountedPrice.toFixed(2));
}
  savePayment(): void {
  if (!this.payment.visit_id || !this.payment.service_id) {
    alert('Выберите посещение и услугу перед добавлением.');
    return;
  }
  if (this.editingPayment) {
    this.paymentService.updatePayment(this.payment).subscribe(() => {
      this.loadPayments();
      this.resetForm();
    });
  } else {
    const isDuplicate = this.payments.some(p =>
      p.visit_id === this.payment.visit_id &&
      p.service_id === this.payment.service_id
    );

    if (isDuplicate) {
      alert('Платёж с таким посещением и услугой уже существует.');
      return;
    }

    this.paymentService.addPayment(this.payment as Omit<Payment, 'id'>)
      .subscribe(() => {
        this.loadPayments();
        this.resetForm();
      });
  }
}

  editPayment(payment: Payment): void {
    this.payment = { ...payment };
    this.editingPayment = true;
    this.updateFinalPrice();
  }

  deletePayment(payment: Payment) {
  if (!payment.visit_id) {
    console.error('Payment ID is undefined');
    return;
  }

  this.paymentService.deletePayment(payment.visit_id).subscribe(() => {
    this.loadPayments();
  });
}



  resetForm(): void {
    this.payment = {
      visit_id: 0,
      service_id: 0,
      quantity: 0,
      final_price: 0,
      discount: 0.0,
    };
    this.editingPayment = false;
  }


}
