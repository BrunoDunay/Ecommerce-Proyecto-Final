import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './thank-you.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './thank-you.component.css'
})
export class ThankYouComponent {

}
