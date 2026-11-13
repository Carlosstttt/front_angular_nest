import { Component, OnInit, inject } from '@angular/core';
import { CategoriaService } from '../../services/categoria.service';

interface Categoria {
  id?: number;
  nombre: string;
  descripcion?: string;
}

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.scss'
})

export class CategoriaComponent implements OnInit {

  private categoriaService = inject(CategoriaService)

  categorias: Categoria[] = []
  visible: boolean = false
  nombre: string = '';
  descripcion: string = '';


  ngOnInit(): void {
    this.getCategorias()
  }

  getCategorias() {
    this.categoriaService.funListar().subscribe(
      (res:any)=> {
        console.log(res)
        this.categorias = res
      },
      (err:any)=> {
        console.log(err)
      }
    )

  }

  showDialog() {
    this.visible = true

  }

  guardarCategoria() {
    const nuevaCategoria = {
      nombre: this.nombre,
      descripcion: this.descripcion
    };

    this.categoriaService.funGuardar(nuevaCategoria).subscribe(
      (res: any) => {
        console.log('Categoría guardada:', res);
        this.visible = false;      // Cierra el modal
        this.nombre = '';          // Limpia el campo nombre
        this.descripcion = '';     // Limpia el campo descripción
        this.getCategorias();      // Recarga la tabla con el nuevo registro
      },
      (err: any) => {
        console.error('Error al guardar:', err);
      }
    );
  }

}
