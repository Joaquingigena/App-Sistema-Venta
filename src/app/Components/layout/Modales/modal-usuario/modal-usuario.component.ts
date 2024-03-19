import { Component,Inject,OnInit, inject } from '@angular/core';

import { FormBuilder,FormGroup,Validator, Validators } from '@angular/forms';
import { MatDialogRef,MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Rol } from 'src/app/Interfaces/rol';
import { Usuario } from 'src/app/Interfaces/usuario';

import { RolService } from 'src/app/Services/rol.service';
import { UsuarioService } from 'src/app/Services/usuario.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';

@Component({
  selector: 'app-modal-usuario',
  templateUrl: './modal-usuario.component.html',
  styleUrls: ['./modal-usuario.component.css']
})
export class ModalUsuarioComponent implements OnInit {

  formularioUsuario: FormGroup;
  ocultarPassword: boolean= true;
  tituloAccion: string= "Agregar";
  botonAccion: string = "Guardar";
  listaRoles: Rol[]= [];

  constructor(
    private  modalActual: MatDialogRef<ModalUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public datosUsuario: Usuario,
    private fb : FormBuilder,
    private _rolService: RolService,
    private _UsuarioService: UsuarioService,
    private _utilidadService: UtilidadService
  ){
    this.formularioUsuario= this.fb.group({
      nombreCompleto: ["",Validators.required],
      correo: ["",Validators.required],
      idRol: ["",Validators.required],
      clave: ["",Validators.required],
      esActivo: ["1",Validators.required]
    });

    if(datosUsuario!=null){
      this.tituloAccion="Editar";
      this.botonAccion="Actualizar";
    }

    _rolService.lista().subscribe({
      next:(data) =>{
        if(data.status)
          this.listaRoles=data.value
      },
      error: (e)=>{}
    })

  }

  ngOnInit(): void {
    
    if(this.datosUsuario!= null){

      this.formularioUsuario.patchValue({
        nombreCompleto: this.datosUsuario.nombreCompleto,
        correo: this.datosUsuario.correo,
        idRol: this.datosUsuario.idRol,
        clave: this.datosUsuario.clave,
        esActivo: this.datosUsuario.esActivo.toString()
      })

    }
  }

  guardarEditarUsuario(){

    const usuario: Usuario={

      idUsuario: this.datosUsuario==null? 0: this.datosUsuario.idUsuario,
      nombreCompleto: this.formularioUsuario.value.nombreCompleto,
      correo: this.formularioUsuario.value.correo,
      idRol: this.formularioUsuario.value.idRol,
      rolDescripcion: "",
      clave: this.formularioUsuario.value.clave,
      esActivo: parseInt( this.formularioUsuario.value.esActivo)
    }

    if(this.datosUsuario == null){

      this._UsuarioService.guardarUsuario(usuario).subscribe({
        next: (data) => {
          if(data.status){
            this._utilidadService.mostrarAlerta("Usuario registrado exitosamente","Exito");
            this.modalActual.close("true"); // la variable modalActual hace referencia a este modal. Aca lo cierro y le devuelvo informacion al boton que lo llamo
          }
          else{
            this._utilidadService.mostrarAlerta("No se puedo guardar el usuario","Error");
          }
        },
        error: (e)=>{}
      })
    }
    else{
      this._UsuarioService.editar(usuario).subscribe({
        next: (data) => {
          if(data.status){
            this._utilidadService.mostrarAlerta("Usuario editado cor exito","Exito");
            this.modalActual.close("true"); // la variable modalActual hace referencia a este modal. Aca lo cierro y le devuelvo informacion al boton que lo llamo
          }
          else{
            this._utilidadService.mostrarAlerta("No se puedo editar el usuario","Error");
          }
        },
        error: (e)=>{
          console.log("Error")
        }
      })
    }
  }

}