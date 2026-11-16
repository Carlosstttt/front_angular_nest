import { Component, OnDestroy, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

// Validador personalizado: acepta correo válido O cédula ecuatoriana válida de 10 dígitos
function emailOCedulaValidator(control: AbstractControl): ValidationErrors | null {
  const valor = (control.value || '').trim();
  if (!valor) return null;

  // Caso 1: Si son solo números, validamos como Cédula Ecuatoriana
  if (/^\d+$/.test(valor)) {
    if (valor.length !== 10) {
      return { cedulaInvalida: 'La cédula debe tener exactamente 10 dígitos' };
    }

    const provincia = parseInt(valor.substring(0, 2), 10);
    const tercerDigito = parseInt(valor[2], 10);

    if (provincia < 1 || provincia > 24 || tercerDigito >= 6) {
      return { cedulaInvalida: 'El número de cédula no es válido' };
    }

    // Algoritmo módulo 10 del Registro Civil
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

    return null; // Cédula válida
  }

  // Caso 2: Si contiene letras o @, validamos como Correo Electrónico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(valor)) {
    return { emailInvalido: 'Ingresa un correo electrónico o cédula válida' };
  }

  return null; // Correo válido
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  bloqueado: boolean = false;
  segundosRestantes: number = 0;
  private intervaloBloqueo: any = null;

  loginForm = new FormGroup({
    identificador: new FormControl('', [Validators.required, emailOCedulaValidator]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  funIngresar() {
    if (this.loginForm.invalid || this.bloqueado) return;

    this.authService.loginConNest(this.loginForm.value).subscribe(
      (res: any) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        Swal.fire({
          icon: 'success',
          title: 'Bienvenido',
          text: `Hola ${res.usuario?.nombre || ''}`,
          timer: 1500,
          showConfirmButton: false,
        });
        this.router.navigate(['/admin']);
      },
      (error: any) => {
        const mensajeBackend =
          error?.error?.message || 'Error al iniciar sesión. Verifica tus datos.';

        // Si el backend devuelve 429 (Too Many Requests), activamos el bloqueo con cuenta regresiva
        if (error.status === 429 && error?.error?.segundosRestantes) {
          this.iniciarCuentaRegresiva(error.error.segundosRestantes);
          Swal.fire({
            icon: 'error',
            title: 'Acceso bloqueado temporalmente',
            text: `Superaste el límite de intentos. Podrás reintentar en ${error.error.segundosRestantes} segundos.`,
          });
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'No se pudo ingresar',
            text: Array.isArray(mensajeBackend) ? mensajeBackend[0] : mensajeBackend,
          });
        }
      },
    );
  }

  private iniciarCuentaRegresiva(segundos: number) {
    this.bloqueado = true;
    this.segundosRestantes = segundos;

    if (this.intervaloBloqueo) {
      clearInterval(this.intervaloBloqueo);
    }

    this.intervaloBloqueo = setInterval(() => {
      this.segundosRestantes--;
      if (this.segundosRestantes <= 0) {
        this.bloqueado = false;
        clearInterval(this.intervaloBloqueo);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervaloBloqueo) {
      clearInterval(this.intervaloBloqueo);
    }
  }
}