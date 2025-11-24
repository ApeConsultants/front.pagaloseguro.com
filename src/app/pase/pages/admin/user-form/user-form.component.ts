import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { CatalogService } from '../../../../core/services/catalog.service';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap, tap, catchError, filter, take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit, OnDestroy {

  userForm: FormGroup;
  isEditMode: boolean = false;
  private userId: string | null = null;
  public errorMessage: string | null = null;
  public isLoading: boolean = false;
  private ngUnsubscribe = new Subject<void>();
  public tiposUsuario$!: Observable<any>;
  public colonias$ = new BehaviorSubject<any>(null);
  public isLoadingColonias: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private catalogService: CatalogService,
    private router: Router,
    private route: ActivatedRoute
  ) {

    this.userForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      correo: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      tipoUsuario: [null, [Validators.required]],
      genero: ['M', [Validators.required]],
      telefono: [''],
      
      // Campos de dirección
      cp: [''],
      colonia: [null, [Validators.required]],
      municipio: [{ value: '', disabled: true }],
      estado: [{ value: '', disabled: true }],

      // Otros campos
      fechaNacimiento: [''],
      direccion: [''],
      rfc: ['']
    });
  }

ngOnInit(): void {
    this.loadCatalogos();
    this.listenCPChanges();
    this.userId = this.route.snapshot.paramMap.get('id');

    if (this.userId) {
      this.isEditMode = true;
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
      this.userForm.get('colonia')?.clearValidators();
      this.userForm.get('colonia')?.updateValueAndValidity();

      this.loadUserData();
    } else {
      this.userForm.get('correo')?.enable();
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadCatalogos(): void {
    this.tiposUsuario$ = this.catalogService.getTipoUsuarios();
  }

  listenCPChanges(): void {
    const cpControl = this.userForm.get('cp');
    if (!cpControl) return;

    cpControl.valueChanges.pipe(
      takeUntil(this.ngUnsubscribe),
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => {
        this.isLoadingColonias = true;
        this.userForm.get('colonia')?.setValue(null);
        this.userForm.get('municipio')?.setValue('');
        this.userForm.get('estado')?.setValue('');
        this.colonias$.next(null);
      }),
      switchMap(cp => {
        if (cp && cp.length === 5) {
          return this.catalogService.getColoniasByCP(cp).pipe(
            catchError(err => {
              this.errorMessage = 'Error al buscar CP. Verifique e intente de nuevo.';
              return of(null);
            })
          );
        } else {
          return of(null);
        }
      })
    ).subscribe(response => {
      this.isLoadingColonias = false;
      if (response && response.status === 'success' && response.data.length > 0) {
        this.colonias$.next(response); 
        this.userForm.get('municipio')?.setValue(response.data[0].municipio);
        this.userForm.get('estado')?.setValue(response.data[0].estado);
      } else {
        this.colonias$.next(null);
      }
    });
  }

  loadUserData(): void {
    if (!this.userId) return;
    
    this.userService.getUserById(this.userId).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          const userData = {
            ...response.data,
            idUsuario: response.data.id,
            tipoUsuario: response.data.tipo 
          };
          this.userForm.patchValue(userData);

          if (response.data.cp) {
            this.userForm.get('cp')?.setValue(response.data.cp, { emitEvent: true }); 
            this.colonias$.pipe(
              filter(res => res !== null),
              take(1)
            ).subscribe(() => {
              this.userForm.get('colonia')?.setValue(response.data.colonia);
            });
          }
        } else {
          this.errorMessage = response.msg;
        }
      },
      error: (err) => this.errorMessage = 'Error al cargar datos del usuario.'
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    if (this.isEditMode) {
      const formData = { ...this.userForm.value, idUsuario: this.userId };
      
      if (!formData.password) {
        delete formData.password;
      }

      this.userService.updateUser(formData).subscribe({
        next: this.handleResponse,
        error: this.handleError
      });
    } else {
      this.userService.createUser(this.userForm.value).subscribe({
        next: this.handleResponse,
        error: this.handleError
      });
    }
  }

  // === Helpers para manejar respuesta ===
  private handleResponse = (response: any) => {
    this.isLoading = false;
    if (response.status === 'success') {
      alert(`Usuario ${this.isEditMode ? 'actualizado' : 'creado'} con éxito.`);
      this.router.navigate(['/pase/usuarios']);
    } else {
      this.errorMessage = response.msg;
    }
  }

  private handleError = (err: any) => {
    this.isLoading = false;
    this.errorMessage = 'Error de conexión con el servidor.';
    console.error(err);
  }
}
