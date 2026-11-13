import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './user.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './user.component.css'
})
export class UserComponent {

}
