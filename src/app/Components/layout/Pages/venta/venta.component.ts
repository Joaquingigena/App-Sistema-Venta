import { Component } from '@angular/core';

import { FormBuilder,FormGroup,Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

import { ProductoService } from 'src/app/Services/producto.service';
import { VentaService } from 'src/app/Services/venta.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';

import { Producto } from 'src/app/Interfaces/producto';
import { Venta } from 'src/app/Interfaces/venta';
import { DetalleVenta } from 'src/app/Interfaces/detalle-venta';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-venta',
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.css']
})
export class VentaComponent {

listaProductos: Producto[]= [];
listaProductosFiltro: Producto[] = [];

listaProductoParaVenta: DetalleVenta[]=[];
bloquearBotonRegistrar: boolean=false;

productoSeleccionado!: Producto;
tipoPagoPorDefecto: string= "Efectivo";
totalPagar: number=0;

formularioProductoVenta: FormGroup;
columnasTabla: string[]= ["producto","cantidad","precio","total","accion"];
datosDetalleVenta= new MatTableDataSource(this.listaProductoParaVenta);

retornarProductoPorFiltro(busqueda:any):Producto[]{

  const valorBuscado= typeof busqueda == "string"? busqueda.toLocaleLowerCase() : busqueda.nombre.toLocaleLowerCase();

  return this.listaProductos.filter(item => item.nombre.toLocaleLowerCase().includes(valorBuscado));
}

constructor(
  private fb: FormBuilder,
  private _productoService: ProductoService,
  private _ventaService: VentaService,
  private _utilidadService: UtilidadService
){

  this.formularioProductoVenta= this.fb.group({
    producto: ["",Validators.required],
    cantidad: ["",Validators.required]
  });

  this._productoService.lista().subscribe({
    next: (data)=>{
      if(data.status){
        const lista= data.value as Producto[];

        this.listaProductos= lista.filter(p => p.esActivo == 1 && p.stock >0);

      }
    },
    error: (e)=>{}
  });

  this.formularioProductoVenta.get("producto")?.valueChanges.subscribe(value=>{
    this.listaProductosFiltro= this.retornarProductoPorFiltro(value);
  })
}

mostrarProducto(producto : Producto):string{

  return producto.nombre;
}

productoParaVenta(event :any){
  this.productoSeleccionado= event.option.value;
}

agregarProductoParaVenta(){

  const cantidad: number= this.formularioProductoVenta.value.cantidad;
  const precio: number= parseFloat(this.productoSeleccionado.precio);
  const total: number = cantidad*precio;

  this.totalPagar+= total;

  this.listaProductoParaVenta.push({

    idProducto: this.productoSeleccionado.idProducto,
    descripcionProducto: this.productoSeleccionado.nombre,
    cantidad: cantidad,
    precioTexto: String(precio.toFixed(2)),
    totalTexto: String(this.totalPagar.toFixed(2))
  });

  this.datosDetalleVenta= new MatTableDataSource(this.listaProductoParaVenta);

  this.formularioProductoVenta.patchValue({
    producto: "",
    cantidad: ""
  });
}

eliminarProducto(detalle : DetalleVenta){

  this.totalPagar -=parseFloat(detalle.totalTexto);
  this.listaProductoParaVenta= this.listaProductoParaVenta.filter(p => p.idProducto!= detalle.idProducto);

  this.datosDetalleVenta= new MatTableDataSource(this.listaProductoParaVenta);

}

registrarVenta(){

  if(this.listaProductoParaVenta.length >0){

    this.bloquearBotonRegistrar= true;

    const request :Venta ={
      tipoPago : this.tipoPagoPorDefecto,
      totalTexto : String(this.totalPagar.toFixed(2)),
      detalleVenta: this.listaProductoParaVenta

    }


    this._ventaService.registrar(request).subscribe({
      next: (data)=>{
        if(data.status){
          this.totalPagar= 0.00;
          this.listaProductoParaVenta= [];
          this.datosDetalleVenta= new MatTableDataSource(this.listaProductoParaVenta);

          Swal.fire({
            icon: "success",
            title: "Venta registrada",
            text: `Numero de venta: ${data.value.numeroDocumento}`
          });
        }
        else{
          this._utilidadService.mostrarAlerta("No se puedo registrar la venta","Oops")
        }
      },
      complete: ()=>{
        this.bloquearBotonRegistrar=false;
      },
      error: (e)=>{}
    })
  }
}

}
