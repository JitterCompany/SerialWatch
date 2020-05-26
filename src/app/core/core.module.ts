import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SerialService } from './services/serial.service';
import { SettingsService } from './services/settings.service';
import { DispatchService } from './services/dispatch.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [SerialService, SettingsService, DispatchService]
})
export class CoreModule { }
