import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user/user.service'; 
import { User } from '../../../core/types/User';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html'
})
export class AdminUsersComponent implements OnInit {

  users: User[] = [];
  loading = true;
  errorMsg = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
        this.errorMsg = 'No se pudieron cargar los usuarios';
        this.loading = false;
      }
    });
  }
}
