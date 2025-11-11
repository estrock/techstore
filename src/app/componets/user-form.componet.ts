import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {
  @Input() user: any = null; // Usuario a editar (null para crear nuevo)
  userForm!: FormGroup;
  isEdit = false;
  loading = false;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.isEdit = !!this.user;
    this.initForm();
  }

  initForm() {
    this.userForm = this.fb.group({
      name: [
        this.user?.name || '', 
        [Validators.required, Validators.minLength(2)]
      ],
      email: [
        this.user?.email || '', 
        [Validators.required, Validators.email]
      ],
      phone: [this.user?.phone || ''],
      address: [this.user?.address || ''],
      role: [this.user?.role || 'user', Validators.required],
      status: [this.user?.status || 'active', Validators.required]
    });

    // En modo edición, el email no se puede cambiar
    if (this.isEdit) {
      this.userForm.get('email')?.disable();
    }
  }

  async onSubmit() {
    if (this.userForm.valid && !this.loading) {
      this.loading = true;
      
      const formValue = this.userForm.getRawValue();
      
      try {
        let success = false;
        
        if (this.isEdit && this.user) {
          // Actualizar usuario existente
          success = await this.userService.updateUser(this.user.uid, formValue);
        } else {
          // Crear nuevo usuario
          success = await this.userService.createUser(formValue);
        }
        
        if (success) {
          this.dismiss(true); // Cerrar modal indicando éxito
        }
      } catch (error) {
        console.error('Error en formulario:', error);
      } finally {
        this.loading = false;
      }
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

  dismiss(success = false) {
    this.modalCtrl.dismiss(success);
  }

  // Getters para fácil acceso en el template
  get name() { return this.userForm.get('name'); }
  get email() { return this.userForm.get('email'); }
  get role() { return this.userForm.get('role'); }
  get status() { return this.userForm.get('status'); }
}