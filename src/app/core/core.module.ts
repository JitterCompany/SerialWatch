import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SerialService } from './services/serial.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [SerialService]
})
export class CoreModule { }
