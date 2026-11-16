import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  paso: 1 | 2 = 1;
  cargando: boolean = false;

  solicitarForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  resetForm = new FormGroup({
    codigo: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6),
    ]),
    nuevaPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  enviarCodigo() {
    if (this.solicitarForm.invalid || this.cargando) return;

    const email = this.solicitarForm.value.email!.trim();
    this.cargando = true;

    this.authService.solicitarCodigoRecuperacion(email).subscribe({
      next: (res) => {
        this.cargando = false;
        this.paso = 2;
        Swal.fire({
          icon: 'success',
          title: 'Código enviado',
          text: res.mensaje || 'Revisa tu bandeja de entrada (o carpeta de spam).',
        });
      },
      error: (err) => {
        this.cargando = false;
        const msg = err?.error?.message || 'No se pudo enviar el código.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: Array.isArray(msg) ? msg[0] : msg,
        });
      },
    });
  }

  cambiarPassword() {
    if (this.resetForm.invalid || this.cargando) return;

    const payload = {
      email: this.solicitarForm.value.email!.trim(),
      codigo: this.resetForm.value.codigo!.trim(),
      nuevaPassword: this.resetForm.value.nuevaPassword!,
    };

    this.cargando = true;

    this.authService.restablecerPassword(payload).subscribe({
      next: (res) => {
        this.cargando = false;
        Swal.fire({
          icon: 'success',
          title: '¡Contraseña actualizada!',
          text: res.mensaje || 'Ya puedes iniciar sesión con tu nueva contraseña.',
        }).then(() => {
          this.router.navigate(['/auth/login']);
        });
      },
      error: (err) => {
        this.cargando = false;
        const msg = err?.error?.message || 'No se pudo restablecer la contraseña.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: Array.isArray(msg) ? msg[0] : msg,
        });
      },
    });
  }
}