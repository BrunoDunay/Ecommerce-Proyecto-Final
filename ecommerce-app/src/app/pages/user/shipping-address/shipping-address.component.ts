import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ShippingAddress } from '../../../core/types/ShippingAddress';
import { ShippingAddressService } from '../../../core/services/shippingAddress/shipping-address.service';
import { Observable, of } from 'rxjs';
import { ShippingAddressListComponent } from '../../../components/shipping/shipping-address-list/shipping-address-list.component';
import { ShippingAddressFormComponent } from '../../../components/shipping/shipping-address-form/shipping-address-form.component';

@Component({
  selector: 'app-shipping-address',
  standalone: true,
  imports: [AsyncPipe, ShippingAddressListComponent, ShippingAddressFormComponent],
  templateUrl: './shipping-address.component.html',
  styleUrl: './shipping-address.component.css',
})
export class ShippingAddressComponent implements OnInit {
  addresses$: Observable<ShippingAddress[]> = of([]);
  selectedAddress: ShippingAddress | null = null;
  isEditing = false;

  constructor(private shippingService: ShippingAddressService) {}

  ngOnInit(): void {
    this.addresses$ = this.shippingService.addresses$;
    this.shippingService.loadAddresses();
  }

  onAddNew() {
    this.selectedAddress = null;
    this.isEditing = false;
  }

  onEdit(addr: ShippingAddress) {
    this.selectedAddress = addr;
    this.isEditing = true;
  }

  onDelete(id: string) {
    if (confirm('¿Eliminar esta dirección?')) {
      this.shippingService.deleteAddress(id).subscribe();
    }
  }

  onSetDefault(id: string) {
    this.shippingService.setDefault(id).subscribe();
  }

  onAddressSaved(payload: ShippingAddress) {
    if (this.isEditing) {
      this.shippingService.editAddress(payload).subscribe(() => this.onAddNew());
    } else {
      this.shippingService.addAddress(payload).subscribe(() => this.onAddNew());
    }
  }
}
