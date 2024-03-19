import { Component,Inject,OnInit, inject } from '@angular/core';

import { FormBuilder,FormGroup,Validator, Validators } from '@angular/forms';
import { MatDialogRef,MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Categoria } from 'src/app/Interfaces/categoria';
import { CategoriaService } from 'src/app/Services/categoria.service';
import { Producto } from 'src/app/Interfaces/producto';
import { ProductoService } from 'src/app/Services/producto.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';

@Component({
  selector: 'app-modal-producto',
  templateUrl: './modal-producto.component.html',
  styleUrls: ['./modal-producto.component.css']
})
export class ModalProductoComponent  implements OnInit{

  formularioProducto: FormGroup;
  tituloAccion: string= "Agregar";
  botonAccion: string = "Guardar";
  listaCategorias: Categoria[]= [];

  constructor(
    private  modalActual: MatDialogRef<ModalProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public datosProducto: Producto,
    private fb : FormBuilder,
    private _categoriaService : CategoriaService,
    private _productoService: ProductoService,
    private _utilidadService: UtilidadService
  ){

    this.formularioProducto= this.fb.group({
      nombre: ["",Validators.required],
      idCategoria: ["",Validators.required],
      precio: ["",Validators.required],
      stock: ["",Validators.required],
      esActivo: ["1",Validators.required],
    })

    if(datosProducto!=null){
      this.tituloAccion="Editar";
      this.botonAccion="Actualizar";
    }

    _categoriaService.lista().subscribe({
      next:(data) =>{
        if(data.status)
          this.listaCategorias=data.value
      },
      error: (e)=>{}
    })

  }

  ngOnInit(): void {
    
    this.formularioProducto.patchValue({
      nombre: this.datosProducto.nombre,
      idCategoria: this.datosProducto.idCategoria,
      precio: this.datosProducto.precio,
      stock: this.datosProducto.stock,
      esActivo: this.datosProducto.esActivo.toString()
    })

  }

  guardarEditarProducto(){

    const producto: Producto={

      idProducto: this.datosProducto==null? 0: this.datosProducto.idProducto,
      nombre: this.formularioProducto.value.nombre,
      idCategoria: this.formularioProducto.value.idCategoria,
      precio: this.formularioProducto.value.precio,
      descripcionCategoria: "",
      stock: this.formularioProducto.value.stock,
      esActivo: parseInt( this.formularioProducto.value.esActivo)
    }

    if(this.datosProducto == null){

      this._productoService.guardarProducto(producto).subscribe({
        next: (data) => {
          if(data.status){
            this._utilidadService.mostrarAlerta("Producto agregado exitosamente","Exito");
            this.modalActual.close("true"); // la variable modalActual hace referencia a este modal. Aca lo cierro y le devuelvo informacion al boton que lo llamo
          }
          else{
            this._utilidadService.mostrarAlerta("No se puedo guardar el producto","Error");
          }
        },
        error: (e)=>{}
      })
    }
    else{
      this._productoService.editar(producto).subscribe({
        next: (data) => {
          if(data.status){
            this._utilidadService.mostrarAlerta("Producto editado cor exito","Exito");
            this.modalActual.close("true"); // la variable modalActual hace referencia a este modal. Aca lo cierro y le devuelvo informacion al boton que lo llamo
          }
          else{
            this._utilidadService.mostrarAlerta("No se puedo editar el producto","Error");
          }
        },
        error: (e)=>{
          console.log("Error")
        }
      })
    }
  }

}
