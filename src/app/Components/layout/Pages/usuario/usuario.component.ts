import { Component,OnInit,AfterViewInit,ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { ModalUsuarioComponent } from '../../Modales/modal-usuario/modal-usuario.component';
import { Usuario } from 'src/app/Interfaces/usuario';
import { UsuarioService } from 'src/app/Services/usuario.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit,AfterViewInit {

columnaTabla: string[] = ["nombreCompleto","Correo","rolDescripcion","Estado","Acciones"];
dataInicio: Usuario[]= []
dataListaUsuarios=new MatTableDataSource(this.dataInicio);
@ViewChild(MatPaginator) paginacionTabla!: MatPaginator;

constructor(
  private dialog:MatDialog,
  private _usuarioService:UsuarioService,
  private _utilidadService: UtilidadService
){}

obtenerUsuarios(){
this._usuarioService.lista().subscribe({
  next:(data)=>{
    if(data.status){
      this.dataListaUsuarios.data= data.value;
    }
    else{
      this._utilidadService.mostrarAlerta("No se encontraron usuarios","Oops!");
    }
  },
  error:(e)=>{}
})
}

ngOnInit(): void {
  this.obtenerUsuarios();
}

ngAfterViewInit(): void {
  this.dataListaUsuarios.paginator= this.paginacionTabla;
}

aplicarFiltroTabla(event:Event){

  const filtroValue= (event.target as HTMLInputElement).value;

  this.dataListaUsuarios.filter= filtroValue.trim().toLocaleLowerCase();

}

nuevoUsuario(){

  this.dialog.open(ModalUsuarioComponent,{
    disableClose: true
  }).afterClosed().subscribe(resultado =>{
    if(resultado === "true") this.obtenerUsuarios();
  });
}

editarUsuario(usuario:Usuario){

  this.dialog.open(ModalUsuarioComponent,{
    disableClose: true,
    data: usuario
  }).afterClosed().subscribe(resultado =>{
    if(resultado === "true") this.obtenerUsuarios();
  });
}

eliminarUsuario(usuario: Usuario){

  Swal.fire({

    title:"Desea eliminar el usuario?",
    text: usuario.nombreCompleto,
    icon: "warning",
    confirmButtonColor: "#3085d6",
    confirmButtonText: "Si,eliminar",
    showCancelButton: true,
    cancelButtonColor: "#d33",
    cancelButtonText: "No, volver"

  }).then((resultado)=>{

    if(resultado.isConfirmed){

      this._usuarioService.eliminar(usuario.idUsuario).subscribe({
        next:(data)=>
        {
          if(data.status){
            this._utilidadService.mostrarAlerta("Usuario eliminado exitosamente","Exito");
            this.obtenerUsuarios();
          }
          else {
            this._utilidadService.mostrarAlerta("No se pudo eliminar el usuario","Error");
          }
        },
        error: (e)=>{}
      })
    }
  })

  }
}


