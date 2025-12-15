import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { ToastService } from '../../services/toast/toast.service';
import { catchError, of } from 'rxjs';
import { User } from '../../types/User';

export const userResolver: ResolveFn<User | null> = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  return userService.getMyProfile().pipe(
    catchError((error) => {
      console.log(error);
      toastService.error('No se pudieron cargar los datos del usuario');
      router.navigateByUrl('/');
      return of(null);
    })
  );
};
