import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user/user.service';
import { User } from '../../../core/types/User';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  loading = true;
  errorMsg = '';

  actionLoadingId: string | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMsg = '';

    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
        this.errorMsg = 'No se pudieron cargar los usuarios';
        this.loading = false;
      },
    });
  }

  trackById(_: number, u: User) {
    return u._id;
  }

  toggleActive(u: User): void {
    this.actionLoadingId = u._id;

    this.userService.toggleUserStatus(u._id).subscribe({
      next: (updated) => {
        // Actualiza en UI sin recargar todo
        this.users = this.users.map((x) => (x._id === u._id ? updated : x));
        this.actionLoadingId = null;
      },
      error: (err) => {
        console.error(err);
        this.actionLoadingId = null;
      },
    });
  }

  defaultAvatar = 'https://placehold.co/100x100.png?text=User';

  getAvatar(u: User): string {
    const avatar = (u.avatar ?? '').trim();
    return avatar.length ? avatar : this.defaultAvatar;
  }

  onAvatarError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultAvatar;
  }

  softDelete(u: User): void {
    if (u.role === 'admin') return;

    const ok = confirm(`¿Seguro que quieres desactivar a "${u.displayName}"?`);
    if (!ok) return;

    this.actionLoadingId = u._id;

    this.userService.softDeleteUser(u._id).subscribe({
      next: () => {
        this.users = this.users.map((x) =>
          x._id === u._id ? { ...x, isActive: false } : x
        );
        this.actionLoadingId = null;
      },
      error: (err) => {
        console.error(err);
        this.actionLoadingId = null;
      },
    });
  }
}
