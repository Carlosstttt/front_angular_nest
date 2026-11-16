import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

function cedulaEcuatorianaValidator(control: AbstractControl): ValidationErrors | null {
  const valor = (control.value || '').trim();
  if (!valor) return null;

  if (!/^\d{10}$/.test(valor)) {
    return { cedulaInvalida: 'La cédula debe tener exactamente 10 dígitos numéricos' };
  }

  const provincia = parseInt(valor.substring(0, 2), 10);
  const tercerDigito = parseInt(valor[2], 10);
  if (provincia < 1 || provincia > 24 || tercerDigito >= 6) {
    return { cedulaInvalida: 'El número de cédula no es válido' };
  }

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let mult = parseInt(valor[i], 10) * coeficientes[i];
    if (mult >= 10) mult -= 9;
    suma += mult;
  }
  const digitoVerificador = suma % 10 === 0 ? 0 : 10 - (suma % 10);

  if (digitoVerificador !== parseInt(valor[9], 10)) {
    return { cedulaInvalida: 'El dígito verificador de la cédula es incorrecto' };
  }

  return null;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm = new FormGroup({
    nombres: new FormControl('', [Validators.required]),
    apellidos: new FormControl('', [Validators.required]),
    identificacion: new FormControl('', [Validators.required, cedulaEcuatorianaValidator]),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefono: new FormControl(''),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  funRegistrar() {
    if (this.registerForm.invalid) return;

    this.authService.registerConNest(this.registerForm.value).subscribe(
      () => {
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: 'Ahora puedes iniciar sesión con tu correo o número de cédula.',
        }).then(() => {
          this.router.navigate(['/auth/login']);
        });
      },
      (error: any) => {
        const msg = error?.error?.message || 'No se pudo completar el registro.';
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: Array.isArray(msg) ? msg[0] : msg,
        });
      },
    );
  }
}