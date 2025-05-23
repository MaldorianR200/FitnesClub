import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../../../entities/payments/model/api/payment.service';
import { ServiceService } from '../../../entities/service/model/api/service.service';
import { BaseChartDirective  } from 'ng2-charts';
import { Payment } from '../../../entities/payments/model/types/payment';
import { Service } from '../../../entities/service/model/types/service';
import { VisitService } from '../../../entities/visit/model/api/visits.service';
import { Visit } from '../../../entities/visit/model/types/visit';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective ],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  // Финансовая статистика
  monthlyRevenueData: any = {};
  weeklyRevenueData: any = {};
  serviceRevenueData: any = {};
  paymentDistributionData: any = {};

  // Статистика по услугам
  popularServicesData: any = {};
  servicesRatioData: any = {};
  demandDynamicsData: any = {};

  services: Service[] = [];
  payments: Payment[] = [];
  visits: Visit[] = [];

  // Настройки для диаграмм
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        mode: 'index' as const, // Явно указываем тип
        intersect: false,
      },
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Количество продаж'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Месяц/Год'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'nearest' as const // Явно указываем тип
    }
  };


  constructor(
    private paymentService: PaymentService,
    private serviceService: ServiceService,
    private visitService: VisitService
  ) {}

  ngOnInit(): void {
    this.loadServices();
    this.loadPayments();
    this.loadVisits();
  }

  loadServices(): void {
    this.serviceService.getServices().subscribe(services => {
      this.services = services;
      this.processStatistics();
    });
  }

  loadPayments(): void {
    this.paymentService.getPayments().subscribe(payments => {
      this.payments = payments;
      this.processStatistics();
    });
  }

  loadVisits(): void {
    this.visitService.getVisits().subscribe(visits => {
      this.visits = visits;
      this.loadPayments(); // <--- затем платежи
    });
  }

  processStatistics(): void {
    if (this.services.length === 0 || this.payments.length === 0) return;

    this.prepareMonthlyRevenueData();
    this.prepareWeeklyRevenueData();
    this.prepareServiceRevenueData();
    this.preparePaymentDistributionData();
    this.preparePopularServicesData();
    this.prepareServicesRatioData();
    this.prepareDemandDynamicsData();
  }

  getVisitDate(payment: Payment): Date {
    const visit = this.visits.find(v => v.id === payment.visit_id);
    return visit ? new Date(visit.visit_date) : new Date();
  }

  prepareMonthlyRevenueData(): void {
    const monthlyRevenue = this.payments.reduce((acc, payment) => {
      const date = this.getVisitDate(payment);
      const monthYear = `${date.getMonth()+1}/${date.getFullYear()}`;

      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear] += payment.final_price;

      return acc;
    }, {} as Record<string, number>);

    this.monthlyRevenueData = {
      labels: Object.keys(monthlyRevenue),
      datasets: [{
        label: 'Выручка по месяцам',
        data: Object.values(monthlyRevenue),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };
  }

  prepareWeeklyRevenueData(): void {
    const weeklyRevenue = this.payments.reduce((acc, payment) => {
      const date = this.getVisitDate(payment);
      const weekNumber = this.getWeekNumber(date);
      const weekYear = `Неделя ${weekNumber}/${date.getFullYear()}`;

      if (!acc[weekYear]) {
        acc[weekYear] = 0;
      }
      acc[weekYear] += payment.final_price;

      return acc;
    }, {} as Record<string, number>);

    this.weeklyRevenueData = {
      labels: Object.keys(weeklyRevenue),
      datasets: [{
        label: 'Выручка по неделям',
        data: Object.values(weeklyRevenue),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };
  }

  prepareServiceRevenueData(): void {
    const serviceRevenue = this.payments.reduce((acc, payment) => {
      const service = this.services.find(s => s.id === payment.service_id);
      const serviceName = service?.title || 'Неизвестная услуга';

      if (!acc[serviceName]) {
        acc[serviceName] = 0;
      }
      acc[serviceName] += payment.final_price;

      return acc;
    }, {} as Record<string, number>);

    this.serviceRevenueData = {
      labels: Object.keys(serviceRevenue),
      datasets: [{
        label: 'Доход по услугам',
        data: Object.values(serviceRevenue),
        backgroundColor: Object.keys(serviceRevenue).map(
          (_, i) => this.getRandomColor(i)
        ),
        borderWidth: 1
      }]
    };
  }


  preparePaymentDistributionData(): void {
    const paymentRanges = {
      '0-500': 0,
      '500-1000': 0,
      '1000-2000': 0,
      '2000-5000': 0,
      '5000+': 0
    };

    this.payments.forEach(payment => {
      const amount = payment.final_price;
      if (amount <= 500) paymentRanges['0-500']++;
      else if (amount <= 1000) paymentRanges['500-1000']++;
      else if (amount <= 2000) paymentRanges['1000-2000']++;
      else if (amount <= 5000) paymentRanges['2000-5000']++;
      else paymentRanges['5000+']++;
    });

    this.paymentDistributionData = {
      labels: Object.keys(paymentRanges),
      datasets: [{
        label: 'Распределение платежей',
        data: Object.values(paymentRanges),
        backgroundColor: 'rgba(255, 159, 64, 0.7)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1
      }]
    };
  }

  preparePopularServicesData(): void {
    const serviceCounts = this.payments.reduce((acc, payment) => {
      const service = this.services.find(s => s.id === payment.service_id);
      const serviceName = service?.title || 'Неизвестная услуга';

      if (!acc[serviceName]) {
        acc[serviceName] = 0;
      }
      acc[serviceName] += payment.quantity;

      return acc;
    }, {} as Record<string, number>);

    // Сортируем по популярности и берем топ-5
    const sortedServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    this.popularServicesData = {
      labels: sortedServices.map(s => s[0]),
      datasets: [{
        label: 'Топ услуг по количеству продаж',
        data: sortedServices.map(s => s[1]),
        backgroundColor: sortedServices.map(
          (_, i) => this.getRandomColor(i)
        ),
        borderWidth: 1
      }]
    };
  }



// Добавляем вспомогательный метод для получения названия месяца
private getMonthName(monthIndex: number): string {
  const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  return months[monthIndex];
}

  prepareServicesRatioData(): void {
    const serviceCounts = this.payments.reduce((acc, payment) => {
      const service = this.services.find(s => s.id === payment.service_id);
      const serviceName = service?.title || 'Неизвестная услуга';

      if (!acc[serviceName]) {
        acc[serviceName] = 0;
      }
      acc[serviceName] += payment.quantity;

      return acc;
    }, {} as Record<string, number>);

    this.servicesRatioData = {
      labels: Object.keys(serviceCounts),
      datasets: [{
        data: Object.values(serviceCounts),
        backgroundColor: Object.keys(serviceCounts).map(
          (_, i) => this.getRandomColor(i)
        ),
        borderWidth: 1
      }]
    };
  }

 // Обновляем метод подготовки данных
prepareDemandDynamicsData(): void {
  const monthlyServiceDemand = this.services.reduce((acc, service) => {
    acc[service.title] = this.payments.reduce((monthly, payment) => {
      if (payment.service_id === service.id) {
        const date = this.getVisitDate(payment);
        const monthYear = `${this.getMonthName(date.getMonth())} ${date.getFullYear()}`;

        if (!monthly[monthYear]) {
          monthly[monthYear] = 0;
        }
        monthly[monthYear] += payment.quantity;
      }
      return monthly;
    }, {} as Record<string, number>);
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const allMonths = Array.from(new Set(
    this.payments.map(payment => {
      const date = this.getVisitDate(payment);
      return `${this.getMonthName(date.getMonth())} ${date.getFullYear()}`;
    })
  )).sort((a, b) => {
    // Сортируем месяцы в хронологическом порядке
    const [monthA, yearA] = a.split(' ');
    const [monthB, yearB] = b.split(' ');
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                   'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    if (yearA !== yearB) return +yearA - +yearB;
    return months.indexOf(monthA) - months.indexOf(monthB);
  });

  // Ограничиваем количество линий для лучшей читаемости
  const topServices = Object.entries(monthlyServiceDemand)
    .sort((a, b) => {
      const totalA = Object.values(a[1]).reduce((sum, val) => sum + val, 0);
      const totalB = Object.values(b[1]).reduce((sum, val) => sum + val, 0);
      return totalB - totalA;
    })
    .slice(0, 8); // Показываем только топ-8 услуг

  const datasets = topServices.map(([service, data]) => {
    return {
      label: service,
      data: allMonths.map(month => data[month] || 0),
      borderColor: this.getRandomColor(topServices.findIndex(s => s[0] === service)),
      backgroundColor: 'rgba(0,0,0,0)',
      tension: 0.3,
      fill: false,
      pointBackgroundColor: '#fff',
      pointBorderWidth: 2,
      pointHoverRadius: 5,
      pointHoverBorderWidth: 2
    };
  });

  this.demandDynamicsData = {
    labels: allMonths,
    datasets: datasets
  };
}

  // Вспомогательные методы
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private getRandomColor(index: number): string {
    const colors = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(199, 199, 199, 0.7)',
      'rgba(83, 102, 255, 0.7)',
      'rgba(40, 159, 64, 0.7)',
      'rgba(210, 99, 132, 0.7)'
    ];
    return colors[index % colors.length];
  }
}
