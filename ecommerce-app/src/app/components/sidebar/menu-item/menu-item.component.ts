import { CommonModule } from '@angular/common';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-menu-item',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './menu-item.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './menu-item.component.css',
})
export class MenuItemComponent {
  @Input() route!: routeItem;
}

export type routeItem = { title: string; route: string; textColor?: string };
