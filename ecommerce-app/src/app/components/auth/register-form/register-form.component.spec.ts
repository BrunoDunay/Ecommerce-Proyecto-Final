import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterFormComponent } from './register-form.component';

import { AuthService } from '../../../core/services/auth/auth.service'; // ajusta si cambia tu ruta
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('RegisterFormComponent', () => {
  let component: RegisterFormComponent;
  let fixture: ComponentFixture<RegisterFormComponent>;

  const authServiceMock: Partial<AuthService> = {};

  const storeMock = {
    dispatch: jasmine.createSpy('dispatch'),
    select: jasmine.createSpy('select'),
  };

  const activatedRouteMock = {
    snapshot: {
      paramMap: {
        get: (_: string) => null,
      },
      queryParamMap: {
        get: (_: string) => null,
      },
    },
    params: of({}),
    queryParams: of({}),
    paramMap: of(new Map()),
    queryParamMap: of(new Map()),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterFormComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Store, useValue: storeMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('el formulario debe iniciar inválido', () => {
    expect(component.registerForm.valid).toBeFalse();
  });

  it('debe ser inválido si el email tiene formato incorrecto', () => {
    component.registerForm.patchValue({ email: 'correo-malo' });
    expect(component.registerForm.get('email')?.valid).toBeFalse();
  });

  it('phoneValidator debe marcar inválido si no tiene 10 dígitos', () => {
    component.registerForm.patchValue({ phone: '123' });
    expect(component.registerForm.get('phone')?.valid).toBeFalse();
  });

  it('debe marcar error cuando las contraseñas no coinciden', () => {
    component.registerForm.patchValue({
      password: '123456',
      repeatPassword: '000000',
    });

    expect(component.registerForm.hasError('doesnt_match')).toBeTrue();
  });
});
