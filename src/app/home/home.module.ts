import { NgModule } from '@angular/core';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';

import { ToolbarComponent } from './toolbar/toolbar.component';

import { SettingsComponent } from './settings/settings.component';
import { PlotComponent } from './plot/plot.component';

import { TerminalModule } from '../modules/terminal/terminal.module'


@NgModule({
  declarations: [
    HomeComponent,
    ToolbarComponent,
    SettingsComponent,
    PlotComponent],
  imports: [
    SharedModule,
    HomeRoutingModule,
    TerminalModule,
  ],
  providers: []
})
export class HomeModule {}
