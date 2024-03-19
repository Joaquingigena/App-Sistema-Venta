import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';

const routes: Routes = [
  { path: "" ,component: LoginComponent, pathMatch:"full"},
  {path: "login", component: LoginComponent, pathMatch: "full"},
  {path: "pages",loadChildren: ()=> import ("./Components/layout/layout.module").then(m => m.LayoutModule)}, //Cargo las otras paginas que ya huice el ruteo
  {path: "**", redirectTo:"login", pathMatch:"full"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
