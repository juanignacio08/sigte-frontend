import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  imports: [CommonModule],
  selector: 'app-stat-card',
  styleUrl: './stat-card.component.css',
  templateUrl: './stat-card.component.html',
})
export class StatCardComponent {
  title = input.required<string>();
  value = input.required<number | string>();
  icon = input<string>('pi pi-chart-bar');
  iconBgColor = input<string>('bg-indigo-50 text-indigo-600');
  badgeText = input<string>('');
  badgeColor = input<string>('bg-emerald-100 text-emerald-800');
  subtitle = input<string>('');
  footerText = input<string>('');
}
