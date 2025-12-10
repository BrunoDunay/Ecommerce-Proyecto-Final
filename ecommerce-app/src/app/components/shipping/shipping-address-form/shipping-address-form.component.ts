import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ShippingAddress } from '../../../core/types/ShippingAddress';
import { FormFieldComponent } from '../../shared/form-field/form-field.component';
import { FormErrorService } from '../../../core/services/validation/form-error.service';

@Component({
  selector: 'app-shipping-address-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent],
  templateUrl: './shipping-address-form.component.html',
  styleUrl: './shipping-address-form.component.css',
})
export class ShippingAddressFormComponent implements OnChanges {
  @Input() address: ShippingAddress | null = null;
  @Input() isEditMode: boolean = false;
  @Output() addressSaved = new EventEmitter<ShippingAddress>();

  addressForm: FormGroup;

  private formErrorService = inject(FormErrorService);

  constructor(private fb: FormBuilder) {
    this.addressForm = this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['address']) {
      if (this.address) {
        this.addressForm.patchValue(this.address);
      } else {
        this.addressForm.reset({
          country: 'México',
          addressType: 'home',
          isDefault: false,
        });
      }
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      postalCode: ['', [Validators.required, Validators.minLength(4)]],
      country: ['México', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
      isDefault: [false],
      addressType: ['home'],
    });
  }

  getFieldError(fieldName: string): string {
    const labels = {
      name: 'Nombre',
      address: 'Dirección',
      city: 'Ciudad',
      state: 'Estado',
      postalCode: 'Código postal',
      country: 'País',
      phone: 'Teléfono',
    };
    return this.formErrorService.getFieldError(this.addressForm, fieldName, labels);
  }

  onSubmit(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    const form = this.addressForm.value;

    const data: ShippingAddress = {
      _id: this.address?._id ?? '',
      name: form.name,
      address: form.address,
      city: form.city,
      state: form.state,
      postalCode: form.postalCode,
      country: form.country,
      phone: form.phone,
      isDefault: form.isDefault,
      addressType: form.addressType,
    };

    this.addressSaved.emit(data);
  }
}
