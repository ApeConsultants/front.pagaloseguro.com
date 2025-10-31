import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '../../../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  public users$!: Observable<any>;
  public errorMsg: string | null = null;
  public userType: string | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userType = this.authService.getUserType();
    this.loadUsers();
  }

  loadUsers(): void {
    this.users$ = this.userService.getUsers();
  }

  onDelete(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.userService.deleteUser(id).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            alert('Usuario eliminado correctamente.');
            this.loadUsers();
          } else {
            alert(`Error al eliminar: ${response.msg}`);
          }
        },
        error: (err) => {
          console.error(err);
          alert('Error de conexión al eliminar el usuario.');
        }
      });
    }
  }

  canCreate(): boolean {
    return this.userType === 'admin' || this.userType === 'ejecutivo';
  }

  /**
   *
   * @param userToEditTipo
   */
  canEdit(userToEditTipo: number): boolean {
    if (this.userType === 'admin') {
      return true;
    }
    if (this.userType === 'ejecutivo' && userToEditTipo === 3) {
      return true;
    }
    return false;
  }

  canDelete(): boolean {
    return this.userType === 'admin';
  }
}
