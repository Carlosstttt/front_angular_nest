import { Component, OnInit, inject } from '@angular/core';
import { CategoriaService } from '../../services/categoria.service';
import Swal from 'sweetalert2';

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
}

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.scss'
})
export class CategoriaComponent implements OnInit {

  private categoriaService = inject(CategoriaService);

  categorias: Categoria[] = [];
  visible: boolean = false;
  nombre: string = '';
  descripcion: string = '';
  categoria_id: number = -1;

  ngOnInit(): void {
    this.getCategorias();
  }

  getCategorias() {
    this.categoriaService.funListar().subscribe(
      (res: any) => {
        this.categorias = res;
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  showDialog() {
    this.categoria_id = -1;
    this.nombre = '';
    this.descripcion = '';
    this.visible = true;
  }

  cerrarDialog() {
    this.visible = false;
    this.categoria_id = -1;
    this.nombre = '';
    this.descripcion = '';
  }

  guardarCategoria() {
    const datosCategoria = {
      nombre: this.nombre,
      descripcion: this.descripcion
    };

    if (this.categoria_id > 0) {
      this.categoriaService.funModificar(this.categoria_id, datosCategoria).subscribe(
        (res: any) => {
          this.visible = false;
          this.getCategorias();
          this.categoria_id = -1;
          this.nombre = '';
          this.descripcion = '';
          this.alerta('ACTUALIZADO', 'La categoría se modificó con éxito!', 'success');
        },
        (err: any) => {
          this.alerta('ERROR AL ACTUALIZAR', 'Verifica los datos!', 'error');
        }
      );
    } else {
      this.categoriaService.funGuardar(datosCategoria).subscribe(
        (res: any) => {
          this.visible = false;
          this.getCategorias();
          this.nombre = '';
          this.descripcion = '';
          this.alerta('REGISTRADO', 'La categoría se creó con éxito!', 'success');
        },
        (err: any) => {
          this.alerta('ERROR AL REGISTRAR', 'Verifica los datos!', 'error');
        }
      );
    }
  }

  editarCategoria(cat: Categoria) {
    this.visible = true;
    this.categoria_id = cat.id;
    this.nombre = cat.nombre;
    this.descripcion = cat.descripcion;
  }

  eliminarCategoria(cat: Categoria) {
    Swal.fire({
      title: '¿Está seguro de eliminar la categoría?',
      text: 'Una vez eliminado no se podrá recuperar!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoriaService.funEliminar(cat.id).subscribe(
          (res: any) => {
            this.alerta('ELIMINADO!', 'Categoría eliminada.', 'success');
            this.getCategorias();
            this.categoria_id = -1;
          },
          (err: any) => {
            this.alerta('ERROR!', 'Error al intentar eliminar.', 'error');
          }
        );
      }
    });
  }

  alerta(title: string, text: string, icon: 'success' | 'error' | 'info' | 'question') {
    Swal.fire({ title, text, icon });
  }
}