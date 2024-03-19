import { Component } from '@angular/core';

import { FormBuilder,FormGroup,Validator, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Sesion} from 'src/app/Interfaces/sesion';
import { UsuarioService } from 'src/app/Services/usuario.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';
import { Login } from 'src/app/Interfaces/login';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  formularioLogin: FormGroup;
  ocultarContrasena: boolean = true;
  mostrarLoading: boolean= false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _usuarioService: UsuarioService,
    private _utilidad: UtilidadService
  ){
    this.formularioLogin= fb.group({
      email: ["",Validators.required],
      password: ["",Validators.required]
    });
  }

  iniciarSesion(){

    this.mostrarLoading= true;

    const request: Login= {
      correo: this.formularioLogin.value.email,
      clave : this.formularioLogin.value.password
    }

    console.log(request.correo + request.clave + " Datos obtenidos del formulario");
    this._usuarioService.iniciarSesion(request).subscribe({

      next:(data)=>{ //Next nos devuelve la respuesta del metodo, sea o no exitoso
        if(data.status){
          console.log("Datos que devuelve el servicio " + data.value)
          this._utilidad.guardarUsuario(data.value);
          this.router.navigate(["pages"]);
        }
        else{
          this._utilidad.mostrarAlerta("No hubo coincidencias","Oops")
        }
      },
      complete: ()=> {
        this.mostrarLoading=false;
      },
      error: ()=>{
        this._utilidad.mostrarAlerta("Hubo un error","Oops")

      }

      
    })

  }


}
