import { Component,OnInit,AfterViewInit,ViewChild } from '@angular/core';

import { FormBuilder,FormGroup,Validator, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import * as moment from 'moment';
import { MAT_DATE_FORMATS } from '@angular/material/core';

import { ModalDetalleVentaComponent } from '../../Modales/modal-detalle-venta/modal-detalle-venta.component';

import { Venta } from 'src/app/Interfaces/venta';
import { VentaService } from 'src/app/Services/venta.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';

export const MY_DATA_FORMATS={
  parse:{
    dateInput:"DD/MM/YYYY"
  },
  display:{
    dateInput:"DD/MM/YYYY",
    monthYearLabel: "MMMM YYYY"
  }

}


@Component({
  selector: 'app-historial-venta',
  templateUrl: './historial-venta.component.html',
  styleUrls: ['./historial-venta.component.css'],
  providers:[
    {provide:MAT_DATE_FORMATS,useValue: MY_DATA_FORMATS }
  ]
})
export class HistorialVentaComponent implements OnInit,AfterViewInit {

  formularioBusqueda: FormGroup;
  opcionesBusqueda: any[]= [
    {value:"fecha" , descripcion: "Por fechas"},
    {value:"numero" , descripcion: "Numero de venta"}
  ];

  columnasTabla: string[]= ["fechaRegistro","numeroDocumento","tipoPago","total","accion"];
  dataInicio: Venta[]=[];
  dataListaVentas= new MatTableDataSource(this.dataInicio);
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private _ventaService: VentaService,
    private _utilidadService: UtilidadService
  ){

    this.formularioBusqueda= fb.group({
      buscarPor: ["fecha"],
      numero: [""],
      fechaInicio:[""],
      fechaFin:[""]  
    });


    //Este evento se dispara cuando cambia el formulario
    this.formularioBusqueda.get("buscarPor")?.valueChanges.subscribe(value=>{
      this.formularioBusqueda.patchValue({
        numero:"",
        fechaInicio:"",
        fechaFin:""
      })
    })
  }

  ngAfterViewInit(): void {
    this.dataListaVentas.paginator= this.paginacionTabla;
    
  }
  
  aplicarFiltroTabla(event:Event){
  
    const filtroValue= (event.target as HTMLInputElement).value;
  
    this.dataListaVentas.filter= filtroValue.trim().toLocaleLowerCase();
  
  }

  ngOnInit(): void {
    
  }

  buscarVentas(){
    let fechaInicio="";
    let fechaFin= "";

   if( this.formularioBusqueda.value.buscarPor === "fecha"){
    fechaInicio = moment(this.formularioBusqueda.value.fechaInicio).format("DD/MM/YYYY");
    fechaFin = moment(this.formularioBusqueda.value.fechaFin).format("DD/MM/YYYY");

    if(fechaFin == "Invalid date" || fechaInicio == "Invalid date"){

      this._utilidadService.mostrarAlerta("Debe ingresar fechas validas","Oops");
      return;
    }
   }

   this._ventaService.historial(
    this.formularioBusqueda.value.buscarPor,
    this.formularioBusqueda.value.numero,
    fechaInicio,
    fechaFin
   ).subscribe({
    next: (data)=>{
      if(data.status){
        this.dataListaVentas= data.value;
      }
      else{
        this._utilidadService.mostrarAlerta("No se encontraron datos","Opps");
      }
    },
    error:(e)=>{
      console.log(this.formularioBusqueda.value.numero)
      console.log("error");
    }
   })
  }

  verDetalleVenta( venta:Venta){

    this.dialog.open(ModalDetalleVentaComponent,{
      data: venta,
      disableClose:true,
      width: "700px"
    })
  }

}
