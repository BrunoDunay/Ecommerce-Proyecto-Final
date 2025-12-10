import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ShippingAddress } from '../../../core/types/ShippingAddress';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-shipping-address-card',
  standalone: true,
  imports: [NgIf, CommonModule],
  templateUrl: './shipping-address-card.component.html',
  styleUrl: './shipping-address-card.component.css',
})
export class ShippingAddressCardComponent {
  @Input() address!: ShippingAddress;
  @Input() isEditable: boolean = false;
  @Input() isSelectable: boolean = false;
  @Input() isSelected: boolean = false;

  @Output() edit = new EventEmitter<ShippingAddress>();
  @Output() delete = new EventEmitter<string>();
  @Output() select = new EventEmitter<string>();
  @Output() setDefault = new EventEmitter<string>();

  onEditClick(event: Event) {
    event.stopPropagation();
    this.edit.emit(this.address);
  }

  onDeleteClick(event: Event) {
    event.stopPropagation();
    this.delete.emit(this.address._id);
  }

  onSetDefaultClick(event: Event) {
    event.stopPropagation();
    this.setDefault.emit(this.address._id);
  }

  onCardClick() {
    if (this.isSelectable) {
      this.select.emit(this.address._id);
    }
  }
}
