import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { UserService } from '../../../core/services/user/user.service';
import { User } from '../../../core/types/User';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  loading = true;
  errorMsg = '';

  actionLoadingId: string | null = null;

  editingUser: User | null = null;
  editForm!: FormGroup;

  defaultAvatar = 'https://placehold.co/100x100.png?text=User';

  constructor(private userService: UserService, private fb: FormBuilder) {
    this.editForm = this.fb.group({
      displayName: [''],
      email: [''],
      phone: [''],
      avatar: [''],
      role: ['customer'],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: () => {
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
        this.users = this.users.map((x) => (x._id === u._id ? updated : x));
        this.actionLoadingId = null;
      },
      error: () => (this.actionLoadingId = null),
    });
  }

  openEdit(u: User): void {
    this.editingUser = u;

    this.editForm.setValue({
      displayName: u.displayName ?? '',
      email: u.email ?? '',
      phone: u.phone ?? '',
      avatar: u.avatar ?? '',
      role: u.role ?? 'customer',
      isActive: !!u.isActive,
    });
  }

  closeEdit(): void {
    this.editingUser = null;
    this.editForm.reset({
      displayName: '',
      email: '',
      phone: '',
      avatar: '',
      role: 'customer',
      isActive: true,
    });
  }

  saveEdit(): void {
    if (!this.editingUser) return;

    const userId = this.editingUser._id;

    const payload = {
      displayName: (this.editForm.value.displayName ?? '').trim(),
      email: (this.editForm.value.email ?? '').trim(),
      phone: (this.editForm.value.phone ?? '').trim(),
      avatar: (this.editForm.value.avatar ?? '').trim(),
      role: this.editForm.value.role,
      isActive: this.editForm.value.isActive,
    };

    this.actionLoadingId = userId;

    this.userService.updateUser(userId, payload).subscribe({
      next: (updated) => {
        this.users = this.users.map((x) => (x._id === userId ? updated : x));
        this.actionLoadingId = null;
        this.closeEdit();
      },
      error: () => (this.actionLoadingId = null),
    });
  }

  getAvatar(u: User): string {
    return (u.avatar ?? '').trim() || this.defaultAvatar;
  }

  onAvatarError(e: Event) {
    (e.target as HTMLImageElement).src = this.defaultAvatar;
  }
}
