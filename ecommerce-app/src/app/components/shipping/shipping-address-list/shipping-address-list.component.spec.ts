import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingAddressListComponent } from './shipping-address-list.component';

describe('ShippingAddressListComponent', () => {
  let component: ShippingAddressListComponent;
  let fixture: ComponentFixture<ShippingAddressListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingAddressListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShippingAddressListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
