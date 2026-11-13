import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-error-message',
  imports: [],
  standalone: true,
  templateUrl: './error-message.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './error-message.component.css'
})
export class ErrorMessageComponent {
  @Input() message:string = ''
}
