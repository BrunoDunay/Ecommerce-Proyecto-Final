import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ShippingAddress } from '../../../core/types/ShippingAddress';
import { ShippingAddressCardComponent } from '../shipping-address-card/shipping-address-card.component';

@Component({
  selector: 'app-shipping-address-list',
  standalone: true,
  imports: [ShippingAddressCardComponent],
  templateUrl: './shipping-address-list.component.html',
  styleUrl: './shipping-address-list.component.css',
})
export class ShippingAddressListComponent {
  @Input() addresses: ShippingAddress[] = [];
  @Input() isEditable: boolean = false;
  @Input() isSelectable: boolean = false;
  @Input() selectedId: string | null = null;

  @Output() edit = new EventEmitter<ShippingAddress>();
  @Output() delete = new EventEmitter<string>();
  @Output() select = new EventEmitter<string>();
  @Output() setDefault = new EventEmitter<string>();

  onEdit(addr: ShippingAddress) {
    this.edit.emit(addr);
  }

  onDelete(id: string) {
    this.delete.emit(id);
  }

  onSelect(id: string) {
    this.select.emit(id);
  }

  onSetDefault(id: string) {
    this.setDefault.emit(id);
  }
}
