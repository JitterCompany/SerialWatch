import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SerialService } from './services/serial.service';
import { SettingsService } from './services/settings.service';
import { DataService } from './services/data.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [SerialService, SettingsService, DataService]
})
export class CoreModule { }
