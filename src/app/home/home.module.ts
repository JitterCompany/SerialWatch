import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import {SplitButtonModule} from 'primeng/splitbutton';
import {ToolbarModule} from 'primeng/toolbar';
import {DialogModule} from 'primeng/dialog';
import {RadioButtonModule} from 'primeng/radiobutton';
import { ToolbarComponent } from './toolbar/toolbar.component';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {ColorPickerModule} from 'primeng/colorpicker';
import {SelectButtonModule} from 'primeng/selectbutton';

import { TerminalComponent } from './terminal/terminal.component';
import { CommandBarComponent } from './command-bar/command-bar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsComponent } from './settings/settings.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LineComponent } from './line/line.component';

@NgModule({
  declarations: [HomeComponent, ToolbarComponent, TerminalComponent, CommandBarComponent, SettingsComponent, LineComponent],
  imports: [
    CommonModule,
    SharedModule,
    HomeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,

    // Primeng imports
    ButtonModule,
    InputTextModule,
    DropdownModule,
    ToolbarModule,
    AutoCompleteModule,
    ColorPickerModule,
    SelectButtonModule,
  ]
})
export class HomeModule {}
