import { Component } from '@angular/core';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.scss'
})
export class ProductoComponent {

  products: any[] = [
    { id: 1, nombre: 'Teclado', precio: 394.96, categoria_id: 5, stock: 12, estado: 'INSTOCK' },
    { id: 2, nombre: 'Mouse Gamer', precio: 45.50, categoria_id: 5, stock: 25, estado: 'INSTOCK' },
    { id: 3, nombre: 'Monitor 24"', precio: 180.00, categoria_id: 5, stock: 8, estado: 'LOWSTOCK' }
  ];

  cols: any[] = [
    { field: 'id', header: 'Id' },
    { field: 'nombre', header: 'Nombre' },
    { field: 'precio', header: 'Precio' },
    { field: 'categoria_id', header: 'Categoria' },
    { field: 'stock', header: 'Stock' }
  ];

  openNew() {
    console.log('Abrir nuevo producto');
  }

  editProduct(prod: any) {
    console.log('Editar producto:', prod);
  }

  deleteProduct(prod: any) {
    console.log('Eliminar producto:', prod);
  }
}