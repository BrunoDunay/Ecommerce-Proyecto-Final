import { Component, Input } from '@angular/core';
import { MenuItemComponent, routeItem } from '../menu-item/menu-item.component';


@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [MenuItemComponent],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.css'
})
export class SideMenuComponent {
  @Input() title?:string;
  @Input() navRoutes:routeItem[]=[];
}
