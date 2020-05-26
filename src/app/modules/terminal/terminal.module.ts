import { NgModule } from '@angular/core';

import { TextOutputComponent } from './text-output/text-output.component';
import { CommandBarComponent } from './command-bar/command-bar.component';
import { LineComponent } from './line/line.component';
import { TerminalComponent } from './terminal.component';
import { KeyboardShortcutsModule, KeyboardShortcutsHelpService } from 'ng-keyboard-shortcuts';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    TextOutputComponent,
    CommandBarComponent,
    LineComponent,
    TerminalComponent,
  ],
  imports: [
    SharedModule,
    KeyboardShortcutsModule.forRoot(),
  ],
  exports: [
    TerminalComponent
  ],
  providers: [
    KeyboardShortcutsHelpService
  ]
})
export class TerminalModule { }
