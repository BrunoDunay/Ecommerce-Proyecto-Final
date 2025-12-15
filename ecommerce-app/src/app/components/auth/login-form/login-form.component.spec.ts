import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginFormComponent } from './login-form.component';

import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;

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
      imports: [LoginFormComponent],
      providers: [
        { provide: Store, useValue: storeMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('el formulario debe iniciar inválido', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('debe ser inválido si el email no tiene formato correcto', () => {
    component.loginForm.setValue({
      email: 'correo-malo',
      password: '123456',
    });

    expect(component.loginForm.invalid).toBeTrue();
    expect(component.loginForm.get('email')?.valid).toBeFalse();
  });

  it('debe ser inválido si el password está vacío', () => {
    component.loginForm.setValue({
      email: 'a@a.com',
      password: '',
    });

    expect(component.loginForm.invalid).toBeTrue();
    expect(component.loginForm.get('password')?.hasError('required')).toBeTrue();
  });

  it('debe ser válido con email y password correctos', () => {
    component.loginForm.setValue({
      email: 'a@a.com',
      password: '123456',
    });

    expect(component.loginForm.valid).toBeTrue();
  });
});
