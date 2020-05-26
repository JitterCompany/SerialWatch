import { NgModule } from '@angular/core';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';

import { ToolbarComponent } from './toolbar/toolbar.component';

import { SettingsComponent } from './settings/settings.component';

import { TerminalModule } from '../modules/terminal/terminal.module'
import { PlotModule } from '../modules/plot/plot.module'


@NgModule({
  declarations: [
    HomeComponent,
    ToolbarComponent,
    SettingsComponent,
  ],
  imports: [
    SharedModule,
    HomeRoutingModule,
    TerminalModule,
    PlotModule,
  ],
  providers: []
})
export class HomeModule {}
