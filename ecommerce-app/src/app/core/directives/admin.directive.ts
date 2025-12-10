import {
  Directive,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { selectIsAdmin } from '../store/auth/auth.selectors';
import { Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[appAdmin]',
  standalone: true,
})
export class AdminDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private hasView = false;

  constructor(
    private store: Store,
    private viewContainer: ViewContainerRef,
    private templateRef: TemplateRef<any>
  ) {}

  ngOnInit(): void {
    this.store
      .select(selectIsAdmin)
      .pipe(takeUntil(this.destroy$))
      .subscribe((isAdmin) => {
        if (isAdmin && !this.hasView) {
          this.viewContainer.createEmbeddedView(this.templateRef);
          this.hasView = true;
        }
        if (!isAdmin && this.hasView) {
          this.viewContainer.clear();
          this.hasView = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
