import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Auth } from './auth';
import { take, map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (): Observable<boolean> => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.isAuthenticated.pipe(
    take(1),
    map((isAuthenticated) => {
      if (!isAuthenticated) {
        router.navigateByUrl('/login');
        return false;
      }
      return true;
    })
  );
};
