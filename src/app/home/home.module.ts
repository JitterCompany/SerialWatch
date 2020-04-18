import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import {SplitButtonModule} from 'primeng/splitbutton';
// import {SharedModule as PSharedModule} from 'primeng/shared';
import {ToolbarModule} from 'primeng/toolbar';
import {DialogModule} from 'primeng/dialog';
import {RadioButtonModule} from 'primeng/radiobutton';
import { ToolbarComponent } from './toolbar/toolbar.component';
import {AutoCompleteModule} from 'primeng/autocomplete';
import { TerminalComponent } from './terminal/terminal.component';
import { CommandBarComponent } from './command-bar/command-bar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
  declarations: [HomeComponent, ToolbarComponent, TerminalComponent, CommandBarComponent, SettingsComponent],
  imports: [
    CommonModule,
    SharedModule,
    HomeRoutingModule,
    FormsModule,
    ReactiveFormsModule,

    // Primeng imports
    ButtonModule,
    InputTextModule,
    DropdownModule,
    SplitButtonModule,
    ToolbarModule,
    DialogModule,
    RadioButtonModule,
    AutoCompleteModule
  ]
})
export class HomeModule {}
