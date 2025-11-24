import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '../../../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { DialogService } from '../../../../core/services/dialog.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  public users$!: Observable<any>;
  public errorMsg: string | null = null;
  public userType: string | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.userType = this.authService.getUserType();
    this.loadUsers();
  }

  loadUsers(): void {
    this.users$ = this.userService.getListaUsuarios();
  }

  onDelete(id: number): void {
    const dialogData = {
      title: 'Confirmar Eliminación',
      message: 'Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este usuario?',
      confirmText: 'Sí, Eliminar',
      type: 'confirm' as const
    };

    this.dialogService.open(dialogData).subscribe(confirmed => {
      if (confirmed) {
        this.userService.deleteUser(id).subscribe({
          next: (response) => {
            if (response.status === 'success') {
              this.loadUsers();
            } else {
              this.dialogService.open({ 
                title: 'Error al Eliminar', 
                message: response.msg,
                type: 'alert'
              });
            }
          },
          error: (err) => {
            console.error(err);
            this.dialogService.open({ 
              title: 'Error de Conexión', 
              message: 'No se pudo completar la acción.',
              type: 'alert'
            });
          }
        });
      }
    });
  }

  canCreate(): boolean {
    return this.userType === 'admin' || this.userType === 'ejecutivo';
  }

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
