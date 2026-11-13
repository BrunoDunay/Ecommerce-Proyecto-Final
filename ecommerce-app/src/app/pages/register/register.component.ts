import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RegisterFormComponent } from "../../components/auth/register-form/register-form.component";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RegisterFormComponent],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './register.component.css'
})
export class RegisterComponent {

}
